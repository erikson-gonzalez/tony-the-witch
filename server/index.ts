import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import passport from "passport";
import { registerRoutes } from "./routes";
import { setupPassport, getSessionMiddleware } from "./auth";
import { serveStatic } from "./static";
import { initEmail } from "./email";
import { pool } from "./db";
import { createServer } from "http";

const app = express();
app.set("trust proxy", 1);
const httpServer = createServer(app);

const isDev = process.env.NODE_ENV !== "production";

// Security headers via helmet — applied early before any routes
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: isDev
          ? ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
          : ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://res.cloudinary.com",
          "https://images.unsplash.com",
        ],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        fontSrc: [
          "'self'",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
        ],
        connectSrc: isDev
          ? ["'self'", "ws:", "wss:"]
          : ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: !isDev,
  }),
);

app.use(compression());

// Dev-only CORS — allows the audit-verification page (file://) to hit the API
if (isDev) {
  app.use((req, res, next) => {
    const origin = req.headers.origin ?? "null";
    res.header("Access-Control-Allow-Origin", origin === "null" ? "*" : origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,X-CSRF-Token");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
}

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Health check — registered before auth/sessions so it never hits the DB unless asked.
// Use ?deep=1 to verify the database connection.
app.get("/api/health", async (req, res) => {
  if (req.query.deep === "1") {
    const start = Date.now();
    try {
      await pool.query("SELECT 1");
      const ms = Date.now() - start;
      if (ms > 2000) {
        return res.status(503).json({ ok: false, db: "slow", ms });
      }
      return res.json({ ok: true, db: "ok", ms, ts: Date.now() });
    } catch (err) {
      return res.status(503).json({
        ok: false,
        db: "error",
        message: err instanceof Error ? err.message : "unknown",
      });
    }
  }
  res.json({ ok: true, ts: Date.now() });
});

// Email service
initEmail();

// Session & Auth (required for /api/admin/*)
setupPassport();
app.use(getSessionMiddleware());
app.use(passport.initialize());
app.use(passport.session());

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as { status?: number; statusCode?: number; message?: string };
    const status = error.status ?? error.statusCode ?? 500;
    const message = error.message ?? "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
