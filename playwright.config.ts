import { defineConfig } from '@playwright/test';
import fs from 'node:fs';

const PREINSTALLED_HEADLESS_SHELL =
  '/ms-playwright/chromium_headless_shell-1247/chrome-headless-shell-linux64/chrome-headless-shell';

const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (fs.existsSync(PREINSTALLED_HEADLESS_SHELL) ? PREINSTALLED_HEADLESS_SHELL : undefined);

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: {
    timeout: 12_000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL:
      process.env.PREVIEW_URL ||
      process.env.BASE_URL ||
      process.env.PLAYWRIGHT_BASE_URL ||
      'http://127.0.0.1:3000',
    headless: true,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 10_000,
    navigationTimeout: 25_000,
    launchOptions: {
      ...(executablePath ? { executablePath } : {}),
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    },
  },
});
