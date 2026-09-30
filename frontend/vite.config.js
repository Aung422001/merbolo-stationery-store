import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // The dev server proxies /api to the backend, so the browser never needs to reach localhost:5000 directly
  const apiTarget = (env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

  return {
    plugins: [react()],
    define: {
      // Vercel sets VERCEL=1 during its builds; those deployments serve /api through api/proxy.js
      __DEPLOYED_ON_VERCEL__: JSON.stringify(Boolean(process.env.VERCEL))
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true
        }
      }
    }
  };
});
