import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e-real',
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:5173', ...devices['Desktop Chrome'] },
  webServer: [
    { command: 'node ../backend/tests/e2eServer.js', url: 'http://127.0.0.1:5000/api/health', reuseExistingServer: false, timeout: 120000 },
    { command: 'npm run dev -- --host 127.0.0.1', url: 'http://127.0.0.1:5173', reuseExistingServer: false, timeout: 120000 }
  ]
});
