import { expect, test }
from '../../main/typescript/base/customFixtures'

test.beforeEach(async ({ pannaHomePage,timesheetsPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`);
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.isWeekSelectedHeaderVisible()
})

/**
 * Timesheets Page Title Test
 */
test('Timesheets Page Title Test',async ({ timesheetsPage }) => {
    const title = await timesheetsPage.getTimeEntryPageTitle()
    await expect(title).toBe('Time Entries')
})

/**
 * Timesheets Page URL Test
 */
test('Timesheets Page URL Test',async ({ timesheetsPage }) => {
    const url = await timesheetsPage.getTimeEntryPageUrl()
    await expect(url).toContain(`/time-entries`)
})

/**
 * Add Project to Timesheet Test
 */
test('Add Project to Timesheet Test', async ({ timesheetsPage }) => {
    await test.step('Add project and activity', async () => {
        await timesheetsPage.clickAddProject()
        await timesheetsPage.waitForProjectPopup()
        await timesheetsPage.searchAndSelectProject('ATS')
        await timesheetsPage.searchAndSelectActivity('ATS','Development1')
    })
    await test.step('Enter work hours', async () => {
        await timesheetsPage.enterHoursForProject('ATS', 2, 3, 4, 5, 6)
    })
    const totalHours = await timesheetsPage.getTotalHours()
    const successMsg = await timesheetsPage.clickSave()
    await test.step('Reset Timesheet', async () => {
        await timesheetsPage.clickReset()
    })
    await test.step('Validate save and total hours', async () => {
        expect.soft(successMsg).toBe('Saved Successfully')
        expect.soft(totalHours).toBe('20:00')
    })
})

/**
 * Reset Timesheet Test
 */
test('Reset Timesheet Test', async ({ timesheetsPage }) => {
    await test.step('Add project and activity', async () => {
        await timesheetsPage.clickAddProject()
        await timesheetsPage.waitForProjectPopup()
        await timesheetsPage.searchAndSelectProject('CGMFP')
        await timesheetsPage.searchAndSelectActivity('CGMFP','Code Review')
    })
    await test.step('Enter work hours', async () => {
        await timesheetsPage.enterHoursForProject('CGMFP', 1, 2, 3, 4, 5)
    })
    await timesheetsPage.clickSave()
    const resetMessage = await timesheetsPage.clickReset()
    await test.step('Validate reset message', async () => {
        expect.soft(resetMessage).toBe('Saved Successfully')
        expect.soft(await timesheetsPage.isProjectOptionVisible('CGMFP')).toBeFalsy()
    })
})