import { expect, test }
from '../../main/typescript/base/customFixtures'

test.beforeEach(async ({pannaHomePage,timesheetsPage,timesheetsSettingsPage}) => {
        await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`);
        await pannaHomePage.clickDashboardLink()
        await pannaHomePage.clickTimesheetsTab()
        await timesheetsPage.goToSettingsTab()
        await timesheetsSettingsPage.waitForSettingsPage()
})

    /**
     * Page Title Test
     */
    test('Settings Page Title Test',async ({ timesheetsSettingsPage }) => {
        const title =  await timesheetsSettingsPage.getSettingsPageTitle()
        expect(title).toContain('Timesheet Configuration')
    })

    /**
     * Page URL Test
     */
    test('Settings Page URL Test',async ({ timesheetsSettingsPage }) => {
        const url = await timesheetsSettingsPage.getSettingsPageUrl()
        expect(url).toContain('/settings')
    })

    /**
     * Table Exists Test
     */
    test('Settings Table Exists Test',async ({ timesheetsSettingsPage }) => {
        const visible = await timesheetsSettingsPage.isTableExists()
        expect(visible).toBeTruthy()
    })

    /**
     * Table Headers Test
     */
    test('Settings Table Headers Test', async ({ timesheetsSettingsPage }) => {
        const headers = await timesheetsSettingsPage.getTableHeaders()
        expect(headers).toEqual(['S.No','Name','Client','Approver','Projects Linked'])
    })

    /**
     * Default Filters Test
     */
    test('Default Filters Test', async ({ timesheetsSettingsPage }) => {
        const filters = await timesheetsSettingsPage.getDefaultFiltersValue()
        filters.forEach(value => {expect(value).toBe('')})
    })

    /**
     * Filter By Client Test
     */
    test('Filter By Client Test', async ({ timesheetsSettingsPage }) => {
        const result = await timesheetsSettingsPage.filterByClient('MRoads')
        expect(result).toBeTruthy()
    })

    /**
     * Filter By Project Test
     */
    // test('Filter By Project Test', async ({ timesheetsSettingsPage }) => {
    //     const result = await timesheetsSettingsPage.filterByProject('Panna')
    //     expect(result).toBeTruthy()
    // })

    /**
     * Filter By Manager Test
     */
    test('Filter By Manager Test', async ({ timesheetsSettingsPage }) => {
        const result = await timesheetsSettingsPage.filterByManager('Mamtha Singh.')
        expect(result).toBeTruthy()
    })

    /**
     * Clear Filters Test
     */
    test('Clear Filters Test', async ({ timesheetsSettingsPage }) => {
        await timesheetsSettingsPage.filterByClient('MRoads')
        await timesheetsSettingsPage.clearFilters()
        const filters = await timesheetsSettingsPage.getDefaultFiltersValue()
        filters.forEach(value => {expect(value).toBe('')
        })
})
