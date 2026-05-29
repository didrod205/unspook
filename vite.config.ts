import { defineConfig } from "vite";

// Builds the web app (web/) into docs/ for free GitHub Pages hosting.
// `base: "./"` keeps asset paths relative so it works under a project subpath.
export default defineConfig({
  root: "web",
  base: "./",
  build: {
    outDir: "../docs",
    emptyOutDir: true,
  },
  server: {
    // allow importing the built library from ../dist during `vite` dev
    fs: { allow: [".."] },
  },
});
