import { build } from "esbuild";

// Bundle api/index.ts into a single file that Vercel can run
// without needing to resolve ../server/ or ../shared/ imports.
// Overwrites api/index.ts so @vercel/node picks it up as the entry.
await build({
  entryPoints: ["api/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "api/index.ts",
  allowOverwrite: true,
  external: ["pg-native"],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  logLevel: "info",
});
