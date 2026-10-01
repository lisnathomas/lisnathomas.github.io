import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;
const CI = !!process.env['CI'];

/*
 * Tags:
 *   @once      site-wide checks (SEO, assets, network) that only need one browser
 *   @external  real HTTP requests to external links (Chromium only)
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: CI,
  // No automatic retries: a flaky test is a defect to fix, not to hide.
  retries: 0,
  ...(CI ? { workers: 2 } : {}),
  reporter: CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  expect: { timeout: 7_000 },
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] }, grepInvert: /@once|@external/ },
    { name: 'webkit', use: { ...devices['Desktop Safari'] }, grepInvert: /@once|@external/ },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] }, grepInvert: /@once|@external/ },
    { name: 'mobile-safari', use: { ...devices['iPhone 15'] }, grepInvert: /@once|@external/ },
  ],
  webServer: {
    command: `npx astro preview --port ${PORT} --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 60_000,
  },
});
