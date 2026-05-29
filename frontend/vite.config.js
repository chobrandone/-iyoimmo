import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => ({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    proxy: {
      // In dev, proxy /api and /uploads to the local backend
      '/api':     { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
  build: {
    // Output directly into backend/public — Express will serve it on Hostinger
    outDir: '../backend/public',
    emptyOutDir: true,
    sourcemap: false,
  },
}));
