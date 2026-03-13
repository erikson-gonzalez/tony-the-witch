import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { getAdminUserByUsername } from "./storage-admin";
import { pool } from "./db";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "ttw-admin-secret-change-in-production";

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

  passport.serializeUser((user: Express.User, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: Express.User, done) => {
    done(null, user);
  });
}

export function getSessionMiddleware() {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET must be set in production");
  }

  const PgSession = connectPg(session);

  return session({
    store: new PgSession({
      pool,
      createTableIfMissing: false,
      // Table SQL provided inline to avoid file read issues in serverless bundles.
      // Run this SQL manually if the "session" table doesn't exist:
      // CREATE TABLE IF NOT EXISTS "session" ("sid" VARCHAR NOT NULL PRIMARY KEY, "sess" JSON NOT NULL, "expire" TIMESTAMP(6) NOT NULL); CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
