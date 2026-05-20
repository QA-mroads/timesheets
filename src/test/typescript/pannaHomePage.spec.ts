import { expect, test }
from '../../main/typescript/base/customFixtures'

// test.beforeEach(async ({pannaLoginPage,yopMailPage,pannaHomePage}) => {
//     await pannaLoginPage.navigateToLoginPage()
//     await pannaLoginPage.performLogin(process.env.USERNAME2 || 'gautham.orgauto5@yopmail.com')
//     const dashboardPage = await yopMailPage.mailLogin(process.env.USERNAME2 || 'gautham.orgauto5')

//     // Switch page references
//     pannaHomePage.page = dashboardPage
//     pannaLoginPage.page = dashboardPage
// })

test.beforeEach(async ({ pannaHomePage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`);
    await pannaHomePage.clickDashboardLink()
});

/**
 * Home Page Title Test
 */
test('Home Page Title Test',async ({ pannaHomePage }) => {
    const title = await pannaHomePage.getHomePageTitle()
    await expect(title).toBe('Dashboard')
})

/**
 * Home Page URL Test
 */
test('Home Page URL Test',async ({ pannaHomePage }) => {
    const url = await pannaHomePage.getHomePageUrl()
    await expect(url).toContain('/dashboard')
})

test('Dashboard Link Visibility Test', async ({ pannaHomePage }) => {
    const isDashboardLinkVisible = await pannaHomePage.isDashboardLinkVisible()
    await expect(isDashboardLinkVisible).toBeTruthy()
})

test('Timesheets Tab Visibility Test', async ({ pannaHomePage }) => {
    const isTimesheetsTabVisible = await pannaHomePage.isTimesheetsTabVisible()
    await expect(isTimesheetsTabVisible).toBeTruthy()
})

test('Click Timesheets Tab Test', async ({ pannaHomePage }) => {
    await pannaHomePage.clickTimesheetsTab()
    const url = await pannaHomePage.getHomePageUrl()
    await expect(url).toContain('/time-entries')
})

