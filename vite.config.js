import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// IMPORTANT: change "rm-dashboard" below to your GitHub repo name.
// If your repo is https://github.com/yourname/real-madrid-analytics,
// this should be "/real-madrid-analytics/".
export default defineConfig({
  plugins: [react()],
  base: "/rm-dashboard/",
});
