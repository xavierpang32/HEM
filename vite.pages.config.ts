import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/** Static closet for GitHub Pages at https://xavierpang32.github.io/HEM/app/ */
export default defineConfig({
  root: fileURLToPath(new URL("./pages-site", import.meta.url)),
  base: "/HEM/app/",
  publicDir: fileURLToPath(new URL("./public", import.meta.url)),
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./docs/app", import.meta.url)),
    emptyOutDir: true,
  },
});
