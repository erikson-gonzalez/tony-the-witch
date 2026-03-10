import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import passport from "passport";
import { createServer } from "http";
import { setupPassport, getSessionMiddleware } from "../server/auth";
import { registerRoutes } from "../server/routes";

const app = express();

// Body parsing
app.use(
  express.json({
    verify: (req: Request, _res, buf) => {
      (req as unknown as { rawBody: unknown }).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// Session & Auth
setupPassport();
app.use(getSessionMiddleware());
app.use(passport.initialize());
app.use(passport.session());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      console.log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Register all routes (public content, auth, admin CRUD, inquiries)
// registerRoutes requires an httpServer param but only returns it — it's not
// used for WebSocket binding. We create a throwaway server object.
const dummyServer = createServer(app);
await registerRoutes(dummyServer, app);

// Global error handler
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

export default app;
