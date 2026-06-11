import { defineConfig, normalizePath, Terser } from "vite";
import type { Plugin } from "vite";
import path from "node:path";
import url from "node:url";
import { buildIndexModuleNew } from "./tools/compiler/compiler";
import { advzipPlugin } from "./tools/advzip";
import { ectPlugin } from "./tools/etc";
import { roadrollerPlugin } from "./tools/roadroller";

const getTerserOptions = (command: string): Terser.MinifyOptions => {
  if (command === "build") {
    return {
      ecma: 2020,
      module: true,
      toplevel: true,
      parse: {
        html5_comments: false,
        shebang: false,
      },
      format: {
        comments: false,
        shebang: false,
        ascii_only: true,
        quote_style: 1,
        // keep_numbers: true,
      },
      compress: {
        dead_code: true,
        drop_debugger: true,
        drop_console: true,
        sequences: 1000000,
        passes: 1000000,
        inline: 3,
        pure_new: true,
        pure_getters: true,
        // unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_math: true,
        // comparisons: true,
        expression: true,
        hoist_funs: true,
        hoist_vars: false,
        toplevel: true,
        module: true,
      },
      mangle: {
        module: true,
        toplevel: true,
        properties: {
          keep_quoted: "strict",
          regex: /^_(private|internal)_/,
        },
      },
    };
  }
};

// rewrite / as index.html
const rewriteSlashToIndexHtml = (): Plugin => {
  return {
    name: "rewrite-slash-to-index-html",
    apply: "serve",
    enforce: "post",
    configureServer: (server) => {
      server.middlewares.use("/", (req, _, next) => {
        if (req.url === "/") {
          req.url = "/index.html";
        }
        next();
      });
    },
  };
};

const getDefines = (command: string, mode: string, buildForProd: boolean) => ({
  __BUILD_FOR_PROD__: JSON.stringify(buildForProd),
  __BUILD_FOR_DEV__: JSON.stringify(!buildForProd),
  __LOCAL_DEV_SERVER__: JSON.stringify(command !== "build"),
  __DEBUG_MODE__: JSON.stringify(command !== "build" && mode === "development"),
});

export default ({ command, mode }) => {
  const buildForProd = process.env.BUILD_FOR === "production";

  return defineConfig({
    base: "./",
    appType: "mpa",
    build: {
      target: "esnext",
      minify: "terser",
      terserOptions: getTerserOptions(command),
      assetsInlineLimit: 0,
      assetsDir: "",
      reportCompressedSize: false,
      modulePreload: false,
      sourcemap: false,
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: "[name].[ext]",
          entryFileNames: "i.js",
          chunkFileNames: "[name].[ext]",
        },
      },
    },
    server: {
      port: 8080,
      open: true,
      // headers: {
      // "Cross-Origin-Opener-Policy": "same-origin",
      // "Cross-Origin-Embedder-Policy": "require-corp",
      // },
      hmr: true,
      watch: {
        ignored: (p) => {
          const relativePath = path.relative(
            path.resolve(url.fileURLToPath(import.meta.url), ".."),
            p
          );
          const norm = normalizePath(relativePath);
          return (
            relativePath !== "" &&
            relativePath !== "src" &&
            !norm.startsWith("src/") &&
            !norm.startsWith("public/")
          );
        },
      },
    },
    publicDir: false,
    // assetsInclude: ["libs-bundle.js"],
    plugins: [
      // postProcessHtml(),
      rewriteSlashToIndexHtml(),
      {
        name: "build-game",
        load: async (id) => {
          if (id.endsWith("/src/index.ts") && command === "build") {
            console.info("PRE-BUILD ENTRY POINT!");
            return await buildIndexModuleNew(
              "./src/index.ts",
              "./src/index.js"
            );
          }
        },
      } satisfies Plugin,
      process.env.ZIP && ectPlugin(),
      process.env.ZIP && advzipPlugin(),
      roadrollerPlugin(),
    ],
    define: getDefines(command, mode, buildForProd),
  });
};
