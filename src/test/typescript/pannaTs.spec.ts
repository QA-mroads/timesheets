import { expect, test } from '../../main/typescript/base/customFixtures'

test.beforeEach(async ({ pannaLoginPage }) => {
    await pannaLoginPage.navigateToLoginPage()
});

test('Login Page Title Test', async ({ pannaLoginPage }) => {
    const title = await pannaLoginPage.getPageTitle()
    await expect(title).toBe('Login')
});

test('Login Functionality Test', async ({ pannaLoginPage}) => {
    await pannaLoginPage.performLogin('gautham.emp52@yopmail.com')
    const isMailCheckHeaderVisible = await pannaLoginPage.isMailCheckHeaderVisible()
    await expect(isMailCheckHeaderVisible).toContain('Check your email')
});

test('Login with Non-Existent User Test', async ({ pannaLoginPage }) => {
    await pannaLoginPage.performLogin('test123@mroads.com')
    const isUserDoesNotExistErrorVisible = await pannaLoginPage.isUserDoesNotExistErrorVisible()
    await expect(isUserDoesNotExistErrorVisible).toContain('User does Not exist')
});
