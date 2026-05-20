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
test('Add Project to Timesheet Test',async ({ timesheetsPage }) => {
    await timesheetsPage.clickAddProject()
    await timesheetsPage.waitForProjectPopup()
    await timesheetsPage.searchAndSelectProject('ATS')
    await timesheetsPage.searchAndSelectActivity('ATS', 'Development1')
    await timesheetsPage.enterHoursForProject('ATS', 2, 3, 4, 5, 6)
    const totalHours = await timesheetsPage.getTotalHours()
    await expect(totalHours).toBe('20:00')
})
