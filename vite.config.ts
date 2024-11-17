import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      // workbox: {
      //   maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB
      //   globPatterns: ["**/*"],
      // },
      devOptions: {
        enabled: true,
        // type: "module",
      },
      // add this to cache all the imports
      // workbox: {
      //   globPatterns: ["**/*"],
      // },
      // add this to cache all the
      // static assets in the public folder
      includeAssets: ["**/*"],
      registerType: "autoUpdate",
      manifest: {
        short_name: "Expenses",
        name: "Expenses",
        icons: [
          {
            src: "dolar.png",
            sizes: "48x48 72x72 96x96 128x128 192x192 512x512",
            type: "image/png",
          },
        ],
        // start_url: ".",
        start_url: "/",
        display: "standalone",
        theme_color: "#7C9B6D",
        background_color: "#7C9B6D",
      },
    }),
  ],
});
