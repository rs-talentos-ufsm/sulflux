import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@lib/shared'],
  },
  server: {
    host: '0.0.0.0',
    port: 5184,
    strictPort: true,
    fs: {
      allow: ['./', '../..', '/app'],
    },
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@lib/shared': path.resolve(
        __dirname,
        '../../packages/shared/dist/index.js',
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setupTests.ts'],
    include: ['tests/**/*.{spec,test}.{ts,tsx}'],
    testTimeout: 10000,
    fileParallelism: false,
  },
});
