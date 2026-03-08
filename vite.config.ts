import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "https://api.sbs-brokerz.com",
        changeOrigin: true,
        secure: false,
        headers: {
          Origin: "https://sbs-gemini-wap.vercel.app",
        },
      },
    },
  },
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
