import { test } from '../../main/typescript/base/customFixtures'

test('Login As Admin', async ({ landingPage, loginPage, adminHomePage }) => {
    await landingPage.navigateToLandingPage()
    await landingPage.clickLoginToTestBtn()
    await loginPage.performLogin('admin@test.com', 'admin123')
    await adminHomePage.isRecentOrdersHeaderVisible()
    await adminHomePage.clickClearDataBtn() 
})