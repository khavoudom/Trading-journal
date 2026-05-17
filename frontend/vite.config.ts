/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1900,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
              priority: 40,
            },
            {
              name: 'charts',
              test: /node_modules[\\/](recharts|d3-|victory-vendor|lodash)[\\/]/,
              priority: 30,
              maxSize: 450 * 1024,
            },
            {
              name: 'editor',
              test: /node_modules[\\/](@tiptap|prosemirror-)[\\/]/,
              priority: 30,
              maxSize: 450 * 1024,
            },
            {
              name: 'excel',
              test: /node_modules[\\/](xlsx|cfb|ssf|codepage)[\\/]/,
              priority: 30,
            },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    exclude: ['node_modules', '.git', 'server'],
  },
});
