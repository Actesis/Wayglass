import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  base: '/experiments/phase-5c-rich-visualization/',
  build: {
    outDir: '.benchmark-dist',
    emptyOutDir: true,
    minify: 'esbuild',
    target: 'es2022',
    rollupOptions: {
      input: fileURLToPath(new URL('benchmark.html', import.meta.url)),
    },
  },
});
