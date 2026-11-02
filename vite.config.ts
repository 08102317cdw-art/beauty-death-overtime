import { defineConfig } from "vite";

// GitHub Pages project site: https://08102317cdw-art.github.io/beauty-death-overtime/
const base = "/beauty-death-overtime/";

export default defineConfig({
  base,
  server: { host: "0.0.0.0", port: 5173 },
  preview: { host: "0.0.0.0", port: 4173 },
});
