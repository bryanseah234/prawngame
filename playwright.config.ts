import { defineConfig } from '@playwright/test';

const production = process.env.PRAWN_GAME_BASE_URL;

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: production || 'http://127.0.0.1:4173',
    headless: true,
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
    { name: 'small-mobile', use: { viewport: { width: 320, height: 740 } } },
  ],
  webServer: production ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
