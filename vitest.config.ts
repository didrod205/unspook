import { defineConfig } from "vitest/config";

// Separate from vite.config.ts (which sets root: "web" for the app build),
// so the test runner scans the project root, not the web app.
export default defineConfig({
  test: {
    root: ".",
    include: ["test/**/*.test.ts"],
  },
});
