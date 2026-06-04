import type { PlaywrightTestConfig } from '@playwright/test'
const isHeadless = true // change manually
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
    globalSetup: require.resolve('./src/main/typescript/helpers/global-setup.ts'),

    /* Maximum time one test can run for. */
    timeout: 1200000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 1,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ['json', { outputFile: 'test-results.json' }]
],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        screenshot: 'on',
        trace: 'on',
        acceptDownloads: true,
        permissions: ['clipboard-read', 'clipboard-write','notifications','camera','microphone'],
        video: 'on',
    },

    /* Configure projects for major browsers */
   projects: [

    // =====================================
    // AUTHENTICATION SETUP PROJECT
    // =====================================
    {
        name: 'setup',
        testDir: './src/auth',
        testMatch: 'auth.setup.ts',
        use: {
            channel: 'chromium',
            headless: isHeadless,
            viewport: isHeadless? { width: 1920, height: 1080, } : null,
            deviceScaleFactor: isHeadless? 1 : undefined,
            launchOptions: {
                args: isHeadless? ['--window-size=1920,1080', ]: [  '--start-maximized', ],
            },
        },
    },

    // =====================================
    // MAIN TEST PROJECT
    // =====================================
    {
        name: 'mroads',
        testDir: './src/test/typescript',
        testMatch: ['timesheetsPage*.spec.ts', 'pannaHomePage*.spec.ts', 'timesheetsSettingsPage*.spec.ts', 'orgSetupPage*.spec.ts'],
        dependencies: ['setup'],
        use: {
            channel: 'chromium',
            storageState: './src/auth/user.json',
            acceptDownloads: true,
            headless: isHeadless,
            viewport:  isHeadless? { width: 1920, height: 1080, } : null,
            deviceScaleFactor: isHeadless? 1 : undefined,
            launchOptions: {
                args: isHeadless? ['--window-size=1920,1080', ]: [  '--start-maximized', ],
            },
        },
    },
],
}

export default config
export const outputLocation = './logs/Playwright'
export const logLevelTest = 'INFO'
