import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/safe-api": {
        target: "https://api.safe.global/tx-service",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/safe-api/, ""),
      },
    },
  },
});
