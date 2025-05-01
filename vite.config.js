import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  },
  build: {
    rollupOptions: {
      external: [
        'cloudflare:sockets',
        'pg-cloudflare'
      ],
      output: {
        manualChunks(id) {
          // Create a separate chunk for node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    commonjsOptions: {
      esmExternals: true
    }
  },
  resolve: {
    alias: {
      // Add any necessary aliases here
      'pg-cloudflare': resolve(__dirname, './src/utils/empty-module.js')
    }
  }
});
