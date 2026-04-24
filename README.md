# Playwright Automation Framework Documentation

## Note: This repo has tests written for https://mroads.com

## Introduction

This document provides a comprehensive guide to using the Playwright automation framework. This framework enables fast and reliable end-to-end testing for modern web applications, supporting Chromium, Firefox, and WebKit. It is designed to facilitate cross-browser web automation, particularly for complex web applications.

## Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: Version 12 or higher.
-   **npm** or **yarn**: Package managers for insta\*lling dependencies.
-   **Visual Studio Code (VS Code)**: Recommended / for development.
-   **Git**: For cloning the project repository.

## Setup Instructions

### 1. Initial Setup

1. **Execute PowerShell Command**:
   Launch PowerShell in administrator mode and run the following command to set the execution policy:

    ```powershell
    Set-ExecutionPolicy -ExecutionPolicy Unrestricted -Scope CurrentUser
    ```

2. **Install Node.js**:
   Download and install Node.js from the official website: [Node.js Downloads](https://nodejs.org/en/download/).

### 2. Clone the Repository

1. Navigate to the automation project repository.
2. Clone the repository to your local machine using Git:
    ```sh
    git clone <repository-url>
    ```

### 3. Install Dependencies

1. Open a command prompt in the framework folder.
2. Install the project dependencies using npm:
    ```sh
    npm install
    ```
3. Install Playwright browsers:
    ```sh
    npx playwright install
    ```

### 4. Run Tests

Execute the tests using the following command:

```sh
npm run testsOnAIMS_QA
```

## Project Structure

The project follows a structured architecture to promote maintainability and scalability. Here's an overview of the key directories:

```bash

src
├── main
│   ├── resources
│   │   └── env
│   │   |    └── envConfig.json
│   │   |── allure
│   └── typescript
│       ├── base
│       │   └── BasePage.ts
│       │   └── customFixtures.ts
│       ├── helpers
│       │   └── CustomReporter.ts
│       │   └── Decorators.ts
│       │   ├── env.ts
│       │   ├── global-setup.ts
│       │   ├── log.ts
│       │   └── Utility.ts
│       └── pages
│           ├── HomePage.ts
│           └── ContactUsPage.ts
├── test
│   ├── resources
│   └── typescript
│       └── StandardTestSpecFile.spec.ts
```

## Key Directories

-   **src/main/resources/env**: Contains environment-specific configuration files.
    -   **envConfig.json**: JSON configuration file for managing environment settings.
-   **src/main/typescript/base**: Contains base classes for page objects.
    -   **BasePage.ts**: The base class for page objects, providing common functionality.
-   **src/main/typescript/helpers**: Contains helper functions and utilities.
    -   **env.ts**: Helper functions for environment management.
    -   **global-setup.ts**: Global setup logic executed before the test suite.
    -   **log.ts**: Utility for handling and managing test logs.
    -   **Utility.ts**: Generic utility functions used across the framework.
-   **src/main/typescript/pages**: Contains page object classes, separating actions and locators.
-   **test/resources**: Contains additional resources for test cases, such as mock data.
-   **test/typescript**: Contains test specification files.
    -   **StandardTestSpecFile.spec.ts**: A sample test specification file.

## Coding Guidelines

### Writing Methods

#### Asynchronous Functions:

-   Start with the `async` keyword.
-   Name methods descriptively (e.g., `loginToHomePage`).
-   Use the following syntax:

```typescript
async function loginToHomePage() {
    // Your code here
}
```

-   Use `await` before every asynchronous operation.
-   Open the browser and launch the application using:

```typescript
await page.goto('<URL>')
```

### File Naming

-   **Consistency**: Ensure file names and class names are the same.
-   **Test Files**: Use the format `sanity-tests.spec.ts` for test files.

### Imports

-   **Standard Imports**: Import necessary modules like `test`, `expect`, and `page` from Playwright.
-   **Environment Variables**: Import environment variables from `helpers/env.ts`.

### Test Configuration

-   **Parallel Configuration**: Configure tests to run in parallel.
-   **Before Each Test**: Use `test.beforeEach` for setup tasks.

## Page Object Model (POM)

Organize tests using the Page Object Model (POM). Each page should have its own class with methods representing actions on that page.

### Example:

```typescript
import { BasePage } from '../../base/BasePage'

export class NaukariPageActions extends BasePage {
    static loginBtn = '//a[text()="Login"]'
    static usernameField = '//input[@placeholder="Enter your active Email ID / Username"]'
    static passwordField = '//input[@placeholder="Enter your password"]'
    static signinBtn = '//button[text()="Login"]'
    static viewProfile = '//div[@class="view-profile-wrapper"]'
    static editResumeHeadLineBtn = '//span[text()="Resume headline"]//following-sibling::span[text()="editOneTheme"]'
    static saveBtn = '//button[text()="Save"]'
    static successMsg = '//p[text()="Success"]'
    async loginintoNaukari() {
        await this.page.goto(this.ENV.BASE_URL)
        await this.utility.waitUntilPageIsLoaded()
        await this.page.locator(NaukariPageActions.loginBtn).waitFor({ state: 'visible', timeout: 120000 })
        await this.utility.waitForLocator({ selector: NaukariPageActions.loginBtn })
        await this.utility.click({ selector: NaukariPageActions.loginBtn })
        await this.utility.typeText({ selector: NaukariPageActions.usernameField, text: this.ENV.USERNAME })
        await this.utility.typeText({ selector: NaukariPageActions.passwordField, text: this.ENV.PASSWORD })
        await this.utility.click({ selector: NaukariPageActions.signinBtn })
        await this.utility.waitUntilPageIsLoaded()
        await this.utility.click({ selector: NaukariPageActions.viewProfile })
        await this.utility.click({ selector: NaukariPageActions.editResumeHeadLineBtn })
        await this.utility.click({ selector: NaukariPageActions.saveBtn })
        await this.utility.waitForLocator({ selector: NaukariPageActions.successMsg })
        await this.utility.waitUntilPageIsLoaded()
    }
}
```

### Click Example:

```typescript
await this.utility.click({ selector: NaukariPageActions.editResumeHeadLineBtn })
```

### Filling a textBox

```typescript
await page.fill('#inputField', 'value')
```

### Typing in a textBox

```typescript
await this.utility.typeText({ selector: NaukariPageActions.usernameField, text: '100' })
```

### Select a Dropdown value

```typescript
await this.utility.selectDropDownValue({ selector: NaukariPageActions.slctPPTypeDropdown, text: 'Person' })
```

## Developing Tests

### Steps to Develop a Test

1. **Create a Test File**:

    - Create a new test file in the `test/typescript` directory.
    - Follow the naming convention: `[feature-name].spec.ts` (e.g., `business-entity.spec.ts`).

2. **Import Necessary Modules**:

    - Import `test` and `expect` from `@playwright/test`.
    - Import the required page object classes using custom fixtures.

3. **Define the Test**:

    - Use the `test` function to define your test case.
    - Provide a descriptive name for the test.
    - Use the `async` keyword to define an asynchronous test function.

4. **Use Custom Fixtures**:

    - Access page object classes through custom fixtures.
    - Call methods from the page object classes to perform actions.
    - Use `await` for asynchronous operations.

5. **Add Assertions**:
    - Use `expect` to add assertions and validate the expected behavior.

## Adding Custom Fixtures

### Steps to Add a Custom Fixture

1. **Open customFixtures.ts**:

    - Navigate to the base directory and open the `customFixtures.ts` file.

2. **Import the Page Object Class**:

    - Import the page object class you want to use as a custom fixture.

    ```typescript
    import { NaukariPageActions } from '../pages/actions/NaukariPageActions'
    ```

3. **Add the Page to the MyFixtures Type**:

    - Add a new entry to the `MyFixtures` type definition.

    ```typescript
    type MyFixtures = {
        naukariPageActions: NaukariPageActions
        // ... other fixtures
    }
    ```

4. **Extend the Test Object**:
    - Use the `base.extend` method to add the custom fixture.
    ```typescript
    export const test = base.extend<MyFixtures>({
        naukariPageActions: async ({ page }, use) => {
            return await use(new NaukariPageActions(page))
        },
        // ... other fixtures
    })
    ```

### Full Example

```typescript
import { test as base } from '@playwright/test'

import { GoogleHomePageActions } from '../pages/actions/GoogleHomePageActions'
import { LoginPageActions } from '../pages/actions/LoginPageActions'
import { NaukariPageActions } from '../pages/actions/NaukariPageActions'

type MyFixtures = {
    googleHomePageActions: GoogleHomePageActions
    loginPageActions: LoginPageActions
    naukariPageActions: NaukariPageActions
}

export const test = base.extend<MyFixtures>({
    googleHomePageActions: async ({ page }, use) => {
        return await use(new GoogleHomePageActions(page))
    },
    loginPageActions: async ({ page }, use) => {
        return await use(new LoginPageActions(page))
    },
    naukariPageActions: async ({ page }, use) => {
        return await use(new NaukariPageActions(page))
    },
})
export { expect } from '@playwright/test'
```

## Running Tests in UI Mode

To run tests in UI mode, follow these steps:

1. **Modify package.json**:

    - Open the `package.json` file.
    - Add the `--ui` flag to the `test` script.

    ```json
    "scripts": {
         "test": "cross-env environmentToRun=prod npx playwright test --workers=3",
        // ... other scripts
    }
    ```

2. **Run the Tests**:
    - Execute the tests using the following command:
    ```sh
    npm run test
    ```

## Writing Tests

When writing tests using Playwright, ensure the following:

-   Use descriptive test names.
-   Include setup and teardown logic where necessary.
-   Use assertions to validate the expected behavior.

### Example:

```typescript
import { test, expect } from '@playwright/test'

test('example test', async ({ page }) => {
    await page.goto('https://example.com')
    const title = await page.title()
    expect(title).toBe('Example Domain')
})
```

## Customizing Environments

You can switch between different environment configurations by updating the `envConfig.json` file located in the `src/main/resources/env` folder.

## Global Setup

Global setup ensures the environment and browser contexts are properly initialized before the test suite runs. It is defined in `global-setup.ts`.

## Additional Resources

-   [Playwright Documentation](https://playwright.dev/docs/intro)
-   [GitHub Copilot Documentation](https://docs.github.com/en/copilot)

# Setup of Eslint and Prettier in this framework.

### Below guide gives you some understanding on how esLint and Prettier are setup.

# Playwright Framework: TypeScript, Prettier, and ESLint Setup

This README provides an overview of the **Playwright framework** session where we covered essential aspects of TypeScript errors, using **Prettier** for code formatting, and **ESLint** for linting the Playwright tests. Additionally, we explored how to configure and apply linting and formatting rules for a cleaner, error-free codebase.

## Contents

-   [Introduction](#introduction)
-   [Prettier Setup](#prettier-setup)
-   [ESLint Setup](#eslint-setup)
-   [Running Linting and Formatting](#running-linting-and-formatting)
-   [Common Issues and Fixes](#common-issues-and-fixes)
-   [Further Reading](#further-reading)

## Introduction

In this session, we addressed the following key topics:

1. **Fixing TypeScript Errors**: How to identify and correct TypeScript errors in Playwright tests.
2. **Prettier**: Code formatting tool that ensures consistency in code structure.
3. **ESLint**: Static code analysis tool used to identify problematic patterns in JavaScript/TypeScript code.

## Prettier Setup

Prettier helps in maintaining a consistent code style across the project. Here’s how to set it up and run it:

1. Install Prettier:

    ```bash
    npm install --save-dev prettier
    ```

2. Create a `.prettierrc.js` configuration file:

    ```js
    module.exports = {
        arrowParens: 'avoid',
        endOfLine: 'lf',
        semi: false,
        trailingComma: 'all',
        singleQuote: true,
        printWidth: 120,
        tabWidth: 4,
        bracketSameLine: false,
        overrides: [
            {
                files: 'src/**/*.ts',
                options: {
                    printWidth: 250,
                },
            },
        ],
    }
    ```

3. Add a script to your `package.json`:

    ```json
    {
        "scripts": {
            "prettify": "prettier --config \".prettierrc.js\" --write \"./**/*.{ts,tsx,js,jsx,json,yaml,yml,eslintrc,md}\" "
        }
    }
    ```

4. Add .prettierignore:

    ```bash
    node_modules
    playwright-report
    test-results
    build-js/
    allure-results
    ```

5. Run Prettier to format your code:
    ```bash
    npm run prettify
    ```

## ESLint Setup

ESLint helps in identifying TypeScript and JavaScript issues that could lead to potential errors. Here’s how to configure ESLint for your Playwright project:

1. Add below to your devDependencies:

    ```json
        "eslint": "^8.30.0",
        "eslint-config-standard-with-typescript": "^24.0.0",
        "eslint-plugin-import": "^2.26.0",
        "eslint-plugin-n": "^15.6.0",
        "eslint-plugin-promise": "^6.1.1",
        "eslint-plugin-simple-import-sort": "^8.0.0"
    ```

2. Create an `.eslintrc.jon` file for configuration:

    ```json
    {
        "parser": "@typescript-eslint/parser",
        "parserOptions": {
            "project": "./tsconfig.json"
        },
        "plugins": ["@typescript-eslint", "simple-import-sort"],
        "rules": {
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/indent": "off",
            "@typescript-eslint/member-delimiter-style": [
                "error",
                {
                    "multiline": {
                        "delimiter": "none",
                        "requireLast": true
                    },
                    "singleline": {
                        "delimiter": "semi",
                        "requireLast": false
                    }
                }
            ],
            "@typescript-eslint/naming-convention": [
                "error",
                {
                    "selector": "variable",
                    "format": ["camelCase", "UPPER_CASE", "PascalCase"],
                    "leadingUnderscore": "allow",
                    "trailingUnderscore": "forbid"
                }
            ],
            "@typescript-eslint/no-array-constructor": "error",
            "@typescript-eslint/no-this-alias": "error",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "off",
            "@typescript-eslint/quotes": ["error", "single"],
            "@typescript-eslint/semi": ["error", "never"],
            "@typescript-eslint/type-annotation-spacing": "off",
            //"arrow-body-style": ["error", "as-needed"],
            "arrow-parens": ["off", "always"],
            "brace-style": ["off", "off"],
            "comma-dangle": [
                "error",
                {
                    "objects": "always-multiline",
                    "arrays": "always-multiline",
                    "functions": "always-multiline"
                }
            ],
            "curly": ["error", "multi-line"],
            "eol-last": "off",
            "eqeqeq": ["error", "smart"],
            "id-denylist": [
                "error",
                "any",
                "Number",
                "number",
                "String",
                "string",
                "Boolean",
                "boolean",
                "Undefined",
                "undefined"
            ],
            "id-match": "error",
            "import/no-internal-modules": "off",
            "indent": "off",
            "linebreak-style": "off",
            "max-len": "off",
            "new-parens": "off",
            "newline-per-chained-call": "off",
            "no-array-constructor": "off",
            "no-console": "off",
            "no-duplicate-imports": "error",
            "no-else-return": "error",
            "no-eval": "error",
            "no-extra-semi": "error",
            "no-irregular-whitespace": "off",
            "no-multiple-empty-lines": "error",
            "no-multi-spaces": "error",
            "no-new-wrappers": "error",
            //"no-param-reassign": "error",
            //"no-plusplus": "error",
            "no-trailing-spaces": "off",
            "no-underscore-dangle": "off",
            "no-var": "error",
            "object-shorthand": "error",
            "one-var": ["error", "never"],
            "padded-blocks": [
                "off",
                {
                    "blocks": "never"
                },
                {
                    "allowSingleLineBlocks": true
                }
            ],
            "prefer-arrow/prefer-arrow-functions": "off",
            "prefer-const": "error",
            "prefer-template": "error",
            "quote-props": ["error", "as-needed"],
            "quotes": [2, "single"],
            "radix": "error",
            "semi": "off",
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            "space-before-function-paren": "off",
            "space-in-parens": ["off", "never"],
            "spaced-comment": [
                "error",
                "always",
                {
                    "markers": ["/"]
                }
            ]
        }
    }
    ```

3. Add ESLint to the `package.json`:

    ```json
    {
        "scripts": {
            "lint": "eslint --ignore-path .eslintignore --ext .js,.ts,.tsx .",
            "lintFix": "eslint --fix src/**/*.ts"
        }
    }
    ```

4. Add .prettierignore:

    ```bash
    node_modules/
    /test-results/
    /playwright-report/
    /playwright/.cache/
    logs/
    build-js/
    ```

5. Run ESLint:

    ```bash
    npm run lint
    ```

6. To automatically fix issues, run:
    ```bash
    npm run lintFix
    ```

## Running Linting and Formatting

-   **Run Prettier**: Formats the code to maintain style consistency.

    ```bash
    npm run pretty
    ```

-   **Run ESLint**: Detects issues in the code.

    ```bash
    npm run lint
    ```

-   **Auto-fix issues**: Fixes minor issues automatically.
    ```bash
    npm run lintFix
    ```

## Common Issues and Fixes by linting

1. **Unnecessary `await` in Promises**: Some Playwright functions do not return promises. Make sure to check if the function is synchronous or asynchronous and avoid using `await` where not necessary.

    ```javascript
    // Example fix
    const element = await page.getByText('Submit') // Incorrect
    const element = page.getByText('Submit') // Correct
    ```

2. **Extra Semicolons**: ESLint rules help catch unnecessary semicolons.

    ```javascript
    const name = 'Playwright' // Incorrect
    const name = 'Playwright' // Correct
    ```

3. **Quotes Mismatch**: Ensure consistent usage of single or double quotes as per the ESLint configuration.

    ```javascript
    const message = 'Hello' // Incorrect
    const message = 'Hello' // Correct
    ```

4. **Missing `await`**: ESLint warns if a promise is not awaited, which can lead to runtime issues.
    ```javascript
    await page.click('button') // Correct if it returns a promise.
    ```

## Further Reading

-   [TypeScript-ESLint Documentation](https://typescript-eslint.io/)
-   [Prettier Documentation](https://prettier.io/)

---

### How to add a testcase to bvts

Sometimes you want to tag your tests as @bvt or @regression, and then filter by tag in the test report. Or you might want to only run tests that have a certain tag.

To tag a test, either provide an additional details object when declaring a test, or add @-token to the test title. Note that tags must start with @ symbol.

import { test, expect } from '@playwright/test';

test.describe('group', () => {
test('test report header', async ({ page }) => {
// ...
});

test('test full report', {tag: ['@bvt', '@regression']},
async ({ page }) => {
// ...
});
});

You can now run tests that have a particular tag with --grep command line option.

```powershell
cross-env environmentToRun=prod npx playwright test --workers 3 --project=RegressionTests --grep "@bvt"
```

Or if you want the opposite, you can skip the tests with a certain tag:

```powershell
cross-env environmentToRun=prod npx playwright test --workers 3 --project=RegressionTests --grep-invert "@bvt"
```

To run tests containing either tag (logical OR operator):

```powershell
cross-env environmentToRun=prod npx playwright test --workers 3 --project=RegressionTests --grep --% "@bvt^|@regression"
```

Or run tests containing both tags (logical AND operator) using regex lookaheads:

```powershell
cross-env environmentToRun=prod npx playwright test --workers 3 --project=RegressionTests --grep "(?=.*@bvt)(?=.*@regression)"
```
