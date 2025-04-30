// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests/e2e',
  /* 테스트 실행 최대 시간 */
  timeout: 30 * 1000,
  /* 각 테스트 간 타임아웃 */
  expect: {
    timeout: 5000
  },
  /* 테스트 실행 병렬화 */
  fullyParallel: true,
  /* 실패한 테스트에 대한 재시도 횟수 */
  retries: process.env.CI ? 2 : 0,
  /* 테스트 실행자 수 */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter */
  reporter: [
    ['html'],
    ['list']
  ],
  /* 공유 설정 */
  use: {
    /* Base URL */
    baseURL: 'http://localhost:3000',
    /* 모든 테스트에서 추적 수집 */
    trace: 'on-first-retry',
    /* 모든 테스트에서 스크린샷 캡처 */
    screenshot: 'only-on-failure',
    /* 비디오 녹화 */
    video: 'on-first-retry',
  },

  /* 테스트할 프로젝트 설정 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* 모바일 테스트 */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 웹 서버 실행 설정 */
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
