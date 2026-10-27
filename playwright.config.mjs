import { defineConfig, devices } from 'playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

process.env.TMPDIR = resolve('artifacts/tmp');
mkdirSync(process.env.TMPDIR, { recursive: true });

// Deliberately fixed to a disposable local preview. No configurable production URL.
const baseURL = 'http://127.0.0.1:4321';
export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './artifacts/playwright-results',
  reporter: [['list'], ['html', { outputFolder: 'artifacts/playwright-report', open: 'never' }], ['json', { outputFile: 'artifacts/playwright-results.json' }]],
  timeout: 30000,
  expect: { timeout: 5000 },
  retries: 0,
  workers: 2,
  use: { baseURL, trace: 'retain-on-failure', screenshot: 'only-on-failure', locale: 'es-CL', launchOptions: { chromiumSandbox: true } },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: { command: 'node scripts/serve.mjs', url: baseURL, reuseExistingServer: false, timeout: 15000 },
});
