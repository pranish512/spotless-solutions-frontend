import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Fallback dev proxy: if VITE_API_BASE_URL is not set, proxy /api to
  // the local FastAPI backend so the app works out of the box.
  const useProxy = !env.VITE_API_BASE_URL;

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
      ...(useProxy && {
        proxy: {
          "/api": {
            target: "http://localhost:8000",
            changeOrigin: true,
          },
        },
      }),
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
