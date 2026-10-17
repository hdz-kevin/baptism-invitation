import { createReadStream, existsSync } from "node:fs";
import { join, normalize } from "node:path";
import { defineConfig } from "vite";

const imagesDir = join(process.cwd(), "images");

export default defineConfig({
  base: "./",
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/main.js",
      output: {
        entryFileNames: "app.js",
      },
    },
  },
  plugins: [
    {
      name: "invitation-dev",
      apply: "serve",
      transformIndexHtml(html) {
        return html.replace("./dist/app.js?v=5", "./src/main.js");
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split("?")[0] ?? "";
          if (!url.startsWith("/images/")) return next();
          const file = normalize(join(imagesDir, decodeURIComponent(url.slice("/images/".length))));
          if (!file.startsWith(imagesDir) || !existsSync(file)) return next();
          res.setHeader("Content-Type", "image/jpeg");
          createReadStream(file).pipe(res);
        });
      },
    },
  ],
});
