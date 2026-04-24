# GitHub Copilot Instructions for Playwright Automation Framework

## Overview

This document provides instructions and guidelines for using GitHub Copilot to assist with the development of the Playwright automation framework, with a focus on the `BusinessEntityInformationPageActions.ts` file.

## General Guidelines

1. **Code Style**: Follow the existing code style and conventions used in the project.
2. **Comments**: Ensure that generated code includes appropriate comments to explain the logic.
3. **Error Handling**: Include proper error handling in the generated code.
4. **Testing**: Generate unit tests for new code where applicable.

## Specific Instructions

### Writing Tests

When writing tests using Playwright, ensure the following:

-   Use descriptive test names.
-   Include setup and teardown logic where necessary.
-   Use assertions to validate the expected behavior.

Example:

```typescript
import { test, expect } from '@playwright/test'

test('example test', async ({ page }) => {
    await page.goto('https://example.com')
    const title = await page.title()
    expect(title).toBe('Example Domain')
})
```

### Page Object Model

Encourage the use of the Page Object Model (POM) to organize the code. Each page should have its own class with methods representing actions on that page.

Example from `BusinessEntityInformationPageActions.ts`:

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

### Handling Selectors

Use data-test attributes for selectors to make tests more robust and less prone to breaking due to UI changes.

Example:

### Filling a textBox

```typescript
await this.utility.typeText({ selector: PaymentDetailsPageActions.registerNumerTextbox, text: '123456' })
```

### Clicking a Button

```typescript
await this.utility.click({ selector: BusinessEntityInformationPageActions.addPrincipalBtn })
```

### Check a CheckBox

```typescript
await this.utility.check({ selector: ExisitngLicenseListPageActions.legacyLicenseNumberCheckBox(licenseNumber) })
```

### Select a DropdownValue

```typescript
await this.utility.selectDropDownValue({ selector: PaymentDetailsPageActions.paymentTypeDropdown, text: 'Check' })
```

## Additional Resources

-   [Playwright Documentation](https://playwright.dev/docs/intro)
-   [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
