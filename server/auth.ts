import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getAdminUserByUsername, getAdminUserById } from "./storage-admin";
import { pool } from "./db";

// Augment express-session so TS knows about our custom field
declare module "express-session" {
  interface SessionData {
    csrfToken?: string;
  }
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is required. Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return secret;
}

declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
    }
  }
}

export function setupPassport() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await getAdminUserByUsername(username);
        if (!user) return done(null, false, { message: "Invalid credentials" });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return done(null, false, { message: "Invalid credentials" });

        return done(null, { id: user.id, username: user.username });
      } catch (err) {
        return done(err);
      }
    })
  );

  // Store only the user id in the session. The user is re-fetched from the
  // database on every request so revoked admins lose access immediately
  // instead of having to wait for the session to expire.
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: unknown, done) => {
    try {
      if (typeof id !== "number" || !Number.isInteger(id) || id <= 0) {
        return done(null, false);
      }
      const user = await getAdminUserById(id);
      if (!user) return done(null, false);
      // Strip the password hash before exposing on req.user
      done(null, { id: user.id, username: user.username });
    } catch (err) {
      done(err);
    }
  });
}

export function getSessionMiddleware() {
  const PgSession = connectPg(session);

  return session({
    store: new PgSession({
      pool,
      createTableIfMissing: false,
      // Table SQL provided inline to avoid file read issues in serverless bundles.
      // Run this SQL manually if the "session" table doesn't exist:
      // CREATE TABLE IF NOT EXISTS "session" ("sid" VARCHAR NOT NULL PRIMARY KEY, "sess" JSON NOT NULL, "expire" TIMESTAMP(6) NOT NULL); CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    }),
    secret: getSessionSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    },
  });
}

/** Middleware: require authenticated admin. Returns 401 if not logged in. */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

/**
 * Returns the per-session CSRF token, creating it lazily on first call.
 * The token is stored in the session (server-side) and the client receives
 * it via the login/me response payload — never via a cookie, so XSS-stolen
 * session cookies still can't trivially submit forged mutations.
 */
export function getOrCreateCsrfToken(req: Request): string {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  return req.session.csrfToken;
}

/**
 * Middleware: enforce that the request carries a matching CSRF token in the
 * X-CSRF-Token header. Apply after requireAdmin so unauthenticated requests
 * get a 401, not a 403.
 */
export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const sessionToken = req.session.csrfToken;
  const headerToken = req.get("X-CSRF-Token");
  if (!sessionToken || !headerToken) {
    return res.status(403).json({ message: "CSRF token missing" });
  }
  const a = Buffer.from(sessionToken);
  const b = Buffer.from(headerToken);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(403).json({ message: "CSRF token invalid" });
  }
  next();
}
