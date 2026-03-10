import { build } from "esbuild";
import { mkdir, writeFile, cp } from "fs/promises";

// 1. Bundle the API handler into a single ESM file
await build({
  entryPoints: ["api/_handler.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: ".vercel/output/functions/api.func/index.mjs",
  external: ["pg-native"],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  logLevel: "info",
});

// 2. Write function config (tells Vercel how to run it)
await writeFile(
  ".vercel/output/functions/api.func/.vc-config.json",
  JSON.stringify({
    runtime: "nodejs20.x",
    handler: "index.mjs",
    launcherType: "Nodejs",
  })
);

// 3. Copy static frontend files
await cp("dist/public", ".vercel/output/static", { recursive: true });

// 4. Write the top-level output config (routing)
await writeFile(
  ".vercel/output/config.json",
  JSON.stringify({
    version: 3,
    routes: [
      { src: "/api/(.*)", dest: "/api" },
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" },
    ],
  })
);

console.log("Build output ready at .vercel/output/");
