import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crossOriginIsolation()],
  // Add ts files
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
});
