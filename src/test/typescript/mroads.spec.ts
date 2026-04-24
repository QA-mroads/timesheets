import { expect } from '@playwright/test'

import { test } from '../../main/typescript/base/customFixtures'

test.beforeEach(async ({ homePage }) => {
    await homePage.launchApp()
})

test.describe(`Home Page Content Validation`, () => {
    test('Verify If any Article Images are Broken in Home Page', async ({ homePage, contactUsPage, page }) => {
        await homePage.clickContactUsButton()
        await contactUsPage.fillContactUsForm({
            name: 'John Doe',
            email: 'john.doe',
            message: 'Hello, this is a test message.',
        })
        const errorMessage = await contactUsPage.getEmailFormatErrorMessage()
        expect(errorMessage).toEqual('Enter valid email id.')
    })
})
