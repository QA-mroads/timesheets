---
name: playwright-automation-guidelines
description: Comprehensive guide for Playwright test automation in the Freight Consol TypeScript project. Covers Page Object Model patterns with BasePage/Utility class integration, test structure, and best practices. Use this when asked to generate or debug Playwright tests.
---

# 🎭 Playwright Automation Testing Guidelines

This document provides strict coding standards and practices for AI agents when generating Playwright test automation code in the Freight Consol TypeScript project.

## 📁 Folder Structure & Conventions

```
src/
  main/
    resources/
      env/
        .env.dev            # Dev environment variables
        .env.prod           # Prod environment variables
        env.ts              # ENV config object (BASE_URL, USERNAME, PASSWORD)
    typescript/
      base/
        BasePage.ts         # Base class — provides this.page, this.utility, this.ENV
        customFixtures.ts   # Custom fixtures via base.extend<MyFixtures>()
      helpers/
        Decorators.ts       # @step and @boxedStep decorators
        Utility.ts          # Core interaction utility class (click, typeText, etc.)
      pages/
        LoginPage.ts        # Page objects extending BasePage
        DashboardPage.ts
        VendorManagementPage.ts
        AddAdminPage.ts
        YopmailandchangepwdPage.ts
test/
  typescript/
    logintest.spec.ts       # Test spec files
    vendormanagement.spec.ts
    addadmin.spec.ts
    yopmailandchangepwd.spec.ts
```

## 🏗️ BasePage — The Foundation

All page objects **MUST extend `BasePage`**. `BasePage` provides three inherited properties:

```typescript
// src/main/typescript/base/BasePage.ts
import { Page } from '@playwright/test'
import ENV from '../../resources/env/env'
import { Utility } from '../helpers/Utility'

export class BasePage {
    readonly page: Page       // Direct Playwright page access
    readonly utility: Utility // Utility helper for all interactions
    readonly ENV = ENV        // Environment config (BASE_URL, USERNAME, PASSWORD)

    constructor(page: Page) {
        this.page = page
        this.utility = new Utility(page)
    }
}
```

- `this.page` — Playwright `Page` object for direct API calls when needed
- `this.utility` — `Utility` class instance for all standard element interactions
- `this.ENV` — Environment config (`BASE_URL`, `USERNAME`, `PASSWORD`)

## 🛠️ Utility Class — Available Methods

Use `this.utility.*` methods for all element interactions. Direct `this.page.*` calls are permitted only where a `Utility` method is not available (e.g. `page.goto`, `page.waitForLoadState`, `page.waitForTimeout`, frame locators, popups).

```typescript
// Click
await this.utility.click({ selector: '//xpath', timeout?: number, occurance?: number })
await this.utility.clickUsingText({ text: 'Button Text', occurance?: number })
await this.utility.clickAll({ selector: '//xpath' })

// Text Input
await this.utility.typeText({ selector: '//xpath', text: 'value', occurance?: number })

// Checkbox
await this.utility.check({ selector: '//xpath', occurance?: number })

// Dropdown
await this.utility.selectDropDownValue({ selector: '//select', text?: 'Option', index?: number })
await this.utility.selectDropDownOption({ text: 'Option' })  // for li[role="option"] dropdowns

// Waiting
await this.utility.waitForLocator({ selector: '//xpath', timedOut?: number, occurance?: number })
await this.utility.waitUntilPageIsLoaded()
await this.utility.checkIfElementExists({ selector: '//xpath' })
await this.utility.waitUntilElementHaveValue({ element: '//xpath', value: 'expected' })

// Element Retrieval
await this.utility.getElement({ selector: '//xpath', occurance?: number })
await this.utility.getElementFirst({ selector: '//xpath' })
await this.utility.getElementSecond({ selector: '//xpath' })
await this.utility.getElementLast({ selector: '//xpath' })
await this.utility.getCountOfElements({ selector: '//xpath' })
await this.utility.getAttributeValue({ selector: '//xpath', attributeName: 'value' })
await this.utility.getElementByLabel({ selector: 'Label Text' })
await this.utility.getDropDownItems({})
await this.utility.getDropDownItemWithText({ text: 'Option' })

// Scrolling & Focus
await this.utility.scrollIntoView({ selector: '//xpath' })
await this.utility.focus({ selector: '//xpath' })

// File & Window
await this.utility.downloadFile({ selector: '//xpath' })
await this.utility.waitForWindow(clickEvent)
```

## 🏗️ Page Object Model Standards

### Page Object Structure

All page objects **MUST**:
1. Extend `BasePage`
2. Declare private selectors at class level (XPath strings or locator-returning arrow functions)
3. Decorate every method with `@step('description')`
4. Import `BasePage` from `'../base/BasePage'` and `step` from `'../helpers/Decorators'`

```typescript
// src/main/typescript/pages/ExamplePage.ts
import { BasePage } from '../base/BasePage'
import { step } from '../helpers/Decorators'

export class ExamplePage extends BasePage {
    // XPath string selector
    private readonly headerLocator = "//h1[text()='Dashboard']"

    // Locator-returning arrow function (for role/label-based elements)
    private readonly saveBtn = () => this.page.getByRole('button', { name: 'Save' })

    @step('Navigate to page')
    async navigateTo() {
        await this.page.goto(this.ENV.BASE_URL)
        await this.utility.waitUntilPageIsLoaded()
    }

    @step('Verify header is visible')
    async verifyHeaderVisible() {
        await this.utility.waitForLocator({ selector: this.headerLocator })
    }
}
```

### Selector Strategy

Two selector patterns are used in this project:

**Pattern 1 — XPath / CSS string** (used with `this.utility.*` methods):
```typescript
private readonly emailInput = "//input[@id='email']"
private readonly loginBtn = "//button[text()='LOGIN']"
private readonly dashboardHeader = "//h1[text()='Dashboard']"
private readonly deleteBtn = () => this.page.locator("//tr[1]/td[7]//button[.//span[text()='Delete']]")
```

**Pattern 2 — Locator-returning arrow function** (used with `.waitFor()`, `.click()`, `.fill()` directly on the locator):
```typescript
private readonly saveBtn = () => this.page.getByRole('button', { name: 'Save' })
private readonly vendorName = () => this.page.getByRole('textbox', { name: 'Vendor Name *' })
private readonly vendorTypeDropdown = () => this.page.getByRole('combobox')
private readonly adminMenu = () => this.page.getByRole('link', { name: 'Admin' })
private readonly timeZoneDropdown = () => this.page.locator("//span[contains(text(),'Timezone')]/ancestor::div//button[@role='combobox']")
```

### Selector Priority Reference

| Priority | Selector Pattern | When to Use |
| -------- | ---------------- | ----------- |
| 1 | `"//xpath[@attribute='value']"` (XPath string) | Attribute-based, text-based, or complex DOM traversal |
| 2 | `() => this.page.getByRole('button', { name: 'Label' })` | Buttons, links, inputs identified by ARIA role + name |
| 3 | `() => this.page.getByRole('textbox', { name: 'Field *' })` | Form text fields identified by label |
| 4 | `() => this.page.getByRole('combobox')` | Dropdown/combobox elements |
| 5 | `() => this.page.getByTitle('...')` | Elements identified by title attribute |
| 6 | `() => this.page.locator("//xpath")` | Complex XPath wrapped as locator function |

### Working with the Two Patterns

When selector is an **XPath/CSS string**, use `this.utility.*`:
```typescript
await this.utility.click({ selector: this.loginBtn })
await this.utility.typeText({ selector: this.emailInput, text: email })
await this.utility.waitForLocator({ selector: this.dashboardHeader })
```

When selector is a **locator-returning arrow function**, call Playwright directly on the locator:
```typescript
await this.saveBtn().waitFor({ state: 'visible', timeout: 10000 })
await this.saveBtn().click()
await this.vendorName().fill('Vendor Inc')
await this.vendorName().scrollIntoViewIfNeeded()
```

### Full Page Object Example — LoginPage

```typescript
// src/main/typescript/pages/LoginPage.ts
import { BasePage } from '../base/BasePage'
import { step } from '../helpers/Decorators'

export class LoginPage extends BasePage {
    private readonly superadminemail = "//input[@id='email']"
    private readonly superadminpassword = "//input[@id='password']"
    private readonly login = "//button[text()='LOGIN']"

    @step('Launch URL')
    async launchURL() {
        await this.page.goto(this.ENV.BASE_URL)
    }

    @step('Perform Login')
    async performLogin(email: string, password: string) {
        await this.utility.typeText({ selector: this.superadminemail, text: email })
        await this.utility.typeText({ selector: this.superadminpassword, text: password })
        await this.utility.click({ selector: this.login })
    }
}
```

### Full Page Object Example — VendorManagementPage

```typescript
// src/main/typescript/pages/VendorManagementPage.ts
import { BasePage } from '../base/BasePage'
import { step } from '../helpers/Decorators'

export class VendorManagementPage extends BasePage {
    private readonly vendorMenu = () => this.page.getByRole('link').nth(3)
    private readonly addVendorBtn = () => this.page.getByRole('button', { name: 'add-vendor Add Vendor' })
    private readonly vendorName = () => this.page.getByRole('textbox', { name: 'Vendor Name *' })
    private readonly vendorTypeDropdown = () => this.page.getByRole('combobox')
    private readonly saveBtn = () => this.page.getByRole('button', { name: 'Save' })
    private readonly searchBox = () => this.page.getByRole('textbox', { name: 'Search by Name' })
    private readonly deleteBtn = () => this.page.locator("//tr[1]/td[7]//button[.//span[text()='Delete']]")
    private readonly yesBtn = () => this.page.getByRole('button', { name: 'Yes' })

    @step('Navigate to Vendor Page')
    async navigateToVendor() {
        await this.page.waitForLoadState('networkidle')
        const vendorMenu = this.vendorMenu()
        await vendorMenu.waitFor({ state: 'visible', timeout: 10000 })
        await vendorMenu.click()
        await this.page.waitForLoadState('networkidle')
    }

    @step('Search Vendor')
    async searchVendor(name: string) {
        await this.searchBox().waitFor({ state: 'visible', timeout: 10000 })
        await this.searchBox().fill(name)
        await this.page.waitForLoadState('networkidle')
    }

    @step('Delete Vendor')
    async deleteVendor() {
        await this.deleteBtn().waitFor({ state: 'visible', timeout: 10000 })
        await this.deleteBtn().click()
        await this.yesBtn().waitFor({ state: 'visible', timeout: 10000 })
        await this.yesBtn().click()
        await this.page.waitForLoadState('networkidle')
    }
}
```

## 🔧 Decorators

Every page object method **MUST** be decorated with `@step` or `@boxedStep`.

```typescript
import { step, boxedStep } from '../helpers/Decorators'

// Standard step — appears in Playwright report as "ClassName.methodName - description"
@step('Navigate to admin page')
async navigateToAdmin() { ... }

// Boxed step — visually distinct in reports; use for major operations
@boxedStep('Complete checkout process')
async completeCheckout() { ... }

// Default naming (no description) — appears as "ClassName.methodName"
@step()
async clickSave() { ... }
```

## 🔧 Custom Fixtures

All page objects are registered as Playwright fixtures in `customFixtures.ts`. Tests import `test` and `expect` from this file — **NOT** from `@playwright/test` directly.

```typescript
// src/main/typescript/base/customFixtures.ts
import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { VendorManagementPage } from '../pages/VendorManagementPage'
import { AddAdminPage } from '../pages/AddAdminPage'
import ENV from '../../resources/env/env'

type MyFixtures = {
    loginPage: LoginPage
    dashboardPage: DashboardPage
    vendormanagementPage: VendorManagementPage
    addadminPage: AddAdminPage
    ENV: typeof ENV
}

export const test = base.extend<MyFixtures>({
    loginPage: async ({ page }, use) => { return await use(new LoginPage(page)) },
    dashboardPage: async ({ page }, use) => { return await use(new DashboardPage(page)) },
    vendormanagementPage: async ({ page }, use) => { return await use(new VendorManagementPage(page)) },
    addadminPage: async ({ page }, use) => { return await use(new AddAdminPage(page)) },
    ENV: async ({}, use) => { return await use(ENV) },
})
export { expect } from '@playwright/test'
```

When adding a new page, register it in `customFixtures.ts` following the same pattern.

## 📝 Test Specification Standards

### Test File Structure

- Import `test` and `expect` from `'../../main/typescript/base/customFixtures'` — **never** from `@playwright/test` directly
- Destructure page object fixtures from the test function arguments
- Use `ENV.BASE_URL` for navigation; manipulate the URL string for deep links (e.g. `.replace('/login', '/vendor-management')`)
- Use `expect()` from Playwright for assertions
- Use `{ tag: ["@TagName"] }` for test categorization (e.g. `@Smoke`, `@Regression`, `@Urgent`)

```typescript
// src/test/typescript/logintest.spec.ts
import { test, expect } from '../../main/typescript/base/customFixtures'

test('Login as SuperAdmin', async ({ loginPage, dashboardPage }) => {
    await loginPage.launchURL()
    await loginPage.performLogin('superadmin@yopmail.com', 'Test@1234')
    await dashboardPage.dashboardHeaderVisibility()
})
```

### Navigation Pattern in Tests

```typescript
// Use ENV.BASE_URL for direct deep-link navigation
test('Navigate to Vendor Management', { tag: ["@Smoke"] }, async ({ vendormanagementPage, page, ENV }) => {
    const vendorUrl = ENV.BASE_URL.replace('/login', '/vendor-management')
    await page.goto(vendorUrl)
    await page.waitForLoadState('networkidle')
    await vendormanagementPage.addVendor()
})
```

### Assertion Pattern in Tests

```typescript
// Use expect() from customFixtures (re-exported from @playwright/test)
await expect(page.locator("//h1[text()='Dashboard']")).toBeVisible()
await expect(page.locator('tbody')).toContainText('VendorName')
await expect(adminPageTitle).toBeTruthy()
```

### Canonical Test File Example — vendormanagement.spec.ts

```typescript
// src/test/typescript/vendormanagement.spec.ts
import { test, expect } from '../../main/typescript/base/customFixtures'

test('Add New Vendor', { tag: ["@Smoke", "@Regression", "@Urgent"] }, async ({ vendormanagementPage, page, ENV }) => {
    const vendorManagementUrl = ENV.BASE_URL.replace('/login', '/vendor-management')
    await page.goto(vendorManagementUrl)
    await page.waitForLoadState('networkidle')
    await vendormanagementPage.addVendor()
    console.log('✅ New vendor added successfully')
})

test('Validate Edited Vendor Details', { tag: ["@Smoke", "@Regression"] }, async ({ vendormanagementPage, page, ENV }) => {
    const vendorManagementUrl = ENV.BASE_URL.replace('/login', '/vendor-management')
    await page.goto(vendorManagementUrl)
    await page.waitForLoadState('networkidle')
    await vendormanagementPage.validateVendor()
    const tableBody = page.locator('tbody')
    await expect(tableBody).toContainText('VendorDisplayName')
    await expect(tableBody).toContainText('VENDORCODE')
    console.log('✅ Vendor details validated successfully')
})
```

## 🎯 Strict AI Agent Rules

### MANDATORY Requirements

1. **BasePage Extension**:
   - ✅ ALL page objects MUST extend `BasePage`
   - ✅ Inherit `this.page`, `this.utility`, `this.ENV` — do NOT re-declare them
   - ❌ Never create page objects without extending `BasePage`

2. **Utility Usage**:
   - ✅ Use `this.utility.click()`, `this.utility.typeText()`, `this.utility.check()`, etc. for interactions with XPath/CSS string selectors
   - ✅ Use direct locator calls (`.click()`, `.fill()`, `.waitFor()`) for locator-returning arrow function selectors
   - ❌ Never instantiate `Utility` independently inside a page object — it is already available as `this.utility`

3. **Selector Declaration**:
   - ✅ All selectors declared as `private readonly` class-level properties
   - ✅ XPath strings for attribute/text-based matching: `private readonly btn = "//button[text()='Save']"`
   - ✅ Arrow functions for role/label-based elements: `private readonly btn = () => this.page.getByRole('button', { name: 'Save' })`
   - ❌ Never use inline selector strings inside method bodies

4. **Decorators**:
   - ✅ Every page object method MUST use `@step('description')` or `@boxedStep('description')`
   - ❌ Missing `@step` decorator on any page method is a violation

5. **File Naming**:
   - Page Objects: `PascalCase.ts` (e.g., `VendorManagementPage.ts`)
   - Test Specs: `camelcase.spec.ts` (e.g., `vendormanagement.spec.ts`)

6. **Test Imports**:
   - ✅ Always import `test` and `expect` from `customFixtures`
   - ❌ Never import directly from `@playwright/test` in test files

7. **Navigation in Tests**:
   - ✅ Use `page.goto(ENV.BASE_URL)` or URL manipulation in test files
   - ✅ Use `await page.waitForLoadState('networkidle')` after navigation

8. **Assertions**:
   - ✅ Use `expect()` from `customFixtures` for all test assertions
   - ✅ Assertions belong in test spec files, not in page objects

9. **New Page Registration**:
   - ✅ Every new page object MUST be registered in `customFixtures.ts`
   - ✅ Add the type to `MyFixtures` and create the fixture extension

### Code Quality Standards

```typescript
// ✅ CORRECT Implementation
import { BasePage } from '../base/BasePage'
import { step } from '../helpers/Decorators'

export class UserProfilePage extends BasePage {
    private readonly firstNameInput = "//input[@name='firstName']"
    private readonly saveButton = () => this.page.getByRole('button', { name: 'Save' })

    @step('Update first name')
    async updateFirstName(firstName: string): Promise<void> {
        await this.utility.typeText({ selector: this.firstNameInput, text: firstName })
        await this.saveButton().waitFor({ state: 'visible', timeout: 10000 })
        await this.saveButton().click()
    }
}

// ❌ INCORRECT — not extending BasePage, missing @step, inline selectors
export class UserProfilePage {
    async updateFirstName(firstName: string): Promise<void> {
        await page.locator("//input[@name='firstName']").fill(firstName) // Wrong: inline selector + direct page
    }
}
```

## 🚫 Prohibited Practices

### Never Do These:

1. **Page object not extending BasePage**:
   ```typescript
   // ❌ WRONG
   export class LoginPage { constructor(page: Page) { this.page = page } }
   // ✅ CORRECT
   export class LoginPage extends BasePage { }
   ```

2. **Inline selector strings in method bodies**:
   ```typescript
   // ❌ WRONG — selector inline in method body
   async clickSave() { await this.utility.click({ selector: "//button[text()='Save']" }) }
   // ✅ CORRECT — selector declared at class level
   private readonly saveBtn = "//button[text()='Save']"
   async clickSave() { await this.utility.click({ selector: this.saveBtn }) }
   ```

3. **Missing @step decorator**:
   ```typescript
   // ❌ WRONG — no decorator
   async navigateToVendor() { await this.page.goto(this.ENV.BASE_URL) }
   // ✅ CORRECT
   @step('Navigate to vendor page')
   async navigateToVendor() { await this.page.goto(this.ENV.BASE_URL) }
   ```

4. **Importing test/expect from @playwright/test in spec files**:
   ```typescript
   // ❌ WRONG
   import { test, expect } from '@playwright/test'
   // ✅ CORRECT
   import { test, expect } from '../../main/typescript/base/customFixtures'
   ```

5. **Assertions inside page objects**:
   ```typescript
   // ❌ WRONG — expect in page object
   async verifyHeader() { await expect(this.page.locator(this.header)).toBeVisible() }
   // ✅ CORRECT — return a value and assert in the test
   async isHeaderVisible(): Promise<boolean> {
       const count = await this.utility.getCountOfElements({ selector: this.header })
       return count > 0
   }
   ```

6. **Not registering new page in customFixtures**:
   ```typescript
   // ❌ WRONG — new page object used directly in test without fixture registration
   const myPage = new MyPage(page)
   // ✅ CORRECT — register in customFixtures.ts, then destructure in test
   myPage: async ({ page }, use) => { return await use(new MyPage(page)) }
   ```

7. **Hard-coded waits without necessity**:
   ```typescript
   // ❌ Avoid unless absolutely necessary
   await this.page.waitForTimeout(5000)
   // ✅ Use locator-based waits
   await this.saveBtn().waitFor({ state: 'visible', timeout: 10000 })
   await this.utility.waitForLocator({ selector: this.header, timedOut: 10000 })
   ```

---

**Remember**: This project uses **BasePage + Utility** patterns. All page objects extend `BasePage`, all interactions use `this.utility.*` (for string selectors) or direct locator calls (for arrow-function selectors), and all methods use `@step()` decorators. Tests import from `customFixtures`, navigate via `page.goto(ENV.BASE_URL)`, and assert with `expect()` from Playwright.
