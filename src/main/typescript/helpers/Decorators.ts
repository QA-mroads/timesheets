import { Page, test, TestInfo } from '@playwright/test'

/**
 * Step decorator that wraps a method execution in a Playwright test step for better reporting.
 *
 * @param description - Optional description to append to the step name
 *
 * @example
 * ```typescript
 * class LoginPageActions extends BasePage {
 *   @step('Navigate to login page')
 *   async navigateToLogin() {
 *     await this.page.goto('/login');
 *   }
 *
 *   @step() // Uses default naming: ClassName.methodName
 *   async clickLoginButton() {
 *     await this.utility.click({ selector: LoginPageActions.loginBtn });
 *   }
 * }
 * ```
 *
 * @remarks
 * - If no description is provided, uses the format: `ClassName.methodName`
 * - If description is provided, uses the format: `ClassName.methodName - description`
 * - Helps organize test execution flow in Playwright reports
 */
export function step(description?: string) {
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return function replacementMethod(...args: any): any {
            const name = `${this.constructor.name}.${context.name as string}`
            const stepName = description ? `${name} - ${description}` : name
            return test.step(stepName, async () => {
                return await target.call(this, ...args)
            })
        }
    }
}

/**
 * Boxed step decorator that wraps a method execution in a Playwright test step with box styling.
 * Creates a visually distinct step in test reports that stands out from regular steps.
 *
 * @param description - Optional description to append to the step name
 *
 * @example
 * ```typescript
 * class PaymentPageActions extends BasePage {
 *   @boxedStep('Complete payment process')
 *   async processPayment() {
 *     await this.utility.selectDropDownValue({ selector: PaymentPageActions.paymentTypeDropdown, text: 'Credit Card' });
 *     await this.utility.typeText({ selector: PaymentPageActions.cardNumberField, text: '4111111111111111' });
 *     await this.utility.click({ selector: PaymentPageActions.submitBtn });
 *   }
 * }
 * ```
 *
 * @remarks
 * - Similar to @step but with enhanced visual styling in reports
 * - Useful for highlighting important or complex operations
 * - The box option makes the step more prominent in test execution reports
 */
export function boxedStep(description?: string) {
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return function replacementMethod(...args: any): any {
            const name = `${this.constructor.name}.${context.name as string}`
            const stepName = description ? `${name} - ${description}` : name
            return test.step(
                stepName,
                async () => {
                    return await target.call(this, ...args)
                },
                { box: true },
            ) // Note the "box" option here.
        }
    }
}

/**
 * Timeout decorator that applies a custom timeout to a method execution within a test step.
 * Useful for operations that may take longer than the default timeout.
 *
 * @param maxtimeout - Maximum timeout in milliseconds
 * @param description - Optional description to append to the step name
 *
 * @example
 * ```typescript
 * class FileUploadPageActions extends BasePage {
 *   @timeout(60000, 'Upload large file')
 *   async uploadLargeFile() {
 *     await this.utility.click({ selector: FileUploadPageActions.uploadBtn });
 *     await this.page.setInputFiles(FileUploadPageActions.fileInput, 'large-file.pdf');
 *   }
 *
 *   @timeout(30000) // 30 second timeout with default naming
 *   async waitForProcessing() {
 *     await this.utility.waitForLocator({ selector: FileUploadPageActions.processingComplete });
 *   }
 * }
 * ```
 *
 * @remarks
 * - Overrides the default Playwright timeout for the specific method
 * - Helpful for file uploads, API calls, or complex UI operations
 * - Prevents premature test failures due to timeout issues
 */
export function timeout(maxtimeout: number, description?: string) {
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return function replacementMethod(...args: any): any {
            const name = `${this.constructor.name}.${context.name as string}`
            const stepName = description ? `${name} - ${description}` : name
            return test.step(
                stepName,
                async () => {
                    return await target.call(this, ...args)
                },
                { timeout: maxtimeout },
            ) // Note the "timeout" option here.
        }
    }
}

/**
 * Retry decorator that automatically retries a method execution if it fails.
 * Wraps the method execution in a Playwright test step for better reporting.
 *
 * @param attempts - Number of retry attempts (default: 3)
 * @param delay - Delay between retry attempts in milliseconds (default: 1000ms)
 *
 * @example
 * ```typescript
 * class FlakeyPageActions extends BasePage {
 *   @retry(5, 2000)
 *   async clickUnstableElement() {
 *     await this.utility.click({ selector: FlakeyPageActions.unstableButton });
 *   }
 *
 *   @retry() // Uses default values: 3 attempts, 1000ms delay
 *   async performFlakeyAction() {
 *     await this.utility.typeText({ selector: FlakeyPageActions.inputField, text: 'test' });
 *   }
 * }
 * ```
 *
 * @remarks
 * - If all retry attempts fail, throws an error with details about the last failure
 * - Each retry attempt is separated by the specified delay
 * - The method execution is wrapped in a Playwright test step for better test reporting
 * - Useful for handling flaky UI elements or network-dependent operations
 *
 * @throws {Error} When all retry attempts are exhausted, includes the last error message
 */
export function retry(attempts: number = 3, delay: number = 1000) {
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return async function replacementMethod(...args: any): Promise<any> {
            const className = this.constructor.name
            const methodName = context.name as string

            return test.step(`${className}.${methodName} (with retry)`, async () => {
                let lastError: Error

                for (let attempt = 1; attempt <= attempts; attempt++) {
                    try {
                        return await target.call(this, ...args)
                    } catch (error) {
                        lastError = error as Error

                        if (attempt === attempts) {
                            throw new Error(
                                `Method failed after ${attempts} attempts. Last error: ${lastError.message}`,
                            )
                        }

                        await new Promise(resolve => setTimeout(resolve, delay))
                    }
                }
            })
        }
    }
}

/**
 * Performance decorator that tracks execution time and memory usage of a method.
 * Provides performance monitoring capabilities with configurable thresholds.
 *
 * @param config - Performance configuration object
 * @param config.warnThreshold - Threshold in milliseconds to log a warning (optional)
 * @param config.errorThreshold - Threshold in milliseconds to throw an error (optional)
 * @param config.trackMemory - Whether to track memory usage (default: false)
 *
 * @example
 * ```typescript
 * class DataProcessingPageActions extends BasePage {
 *   @performance({ warnThreshold: 5000, errorThreshold: 10000, trackMemory: true })
 *   async processLargeDataset() {
 *     await this.utility.click({ selector: DataProcessingPageActions.processBtn });
 *     await this.utility.waitForLocator({ selector: DataProcessingPageActions.resultTable });
 *   }
 *
 *   @performance({ warnThreshold: 2000 })
 *   async quickSearch() {
 *     await this.utility.typeText({ selector: DataProcessingPageActions.searchField, text: 'query' });
 *     await this.utility.click({ selector: DataProcessingPageActions.searchBtn });
 *   }
 * }
 * ```
 *
 * @remarks
 * - Logs execution time to console for all method calls
 * - Warns when execution time exceeds warnThreshold
 * - Throws error when execution time exceeds errorThreshold
 * - Optionally tracks memory usage before and after execution
 * - Useful for identifying performance bottlenecks in test automation
 *
 * @throws {Error} When execution time exceeds errorThreshold
 */

export function performance(
    configOptions: { warnThreshold?: number; errorThreshold?: number; trackMemory?: boolean } = {},
) {
    // Set default values if they are not provided
    const { warnThreshold = 0, errorThreshold = 0, trackMemory = false } = configOptions

    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return async function replacementMethod(...args: any): Promise<any> {
            const className = this.constructor.name
            const methodName = context.name as string

            return test.step(`${className}.${methodName} (performance tracked)`, async () => {
                const startTime = Date.now()
                const startMemory = configOptions.trackMemory ? process.memoryUsage() : null

                try {
                    const result = await target.call(this, ...args)
                    const duration = Date.now() - startTime

                    // Log performance metrics
                    console.log(`Performance: ${className}.${methodName} took ${duration}ms`)

                    if (configOptions.warnThreshold && duration > configOptions.warnThreshold) {
                        console.warn(
                            `Warning: ${className}.${methodName} exceeded warn threshold (${duration}ms > ${configOptions.warnThreshold}ms)`,
                        )
                    }

                    if (configOptions.errorThreshold && duration > configOptions.errorThreshold) {
                        throw new Error(
                            `Performance error: ${className}.${methodName} exceeded error threshold (${duration}ms > ${configOptions.errorThreshold}ms)`,
                        )
                    }

                    if (startMemory && configOptions.trackMemory) {
                        const endMemory = process.memoryUsage()
                        const memoryDiff = endMemory.heapUsed - startMemory.heapUsed
                        console.log(`Memory: ${className}.${methodName} used ${memoryDiff} bytes`)
                    }

                    return result
                } catch (error) {
                    const duration = Date.now() - startTime
                    console.error(`Performance: ${className}.${methodName} failed after ${duration}ms`)
                    throw error
                }
            })
        }
    }
}

/**
 * Screenshot decorator that automatically captures screenshots during method execution.
 * Provides comprehensive visual documentation of test execution flow.
 *
 * @param configOptions - Screenshot configuration object
 * @param configOptions.onError - Capture screenshot when method fails (default: false)
 * @param configOptions.onSuccess - Capture screenshot when method succeeds (default: true)
 * @param configOptions.beforeExecution - Capture screenshot before method execution (default: true)
 * @param configOptions.afterExecution - Capture screenshot after method execution (default: true)
 * @param configOptions.path - Custom path for screenshots (optional)
 *
 * @example
 * ```typescript
 * class FormPageActions extends BasePage {
 *   @screenshot({ onError: true, onSuccess: true, beforeExecution: true })
 *   async fillComplexForm() {
 *     await this.utility.typeText({ selector: FormPageActions.nameField, text: 'John Doe' });
 *     await this.utility.selectDropDownValue({ selector: FormPageActions.countryDropdown, text: 'USA' });
 *     await this.utility.check({ selector: FormPageActions.termsCheckbox });
 *     await this.utility.click({ selector: FormPageActions.submitBtn });
 *   }
 *
 *   @screenshot({ onError: true, path: 'custom/login-screenshots' })
 *   async performLogin() {
 *     await this.utility.typeText({ selector: FormPageActions.usernameField, text: 'testuser' });
 *     await this.utility.typeText({ selector: FormPageActions.passwordField, text: 'password' });
 *     await this.utility.click({ selector: FormPageActions.loginBtn });
 *   }
 * }
 * ```
 *
 * @remarks
 * - Screenshots are saved with timestamp and method information in filename
 * - Default behavior captures before and success screenshots
 * - Error screenshots are only captured when explicitly enabled
 * - Requires this.page to be available (assumes Page Object extends BasePage)
 * - Full page screenshots are captured by default
 * - Useful for debugging test failures and documenting test execution
 *
 * @throws Re-throws any errors from the original method after capturing error screenshot
 */
export function screenshot(
    configOptions: {
        onError?: boolean
        onSuccess?: boolean
        beforeExecution?: boolean
        afterExecution?: boolean
        path?: string
    } = {},
) {
    // Set default values if they are not provided
    const { onError = false, onSuccess = true, beforeExecution = false, afterExecution = false } = configOptions
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return async function replacementMethod(...args: any): Promise<any> {
            const className = this.constructor.name
            const methodName = context.name as string
            const page = this.page as Page // Assuming page is available on 'this'

            return test.step(`${className}.${methodName} (with screenshots)`, async () => {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
                const basePath = configOptions.path || `screenshots/${className}-${methodName}-${timestamp}`

                try {
                    // Before execution screenshot
                    if (configOptions.beforeExecution) {
                        await page.screenshot({
                            path: `${basePath}-before.png`,
                            fullPage: true,
                        })
                    }

                    const result = await target.call(this, ...args)

                    // Success screenshot
                    if (configOptions.onSuccess || configOptions.afterExecution) {
                        await page.screenshot({
                            path: `${basePath}-success.png`,
                            fullPage: true,
                        })
                    }

                    return result
                } catch (error) {
                    // Error screenshot
                    if (configOptions.onError) {
                        await page.screenshot({
                            path: `${basePath}-error.png`,
                            fullPage: true,
                        })
                    }
                    throw error
                }
            })
        }
    }
}

export function waitFor(
    configOptions: {
        element?: string
        state?: 'visible' | 'hidden' | 'attached' | 'detached'
        timeout?: number
        url?: string | RegExp
    } = {},
) {
    // Set default values if they are not provided

    const { element = null, state = 'visible', timeout = 30000, url = null } = configOptions
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return async function replacementMethod(...args: any): Promise<any> {
            const className = this.constructor.name
            const methodName = context.name as string
            const page = this.page as Page

            return test.step(`${className}.${methodName} (with wait conditions)`, async () => {
                // Pre-execution waits
                if (configOptions.element) {
                    await page.locator(configOptions.element).waitFor({
                        state: configOptions.state || 'visible',
                        timeout: configOptions.timeout,
                    })
                }

                if (configOptions.url) {
                    await page.waitForURL(configOptions.url, { timeout: configOptions.timeout })
                }

                return await target.call(this, ...args)
            })
        }
    }
}

export function log(
    configOptions: {
        level?: 'debug' | 'info' | 'warn' | 'error'
        logArgs?: boolean
        logResult?: boolean
        logDuration?: boolean
    } = {},
) {
    // Set default values if they are not provided
    const { level = 'info', logArgs = true, logResult = true, logDuration = true } = configOptions
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return async function replacementMethod(...args: any): Promise<any> {
            const className = this.constructor.name
            const methodName = context.name as string
            const level = configOptions.level || 'info'

            return test.step(`${className}.${methodName}`, async () => {
                const startTime = Date.now()

                // Log method entry
                console[level](`[${level.toUpperCase()}] Entering ${className}.${methodName}`)

                if (configOptions.logArgs) {
                    console[level](`[${level.toUpperCase()}] Arguments:`, args)
                }

                try {
                    const result = await target.call(this, ...args)
                    const duration = Date.now() - startTime

                    // Log successful completion
                    console[level](`[${level.toUpperCase()}] Completed ${className}.${methodName}`)

                    if (configOptions.logDuration) {
                        console[level](`[${level.toUpperCase()}] Duration: ${duration}ms`)
                    }

                    if (configOptions.logResult && result !== undefined) {
                        console[level](`[${level.toUpperCase()}] Result:`, result)
                    }

                    return result
                } catch (error) {
                    const duration = Date.now() - startTime
                    console.error(`[ERROR] Failed ${className}.${methodName} after ${duration}ms:`, error)
                    throw error
                }
            })
        }
    }
}

export function environment(config: {
    production?: boolean
    staging?: boolean
    development?: boolean
    skip?: boolean
}) {
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return function replacementMethod(...args: any): any {
            const env = process.env.NODE_ENV || 'development'

            // Skip logic
            if (
                config.skip &&
                ((env === 'production' && config.production) ||
                    (env === 'staging' && config.staging) ||
                    (env === 'development' && config.development))
            ) {
                return test.step.skip(`Test Step Skipped as the env is: ${env}`, async () => {
                    console.log(`Skipping method in ${env} environment`)
                })
            }

            return test.step(`${env.toUpperCase()}: ${context.name as string}`, async () => {
                return await target.call(this, ...args)
            })
        }
    }
}

/**
 * Data provider decorator that executes a method with multiple datasets.
 * Iterates through provided data and executes the decorated method for each dataset.
 *
 * @param data - Array of test data or function that returns array of test data
 *
 * @example
 * ```typescript
 * class LoginPageActions extends BasePage {
 *   @dataProvider([
 *     { email: 'user1@example.com', password: 'pass123' },
 *     { email: 'user2@example.com', password: 'pass456' }
 *   ])
 *   @step()
 *   async login(credentials: { email: string; password: string }) {
 *     await this.utility.typeText({ selector: LoginPageActions.emailField, text: credentials.email });
 *     await this.utility.typeText({ selector: LoginPageActions.passwordField, text: credentials.password });
 *     await this.utility.click({ selector: LoginPageActions.loginBtn });
 *   }
 * }
 * ```
 *
 * @remarks
 * - Executes the method once for each data item in the array
 * - Each execution is wrapped in its own test step for better reporting
 * - The first parameter of the decorated method should accept the data item type
 * - Does not return results to maintain original method signature compatibility
 */
export function dataProvider<T>(data: T[] | (() => T[])) {
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return async function replacementMethod(...args: any) {
            const className = this.constructor.name
            const methodName = context.name as string
            const testData = typeof data === 'function' ? data() : data

            return test.step(`${className}.${methodName} (data-driven with results)`, async () => {
                const results = []
                let hasResults = false

                for (let i = 0; i < testData.length; i++) {
                    const item = testData[i]
                    const result = await test.step(`Dataset ${i + 1}: ${JSON.stringify(item)}`, async () => {
                        return await target.call(this, item, ...args)
                    })

                    // Only collect results if the method actually returns something
                    if (result !== undefined && result !== null) {
                        results.push(result)
                        hasResults = true
                    }
                }

                // Only return results array if there were actual results, otherwise return void/undefined
                return hasResults ? results : undefined
            })
        }
    }
}

export function debug() {
    return function (target: Function, context: ClassMethodDecoratorContext): any {
        return async function replacementMethod(...args: any): Promise<any> {
            console.log(`🐛 Entering ${context.name as string} with args:`, args)

            try {
                const result = await target.call(this, ...args)
                console.log(`✅ ${context.name as string} completed with result:`, result)
                return result
            } catch (error) {
                console.error(`❌ ${context.name as string} failed:`, error)
                throw error
            }
        }
    }
}

/**
 * Test decorator that creates a Playwright test directly from a class method.
 * Allows you to write test methods in classes and have them automatically registered as tests.
 *
 * @param title - Optional title to append to the test name
 *
 * @example
 * ```typescript
 * class LoginTests {
 *   @testDecorator('should login with valid credentials')
 *   async testLogin() {
 *     // test implementation
 *   }
 *
 *   @testDecorator() // Uses default naming: methodName
 *   async verifyDashboard() {
 *     // test implementation
 *   }
 * }
 * ```
 *
 * @remarks
 * - If no title is provided, uses the method name as the test title
 * - If title is provided, uses the format: `methodName - title`
 * - Environment name is prepended to the test title (e.g., "DEVELOPMENT: testLogin")
 * - The decorated method becomes a Playwright test that will be executed in the test run
 */
/**
 * Test decorator that creates a Playwright test directly from a class method.
 * Allows you to write test methods in classes and have them automatically registered as tests.
 *
 * @param title - Optional title to append to the test name
 *
 * @example
 * ```typescript
 * class LoginTests {
 *   @testDecorator('should login with valid credentials')
 *   async testLogin({ page }) {
 *     await page.goto('/login');
 *     // test implementation
 *   }
 *
 *   @testDecorator() // Uses default naming: methodName
 *   async verifyDashboard({ page }) {
 *     // test implementation
 *   }
 * }
 * ```
 *
 * @remarks
 * - If no title is provided, uses the method name as the test title
 * - If title is provided, uses the format: `methodName - title`
 * - Environment name is prepended to the test title (e.g., "DEVELOPMENT: testLogin")
 * - The decorated method becomes a Playwright test that will be executed in the test run
 * - Method parameters will receive the Playwright fixtures
 */
export function testDecorator(title?: string) {
    return function (target: any, context: ClassMethodDecoratorContext): any {
        const methodName = context.name as string
        const env = process.env.NODE_ENV || 'development'
        const testTitle = title
            ? `${env.toUpperCase()}: ${methodName} - ${title}`
            : `${env.toUpperCase()}: ${methodName}`

        // Register a test using the original method
        test(testTitle, async fixtures => {
            // Just call the original method with fixtures
            return await target(fixtures)
        })

        // Return the original method unchanged
        return target
    }
}

/**
 * Enhanced test decorator that creates a Playwright test with support for test options and fixtures.
 * Provides greater flexibility for test configuration compared to the basic testDecorator.
 *
 * @param config - Test configuration options
 * @param config.title - Optional title to append to the test name
 * @param config.options - Optional Playwright test options (timeout, annotations, etc.)
 * @param config.tags - Optional array of tags to associate with the test
 * @param config.conditionalSkip - Optional function that returns true if the test should be skipped
 *
 * @example
 * ```typescript
 * class ApiTests {
 *   @enhancedTest({
 *     title: 'should create a new user',
 *     options: { timeout: 60000 },
 *     tags: ['api', 'user-management']
 *   })
 *   async testCreateUser({ request }) {
 *     const response = await request.post('/api/users', {
 *       data: { name: 'John Doe', email: 'john@example.com' }
 *     });
 *     expect(response.status()).toBe(201);
 *   }
 *
 *   @enhancedTest({
 *     conditionalSkip: () => process.env.SKIP_PAYMENT_TESTS === 'true'
 *   })
 *   async testPaymentProcessing() {
 *     // Test implementation
 *   }
 * }
 * ```
 *
 * @remarks
 * - Supports all Playwright test options like timeout, annotations, retries
 * - Can conditionally skip tests based on environment variables or other logic
 * - Supports adding tags for better test organization and filtering
 * - Preserves the original method for potential direct invocation
 */
/**
 * Test decorator for class methods that conditionally runs or skips a test.
 *
 * @param config - Configuration object for the test
 * @param config.title - Optional title to append to the test name
 * @param config.tags - Optional tags to add to the test name in brackets
 * @param config.conditionalSkip - Optional function that returns true if test should be skipped
 *
 * @example
 * ```typescript
 * class ApiTests {
 *   @conditionalTest({
 *     title: 'should create a user',
 *     tags: ['api', 'user'],
 *     conditionalSkip: () => process.env.SKIP_API_TESTS === 'true'
 *   })
 *   async createUser({ page, request }) {
 *     // Test implementation
 *   }
 * }
 * ```
 */
export function conditionalTest(config: { title?: string; tags?: string[]; conditionalSkip?: () => boolean }) {
    return function (target: any, context: ClassMethodDecoratorContext): any {
        const methodName = context.name as string
        const env = process.env.NODE_ENV || 'development'
        const testTitle = config.title
            ? `${env.toUpperCase()}: ${methodName} - ${config.title}`
            : `${env.toUpperCase()}: ${methodName}`

        // Add tags to title if provided
        const tagString = config.tags?.length ? ` [${config.tags.join(', ')}]` : ''
        const fullTitle = `${testTitle}${tagString}`

        // Check if test should be conditionally skipped
        if (config.conditionalSkip && config.conditionalSkip()) {
            // Just register a skipped test
            test.skip(fullTitle, () => {})
        } else {
            // Register normal test
            test(fullTitle, async fixtures => {
                return await target(fixtures)
            })
        }

        // Return the original method unchanged
        return target
    }
}

/**
 * Creates a Playwright test directly from a class method with a simplified syntax.
 * Allows providing a direct test title string or configuration object.
 *
 * @param titleOrConfig - Either a string title or configuration object
 *
 * @example
 * ```typescript
 * class ProductPageTests {
 *   @testMethod('should display product details correctly')
 *   async verifyProductDetails({ page }) {
 *     // test implementation
 *   }
 *
 *   @testMethod('should add product to cart')
 *   async addToCart({ page }) {
 *     // test implementation
 *   }
 * }
 * ```
 *
 * @remarks
 * - Provides a cleaner syntax for creating tests from class methods
 * - Method parameter will receive the Playwright fixtures
 * - Environment name is always prepended to the test title
 */
export function testMethod(title: string) {
    return function (target: any, context: ClassMethodDecoratorContext): any {
        const methodName = context.name as string
        const env = process.env.NODE_ENV || 'development'

        // Create the test title with environment prefix
        const testTitle = `${env.toUpperCase()}: ${title || methodName}`

        // Register the test
        test(testTitle, async fixtures => {
            // Just call the original method with fixtures
            return await target(fixtures)
        })

        // Return the original method unchanged
        return target
    }
}

/**
 * Creates a data-driven Playwright test directly from a class method.
 * Runs the test once for each data set provided.
 *
 * @param testData - Array of test data or function that returns array of test data
 * @param options - Optional configuration object
 * @param options.title - Optional base title for the test (will be suffixed with data details)
 * @param options.tags - Optional tags to add to the test name in brackets
 * @param options.conditionalSkip - Optional function that takes a data item and returns true if that test case should be skipped
 *
 * @example
 * ```typescript
 * class LoginTests {
 *   @testWithData([
 *     { username: 'user1', password: 'pass1', expected: 'Welcome User1' },
 *     { username: 'user2', password: 'pass2', expected: 'Welcome User2' },
 *     { username: 'invalid', password: 'wrong', expected: 'Invalid credentials' }
 *   ], { title: 'should validate login scenarios' })
 *   async testLogin({ page }, testData) {
 *     await page.goto('/login');
 *     await page.fill('[data-test="username"]', testData.username);
 *     await page.fill('[data-test="password"]', testData.password);
 *     await page.click('[data-test="login-button"]');
 *
 *     const message = await page.textContent('.message');
 *     expect(message).toBe(testData.expected);
 *   }
 * }
 * ```
 *
 * @remarks
 * - Each dataset creates a separate Playwright test
 * - Test titles include the dataset index and stringified data (truncated if too long)
 * - The data is passed as the second parameter to the test method after fixtures
 * - Environment name is prepended to all test titles
 * - Test can be conditionally skipped based on the specific data item
 */
export function testWithData<T>(
    testData: T[] | (() => T[]),
    options: {
        title?: string
        tags?: string[]
        conditionalSkip?: (data: T) => boolean
    } = {},
) {
    return function (target: any, context: ClassMethodDecoratorContext): any {
        const methodName = context.name as string
        const env = process.env.NODE_ENV || 'development'
        const resolvedData = typeof testData === 'function' ? testData() : testData

        // Register a separate test for each data entry
        resolvedData.forEach((data, index) => {
            // Create appropriate test title
            const baseTitle = options.title || methodName
            const tagString = options.tags?.length ? ` [${options.tags.join(', ')}]` : ''
            // Format the data for title display, truncating if too long
            const dataStr = JSON.stringify(data)
            const shortDataStr = dataStr.length > 50 ? `${dataStr.substring(0, 47)}...` : dataStr

            // Complete title with all elements
            const testTitle = `${env.toUpperCase()}: ${baseTitle} (${index + 1}/${
                resolvedData.length
            }): ${shortDataStr}${tagString}`

            // Check if this specific test should be skipped
            if (options.conditionalSkip && options.conditionalSkip(data)) {
                test.skip(testTitle, () => {
                    console.log(`Skipping test case with data:`, data)
                })
            } else {
                // Register normal test with data
                test(testTitle, async fixtures => {
                    // Call the original method with fixtures and data
                    return await target(fixtures, data)
                })
            }
        })

        // Return the original method unchanged
        return target
    }
}

/**
 * Unified Test decorator that combines all test functionalities into one.
 * Supports traditional tests, data-driven tests, conditional skipping, and test metadata.
 *
 * @param config - Test configuration object or title string
 * @param config.title - Title of the test (optional)
 * @param config.description - Detailed description of the test purpose (optional)
 * @param config.testCaseId - Test case ID for traceability to requirements (optional)
 * @param config.tags - Tags for test categorization and filtering (optional)
 * @param config.data - Data for data-driven testing (optional)
 * @param config.skip - Boolean or function to conditionally skip the test (optional)
 * @param config.timeout - Custom timeout for the test (optional)
 * @param config.retries - Number of retries for the test (optional)
 *
 * @example
 * ```typescript
 * // Simple test with title
 * @Test('should display the login page')
 * async testLoginPageDisplay({ page }) {
 *   await page.goto('/login')
 *   await expect(page.locator('h1')).toHaveText('Login')
 * }
 *
 * // Test with metadata
 * @Test({
 *   title: 'User can login with valid credentials',
 *   description: 'Verifies that a user can successfully login with valid credentials',
 *   testCaseId: 'TC-001',
 *   tags: ['login', 'smoke'],
 * })
 * async testLogin({ page }) {
 *   // Test implementation
 * }
 *
 * // Data-driven test
 * @Test({
 *   title: 'Login validation handles various scenarios',
 *   testCaseId: 'TC-002',
 *   data: [
 *     { username: 'valid@example.com', password: 'valid123', expectSuccess: true },
 *     { username: 'invalid@example.com', password: 'wrong', expectSuccess: false },
 *   ]
 * })
 * async testLoginScenarios({ page }, testData) {
 *   // Data-driven test implementation using testData parameter
 * }
 * ```
 *
 * @remarks
 * - For simple tests, you can pass a string directly as the title
 * - For data-driven tests, the test data is passed as the second parameter to the test method
 * - Test metadata (testCaseId, description) is included in the test report
 * - Environment name is prepended to all test titles
 * - If data is provided, creates a separate test for each data item
 */
export function Test(
    config:
        | string
        | {
              title?: string
              description?: string
              testCaseId?: string
              tags?: string[]
              data?: any[] | (() => any[])
              skip?: boolean | (() => boolean) | ((data?: any) => boolean)
              timeout?: number
              retries?: number
          },
) {
    return function (target: any, context: ClassMethodDecoratorContext): any {
        const methodName = context.name as string
        const env = process.env.NODE_ENV || 'development'

        // Process config based on type
        const isStringConfig = typeof config === 'string'
        const title = isStringConfig ? config : config.title || methodName
        const description = isStringConfig ? undefined : config.description
        const testCaseId = isStringConfig ? undefined : config.testCaseId
        const tags = isStringConfig ? undefined : config.tags
        const testData = isStringConfig ? undefined : config.data
        const skipConfig = isStringConfig ? undefined : config.skip
        const timeout = isStringConfig ? undefined : config.timeout

        // Format test title components
        const idPrefix = testCaseId ? `[${testCaseId}] ` : ''
        const tagString = tags?.length ? ` [${tags.join(', ')}]` : ''
        const baseTitle = `${env.toUpperCase()}: ${idPrefix}${title}`

        // Create test options
        const testOptions: any = {}
        if (timeout) testOptions.timeout = timeout
        if (description) testOptions.annotation = { description }

        // Function to determine if a test should be skipped
        const shouldSkip = (data?: any): boolean => {
            if (skipConfig === undefined) return false
            if (typeof skipConfig === 'boolean') return skipConfig
            return typeof skipConfig === 'function' ? skipConfig(data) : false
        }

        // If no test data provided, create a single test
        if (!testData) {
            const fullTitle = `${baseTitle}${tagString}`

            if (shouldSkip()) {
                test.skip(fullTitle, () => {
                    console.log(`Skipping test: ${fullTitle}`)
                })
            } else {
                test(
                    fullTitle,
                    async fixtures => {
                        return await target(fixtures)
                    },
                    testOptions,
                )
            }
        } else {
            // Handle data-driven test case
            const resolvedData = typeof testData === 'function' ? testData() : testData

            // Create a separate test for each data item
            resolvedData.forEach((data, index) => {
                // Format data for title, truncating if too long
                const dataStr = JSON.stringify(data)
                const shortDataStr = dataStr.length > 40 ? `${dataStr.substring(0, 37)}...` : dataStr

                // Create full title with data information
                const fullTitle = `${baseTitle} (${index + 1}/${resolvedData.length}): ${shortDataStr}${tagString}`

                // Check if this specific test should be skipped
                if (shouldSkip(data)) {
                    test.skip(fullTitle, () => {
                        console.log(`Skipping data-driven test case: ${fullTitle}`)
                    })
                } else {
                    test(
                        fullTitle,
                        async fixtures => {
                            // Call the original method with fixtures and data
                            return await target(fixtures, data)
                        },
                        testOptions,
                    )
                }
            })
        }

        // Return the original method unchanged
        return target
    }
}
