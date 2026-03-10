import { build } from "esbuild";

// Bundle api/index.ts into a single CJS file for Vercel.
// CJS avoids @vercel/node's ESM re-transpilation which causes
// duplicate identifier errors.
await build({
  entryPoints: ["api/_handler.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: "api/index.js",
  external: ["pg-native"],
  logLevel: "info",
});
