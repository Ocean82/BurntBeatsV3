import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/public",
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'burnt-beats-app.js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
});