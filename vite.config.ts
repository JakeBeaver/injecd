// vite.config.ts
/// <reference types="vitest" />
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "injecd",
      fileName: "index",
    },
  },
  plugins: [dts()],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
