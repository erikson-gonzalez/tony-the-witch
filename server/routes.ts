import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import {
  registerPublicContentRoutes,
  registerAuthRoutes,
  registerAdminRoutes,
} from "./routes-admin";

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
  app.post(api.inquiries.create.path, async (req, res) => {
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const inquiry = await storage.createInquiry(input);
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
