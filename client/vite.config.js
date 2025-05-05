import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request to /cam in your React app
      // will be forwarded to your Express server
      '/cam': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
});
