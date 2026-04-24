import { expect, test } from '../../main/typescript/base/customFixtures'

test('Login Page Title Test', async ({ pannaLoginPage }) => {
    await pannaLoginPage.navigateToLoginPage()
    const title = await pannaLoginPage.getPageTitle()
    await expect(title).toBe('Login')
});

test('Login Functionality Test', async ({ pannaLoginPage}) => {
    await pannaLoginPage.navigateToLoginPage()
    await pannaLoginPage.performLogin('gautham.emp52@yopmail.com')
    const isMailCheckHeaderVisible = await pannaLoginPage.isMailCheckHeaderVisible()
    await expect(isMailCheckHeaderVisible).toContain('Check your email')
});
