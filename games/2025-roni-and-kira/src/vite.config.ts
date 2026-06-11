import { defineConfig } from "vite";
import * as singleFile from "vite-plugin-singlefile"; // v2.x exports as named
// import classShortener from './scripts/plugin-class-shortener.mjs';

// @ts-ignore
export default defineConfig(({ command, mode }) => ({
  base: "./",
  build: {
    target: "es2020",
    minify: "terser",
    terserOptions: {
      ecma: 2020,
      module: true,
      compress: {
        passes: 3,
        // TODO: poner en true
        drop_console: true,
        drop_debugger: true,
        booleans_as_integers: true,
      },
      mangle: {
        properties: {
          // regex: /^_/, // enable if you want to mangle private-like props
        },
      },
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    // classShortener(),
    singleFile.viteSingleFile({ removeViteModuleLoader: true }), // adapt to v2 API
  ],
  server: {
    open: true,
  },
}));
