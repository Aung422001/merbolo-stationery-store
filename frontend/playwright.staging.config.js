import { defineConfig, devices } from '@playwright/test';

// CI-only staging rehearsal: a production build backed by an ephemeral,
// seeded MongoDB replica set. No hosted API or real database is used.
export default defineConfig({
  testDir: './e2e-real',
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:5173', ...devices['Desktop Chrome'] },
  webServer: [
    {
      command: 'node ../backend/tests/e2eServer.js',
      url: 'http://127.0.0.1:5000/api/ready',
      env: { NODE_ENV: 'test', PORT: '5000' },
      reuseExistingServer: false,
      timeout: 120000
    },
    {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5173 --strictPort',
      url: 'http://127.0.0.1:5173',
      env: { VITE_API_URL: 'http://127.0.0.1:5000/api', VERCEL: '' },
      reuseExistingServer: false,
      timeout: 120000
    }
  ]
});
