import { expect, test } from '../../main/typescript/base/customFixtures'

const HOLIDAYS_PAGE_TITLE_VALUE = 'Organization Holidays'       // update to match AppConstants
const HOLIDAYS_PAGE_URL_FRACTION_VALUE = '/settings/organization/holidays'
const USERS_PAGE_PARTIAL_SUCCESS_MSG = 'successfully'
const UPDATED_PARTIAL_SUCCESS_MSG = 'updated'
const DELETED_PARTIAL_SUCCESS_MSG = 'deleted'

// =========================================
// BEFORE EACH
// =========================================

test.beforeEach(async ({ pannaHomePage, timesheetsPage, timesheetsSettingsPage, orgSetup, holidaysPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.goToSettingsTab()
    await timesheetsSettingsPage.goToOrgSetup()
    await orgSetup.goToHolidays()
    await holidaysPage.isTableDisplayed()
})

// =========================================
// AFTER EACH
// =========================================

test.afterEach(async ({ holidaysPage }) => {
    try {
        if (holidaysPage.page.isClosed()) return
        const isClosed = await holidaysPage.isHolidayFormClosed()
        if (!isClosed) await holidaysPage.safelyCloseHolidayForm()
    } catch {
        console.log('Form already closed')
    }
})

// =========================================
// TESTS
// =========================================

test('Holidays Page Title Test', async ({ holidaysPage }) => {
    const title = await holidaysPage.getHolidaysPageTitle()
    expect(title).toContain(HOLIDAYS_PAGE_TITLE_VALUE)
})

test('Holidays Page URL Test', async ({ holidaysPage }) => {
    const url = await holidaysPage.getHolidaysPageUrl()
    expect(url).toContain(HOLIDAYS_PAGE_URL_FRACTION_VALUE)
})

test('Holidays Table Exists Test', async ({ holidaysPage }) => {
    expect(await holidaysPage.isTableExists()).toBeTruthy()
})

test('Holidays Table Headers Test', async ({ holidaysPage }) => {
    const headers = await holidaysPage.getTableHeaders()
    expect(headers).toEqual(['S.No', 'Description', 'Event Date', 'Holiday Calendar'])
})

test('Default Filters Test', async ({ holidaysPage }) => {
    const filters = await holidaysPage.getDefaultFilterValue()
    expect(filters).toEqual(['All', '2026'])
})

test('Filter By Holiday Calendar Test', async ({ holidaysPage }) => {
    expect(await holidaysPage.filterByHolidayCalendar('India_Holiday_2026')).toBeTruthy()
})

test('Add Holiday Test', async ({ holidaysPage }) => {
    const dateValue = '2026-December-29'
    await holidaysPage.addNewHoliday('India_Holiday_2026', dateValue, 'Automation Testing Holiday')
    const msg = await holidaysPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(USERS_PAGE_PARTIAL_SUCCESS_MSG)
})

test('Edit Holiday Test', async ({ holidaysPage }) => {
    const updatedFields = new Map<string, string>([
        ['Description', 'Testing Holiday Updated']
    ])
    await holidaysPage.searchHoliday('Automation Testing Holiday')
    await holidaysPage.editHoliday('Automation Testing Holiday', updatedFields)
    const msg = await holidaysPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(UPDATED_PARTIAL_SUCCESS_MSG)
})

test('Delete Holiday Test', async ({ holidaysPage }) => {
    await holidaysPage.searchHoliday('Testing Holiday Updated')
    await holidaysPage.deleteHoliday('Testing Holiday Updated')
    const msg = await holidaysPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(DELETED_PARTIAL_SUCCESS_MSG)
})

test('Validate Holiday Mandatory Fields Test', async ({ holidaysPage }) => {
    await holidaysPage.openAddHolidayForm()
    await holidaysPage.clickAddWithoutData()
    const errors = await holidaysPage.getHolidayValidationErrors()
    console.log('Validation Errors:', errors)
    expect(errors).toContain('Holiday calendar required')
    expect(errors).toContain('Description required')
})

test('Partial Holiday Validation Test', async ({ holidaysPage }) => {
    await holidaysPage.openAddHolidayForm()
    await holidaysPage.enterHolidayCalendarOnly('India_Holiday_2026')
    await holidaysPage.clickAddWithoutData()
    const errors = await holidaysPage.getHolidayValidationErrors()
    expect(errors).not.toContain('Holiday calendar required')
})

test('Holiday Reset Enable Test', async ({ holidaysPage }) => {
    await holidaysPage.openAddHolidayForm()
    await holidaysPage.enterHolidayCalendarOnly('India_Holiday_2026')
    expect(await holidaysPage.isResetEnabled()).toBeTruthy()
})

test('Holiday Reset Form Test', async ({ holidaysPage }) => {
    await holidaysPage.openAddHolidayForm()
    await holidaysPage.enterDescriptionOnly('Test Description')
    await holidaysPage.clickReset()
    expect(await holidaysPage.isFormCleared()).toBeTruthy()
})

test('Past Holiday Date Disabled Test', async ({ holidaysPage }) => {
    await holidaysPage.openHolidayDatePicker()
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)
    if (yesterday.getMonth() !== today.getMonth()) {
        test.skip(true, 'Today is the 1st of the month — skipping same-month past-date check')
    }
    const isDisabled = await holidaysPage.isCurrentMonthDayDisabled(yesterday.getDate().toString())
    expect(isDisabled).toBeTruthy()
})

test('Duplicate Holiday Date Validation Test', async ({ holidaysPage }) => {
    const dateValue = '2026-December-25'
    // Holiday already exists on this date (created manually) — attempt should fail
    await holidaysPage.addNewHoliday('India_Holiday_2026', dateValue, 'Duplicate Date Test')
    const duplicateError = await holidaysPage.getDuplicateDateError()
    expect(duplicateError).not.toBeNull()
    expect(duplicateError?.toLowerCase()).toContain('already exist')
    // Form is still open since Add failed validation — close it
    await holidaysPage.safelyCloseHolidayForm()
})