import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    modulePreload: {
      polyfill: false,
    },
    // Minimize bundle size for JS13K
    minify: 'terser',
    // Disable source maps for smaller build
    sourcemap: false,
    // Optimize chunk splitting for single file output
    rollupOptions: {
      output: {
        // Create a single JS file
        manualChunks: undefined,
        // Remove hash from file names for simpler structure
        entryFileNames: 'index.js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'index.css'
          }
          return '[name][extname]'
        },
      },
    },
    // Inline small assets as base64 (more aggressive for JS13K)
    assetsInlineLimit: 2048, // 2KB threshold
    // Target modern browsers for smaller output
    target: 'es2022',
    // More aggressive CSS code splitting disabled
    cssCodeSplit: false,
    // Reduce chunk size warnings for JS13K
    chunkSizeWarningLimit: 13000, // 13KB limit for JS13K
    copyPublicDir: false,
  },
  // Enable CSS minification
  css: {
    devSourcemap: false,
    // Aggressive CSS minification
    postcss: undefined,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [],
  },
})
