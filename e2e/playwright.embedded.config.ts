import {defineConfig, devices} from '@playwright/test';
import path from 'path';

const SAMPLE_APP_URL = process.env.SAMPLE_APP_URL ?? 'https://localhost:5173';
const IDP_TARGET = process.env.IDP_TARGET ?? 'is';

export default defineConfig({
  testDir: `./tests/${IDP_TARGET}/embedded`,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', {outputFolder: './playwright-report-embedded'}], ['list']],

  // Note: globalSetup is NOT used. IDP setup + .env writing happens in the
  // webServer launch script to ensure .env is written BEFORE Vite starts.
  globalTeardown: path.resolve(__dirname, 'setup/global-teardown.ts'),

  use: {
    baseURL: SAMPLE_APP_URL,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--ignore-certificate-errors'],
        },
      },
    },
  ],

  webServer: {
    command: 'SIGN_IN_MODE=embedded npx tsx e2e/setup/launch-dev-server.ts',
    url: SAMPLE_APP_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    ignoreHTTPSErrors: true,
    cwd: path.resolve(__dirname, '..'),
  },
});
