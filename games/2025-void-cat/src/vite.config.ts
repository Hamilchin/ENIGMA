import { defineConfig } from 'vite';

export default defineConfig({
  // important: make all asset paths relative
  base: './',

  build: {
    rollupOptions: {
      output: {
        // simpler filenames (optional, but keeps zip small + readable)
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },

  plugins: [
    {
      name: 'remove-crossorigin',
      transformIndexHtml(html) {
        // strip crossorigin from <script> and <link>
        return html.replace(/\s*crossorigin/g, '');
      },
    },
  ],
});
