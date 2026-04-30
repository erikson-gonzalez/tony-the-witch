import type { Express } from "express";
import type { Server } from "http";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { storage } from "./storage";
import { api } from "../shared/routes";
import { z } from "zod";
import {
  registerPublicContentRoutes,
  registerAuthRoutes,
  registerAdminRoutes,
} from "./routes-admin";
import {
  sendInquiryNotificationToAdmin,
  sendInquiryConfirmationToCustomer,
  sendOrderNotificationToAdmin,
  sendOrderConfirmationToCustomer,
} from "./email";
import {
  getSiteConfig,
  getProductById,
  createOrder,
  getOrderById,
  getOrderByNumber,
  updateOrderProof,
  StockError,
} from "./storage-admin";
import { uploadMedia } from "./cloudinary";
import {
  createOrFindActivePayment,
  PaymentNotAllowedError,
} from "./payments-storage";
import { getOnvoEnv, isOnvoConfigured, OnvoError } from "./onvo";

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes. Intentá de nuevo en unos minutos." },
});

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes. Intentá de nuevo en unos minutos." },
});

const proofUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos de subida. Intentá de nuevo más tarde." },
});

const proofUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Public content API (frontend consumes this)
  registerPublicContentRoutes(app);

  // Auth (login, logout, me)
  registerAuthRoutes(app);

  // Protected admin CRUD
  registerAdminRoutes(app);

  // Contact form
  app.post(api.inquiries.create.path, inquiryLimiter, async (req, res) => {
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const inquiry = await storage.createInquiry(input);

      // Fire-and-forget email notifications
      sendInquiryNotificationToAdmin(inquiry).catch((err) =>
        console.error("[email] Unexpected:", err instanceof Error ? err.message : "Unknown error")
      );
      sendInquiryConfirmationToCustomer(inquiry).catch((err) =>
        console.error("[email] Unexpected:", err instanceof Error ? err.message : "Unknown error")
      );

      res.status(201).json(inquiry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create order
  app.post(api.orders.create.path, orderLimiter, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);

      // Server-side price verification
      const config = await getSiteConfig();
      const usdToCrc = config.pricing?.usdToCrc ?? 500;

      let subtotalUsd = 0;
      for (const item of input.items) {
        if (item.isReservation) {
          // Reservations use site config price
          const expectedPrice = Math.round(config.reservation.price * 100);
          if (item.priceUsd !== expectedPrice) {
            return res.status(400).json({
              message: `Precio incorrecto para "${item.name}"`,
              field: "items",
            });
          }
        } else {
          const product = await getProductById(item.productId);
          if (!product) {
            return res.status(400).json({
              message: `Producto no encontrado: "${item.name}"`,
              field: "items",
            });
          }
          const expectedPrice = Math.round(Number(product.price) * 100);
          if (item.priceUsd !== expectedPrice) {
            return res.status(400).json({
              message: `Precio incorrecto para "${item.name}"`,
              field: "items",
            });
          }
        }
        subtotalUsd += item.priceUsd * item.quantity;
      }

      // Compute shipping in CRC
      const shippingCrc = input.shippingAddress
        ? getShippingCost(input.shippingZone, input.shippingMethod)
        : 0;

      // Total USD = subtotal (shipping is in CRC, added to CRC total only)
      const totalUsd = subtotalUsd;
      const totalCrc = Math.round(totalUsd * usdToCrc / 100) + shippingCrc;

      const order = await createOrder({
        ...input,
        subtotalUsd,
        shippingCrc,
        totalUsd,
        totalCrc,
        usdToCrcRate: usdToCrc,
      });

      // Defer emails for ONVO card orders until the webhook confirms payment;
      // otherwise customers/admin get a "new order" email for an unpaid intent.
      if (order.paymentMethod !== "onvo_card") {
        sendOrderNotificationToAdmin(order).catch((err) =>
          console.error("[email] Unexpected:", err instanceof Error ? err.message : "Unknown error")
        );
        sendOrderConfirmationToCustomer(order).catch((err) =>
          console.error("[email] Unexpected:", err instanceof Error ? err.message : "Unknown error")
        );
      }

      res.status(201).json({
        id: order.id,
        orderNumber: order.orderNumber,
        totalUsd: order.totalUsd,
        totalCrc: order.totalCrc,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      if (err instanceof StockError) {
        return res.status(409).json({
          message: err.message,
          field: "items",
          productId: err.productId,
          available: err.available,
        });
      }
      console.error("POST /api/orders:", err instanceof Error ? err.message : "Unknown error");
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload proof image (public, no auth)
  app.post(
    "/api/upload/proof",
    proofUploadLimiter,
    proofUpload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file provided" });
        }

        const mime = req.file.mimetype;
        const allowed = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "application/pdf",
        ];
        if (!allowed.includes(mime)) {
          return res
            .status(400)
            .json({ message: "Solo se aceptan imágenes (JPEG, PNG, WebP) o PDF" });
        }

        const result = await uploadMedia(req.file.buffer, {
          folder: "sinpe-proofs",
          resourceType: "image",
        });

        res.json(result);
      } catch (err) {
        console.error("POST /api/upload/proof:", err instanceof Error ? err.message : "Unknown error");
        res.status(500).json({ message: "Upload failed" });
      }
    },
  );

  // Re-upload proof by order number (for public status page)
  // Registered before /:id/proof to prevent Express matching "TTW-0001" as :id
  app.post("/api/orders/:orderNumber/reupload", orderLimiter, async (req, res) => {
    try {
      const orderNum = Array.isArray(req.params.orderNumber) ? req.params.orderNumber[0] : req.params.orderNumber;
      const email = req.body.email as string | undefined;
      const order = await getOrderByNumber(orderNum ?? "");
      // Same 404 for not found and email mismatch to prevent enumeration
      if (!order || !email || order.customerEmail.toLowerCase() !== email.toLowerCase()) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }

      if (order.paymentStatus !== "pending" && order.paymentStatus !== "rejected") {
        return res
          .status(400)
          .json({ message: "No se puede subir comprobante para este pedido" });
      }

      const input = api.orders.uploadProof.input.parse(req.body);
      const updated = await updateOrderProof(
        order.id,
        input.proofImageUrl,
        input.transactionRef,
      );

      if (updated) {
        sendOrderNotificationToAdmin(updated).catch((err) =>
          console.error("[email] Unexpected:", err instanceof Error ? err.message : "Unknown error")
        );
      }

      res.json({ paymentStatus: updated!.paymentStatus });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("POST /api/orders/:orderNumber/reupload:", err instanceof Error ? err.message : "Unknown error");
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit proof for an order (by numeric ID)
  app.post("/api/orders/:id/proof", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

      const input = api.orders.uploadProof.input.parse(req.body);

      const order = await getOrderById(id);
      if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

      if (order.paymentStatus !== "pending" && order.paymentStatus !== "rejected") {
        return res
          .status(400)
          .json({ message: "No se puede subir comprobante para este pedido" });
      }

      const updated = await updateOrderProof(
        id,
        input.proofImageUrl,
        input.transactionRef,
      );

      // Notify admin that proof was uploaded
      if (updated) {
        sendOrderNotificationToAdmin(updated).catch((err) =>
          console.error("[email] Unexpected:", err instanceof Error ? err.message : "Unknown error")
        );
      }

      res.json({ paymentStatus: updated!.paymentStatus });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("POST /api/orders/:id/proof:", err instanceof Error ? err.message : "Unknown error");
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Public order status (requires email verification to prevent enumeration)
  const orderStatusLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Demasiados intentos. Intentá de nuevo en unos minutos." },
  });

  // ONVO Pay: create or reuse a payment intent for an existing order.
  app.post(
    api.payments.createOnvoIntent.path,
    orderLimiter,
    async (req, res) => {
      try {
        const input = api.payments.createOnvoIntent.input.parse(req.body);

        if (!isOnvoConfigured()) {
          return res
            .status(403)
            .json({ message: "ONVO Pay is not enabled on this server" });
        }

        const config = await getSiteConfig();
        if (config.onvo?.enabled !== true) {
          return res
            .status(403)
            .json({ message: "ONVO Pay is currently disabled" });
        }

        const orderRow = await getOrderById(input.orderId);
        // Same 404 whether order missing or email mismatch (anti-enumeration).
        if (
          !orderRow ||
          orderRow.customerEmail.toLowerCase() !== input.customerEmail.toLowerCase()
        ) {
          return res.status(404).json({ message: "Pedido no encontrado" });
        }

        const { payment } = await createOrFindActivePayment(input.orderId);

        if (!payment.providerIntentId) {
          return res.status(500).json({ message: "Intent missing provider id" });
        }

        const env = getOnvoEnv();
        return res.json({
          paymentIntentId: payment.providerIntentId,
          publishableKey: env.ONVO_PUBLISHABLE_KEY,
          status: payment.state,
        });
      } catch (err) {
        if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: err.errors[0].message,
            field: err.errors[0].path.join("."),
          });
        }
        if (err instanceof PaymentNotAllowedError) {
          const status = err.reason === "order_not_found" ? 404 : 409;
          return res.status(status).json({ message: err.message, reason: err.reason });
        }
        if (err instanceof OnvoError) {
          console.error(
            `POST /api/payments/onvo/intents: ONVO ${err.code} ${err.httpStatus} ${err.providerMessage}`,
          );
          return res
            .status(502)
            .json({ message: "Could not contact payment provider", code: err.code });
        }
        console.error(
          "POST /api/payments/onvo/intents:",
          err instanceof Error ? err.message : "Unknown error",
        );
        return res.status(500).json({ message: "Internal server error" });
      }
    },
  );

  app.get("/api/orders/:orderNumber/status", orderStatusLimiter, async (req, res) => {
    try {
      const email = req.query.email as string | undefined;
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email requerido" });
      }

      const orderNum = Array.isArray(req.params.orderNumber) ? req.params.orderNumber[0] : req.params.orderNumber;
      const order = await getOrderByNumber(orderNum ?? "");
      // Return same 404 whether order doesn't exist or email doesn't match (prevents enumeration)
      if (!order || order.customerEmail.toLowerCase() !== email.toLowerCase()) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }

      const firstName = order.customerName.split(" ")[0];

      res.json({
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt.toISOString(),
        reviewedAt: order.reviewedAt?.toISOString() ?? null,
        customerName: firstName,
        items: order.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      });
    } catch (err) {
      console.error("GET /api/orders/:orderNumber/status:", err instanceof Error ? err.message : "Unknown error");
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

function getShippingCost(
  zone?: string,
  method?: string,
): number {
  if (!zone || !method) return 0;
  if (zone === "GAM" && method === "STANDARD") return 2500;
  if (zone === "GAM" && method === "NEXT_DAY") return 5000;
  if (zone === "NON_GAM" && method === "STANDARD") return 3500;
  return 0;
}
