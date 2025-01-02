import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      tsDecorators: true,
    }),
  ],
  base: "/react-practice-motion-challenge",
  server: {
    port: 3000,
  },
});
