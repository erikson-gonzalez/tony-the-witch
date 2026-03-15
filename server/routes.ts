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
} from "./email";
import {
  getSiteConfig,
  getProductById,
  createOrder,
  getOrderById,
  getOrderByNumber,
  updateOrderProof,
} from "./storage-admin";
import { uploadMedia } from "./cloudinary";

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
          const expectedPrice = Math.round(product.price * 100);
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
      console.error("POST /api/orders:", err instanceof Error ? err.message : "Unknown error");
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Upload proof image (public, no auth)
  app.post(
    "/api/upload/proof",
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

  // Submit proof for an order
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

  // Public order status
  app.get("/api/orders/:orderNumber/status", async (req, res) => {
    try {
      const order = await getOrderByNumber(req.params.orderNumber);
      if (!order) return res.status(404).json({ message: "Pedido no encontrado" });

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
