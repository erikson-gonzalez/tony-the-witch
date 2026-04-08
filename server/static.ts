import express, { type Express, type Response } from "express";
import fs from "fs";
import path from "path";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function setCacheHeaders(res: Response, filePath: string) {
  // Vite emits hashed filenames into /assets — safe to cache forever.
  // index.html (and any other top-level file) must never be cached so the
  // shell always points at the latest hashed bundles.
  if (/\/assets\//.test(filePath)) {
    res.setHeader(
      "Cache-Control",
      `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
    );
  } else {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  }
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(
    express.static(distPath, {
      setHeaders: (res, filePath) => setCacheHeaders(res, filePath),
    }),
  );

  // fall through to index.html if the file doesn't exist
  app.use("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
