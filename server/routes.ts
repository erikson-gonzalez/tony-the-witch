import type { Express } from "express";
import type { Server } from "http";
import rateLimit from "express-rate-limit";
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

const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes. Intentá de nuevo en unos minutos." },
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

  return httpServer;
}
