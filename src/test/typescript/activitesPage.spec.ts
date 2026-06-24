import { expect, test } from '../../main/typescript/base/customFixtures'

const ACTIVITY_PAGE_TITLE_VALUE = 'Organization Activities'      // update to match AppConstants
const ACTIVITY_PAGE_URL_FRACTION_VALUE = '/settings/organization/activities'
const USERS_PAGE_PARTIAL_SUCCESS_MSG = 'successfully'
const UPDATED_PARTIAL_SUCCESS_MSG = 'updated'
const DELETED_PARTIAL_SUCCESS_MSG = 'deleted'

// ✅ Shared state across tests in this file (mirrors Java instance fields)
let activityToEdit: string
let activityToDelete: string

function getRandomActivityName(): string {
    return `Automation ${Date.now()} Testing`
}

// =========================================
// BEFORE EACH
// =========================================

test.beforeEach(async ({ pannaHomePage, timesheetsPage, timesheetsSettingsPage, orgSetup, activityPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.goToSettingsTab()
    await timesheetsSettingsPage.goToOrgSetup()
    await orgSetup.goToActivities()
    await activityPage.isTableDisplayed()
})

// =========================================
// AFTER EACH — cleanup: close modal if open
// =========================================

test.afterEach(async ({ activityPage }) => {
    try {
        if (activityPage.page.isClosed()) return
        const isClosed = await activityPage.isAddActivityFormClosed()
        if (!isClosed) await activityPage.safelyCloseAddActivityForm()
    } catch {
        console.log('Form already closed')
    }
})

// =========================================
// TESTS
// =========================================

test('Activities Page Title Test', async ({ activityPage }) => {
    const title = await activityPage.getActivityPageTitle()
    expect(title).toContain(ACTIVITY_PAGE_TITLE_VALUE)
})

test('Activities Page URL Test', async ({ activityPage }) => {
    const url = await activityPage.getActivityPageUrl()
    expect(url).toContain(ACTIVITY_PAGE_URL_FRACTION_VALUE)
})

test('Add Activity Test', async ({ activityPage }) => {
    const actName = getRandomActivityName()
    activityToEdit = actName

    await activityPage.addActivity('HR', actName, true)
    const msg = await activityPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(USERS_PAGE_PARTIAL_SUCCESS_MSG)
})

test('Edit Activity Test', async ({ activityPage }) => {
    const actName = getRandomActivityName()
    activityToDelete = actName
    const updatedFields = new Map<string, string>([
        ['Activity Name', actName],
        ['Department Name', 'IT'],
    ])

    await activityPage.searchActivity(activityToEdit)
    await activityPage.editActivity(activityToEdit, updatedFields)
    const msg = await activityPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(UPDATED_PARTIAL_SUCCESS_MSG)
})

test('Delete Activity Test', async ({ activityPage }) => {
    await activityPage.searchActivity(activityToDelete)
    await activityPage.deleteActivity(activityToDelete)
    const msg = await activityPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(DELETED_PARTIAL_SUCCESS_MSG)
})

test('Activities Table Exists Test', async ({ activityPage }) => {
    expect(await activityPage.isTableExists()).toBeTruthy()
})

test('Activities Table Headers Test', async ({ activityPage }) => {
    const headers = await activityPage.getTableHeaders()
    expect(headers).toEqual(['S.No', 'Name'])
})

test('Do Search Test', async ({ activityPage }) => {
    expect(await activityPage.doSearch('Test')).toBeTruthy()
})



// =========================================
// FORM VALIDATION TESTS
// =========================================

test('Validate Activity Mandatory Fields Test', async ({ activityPage }) => {
    await activityPage.openAddActivityForm()
    await activityPage.clickAddWithoutData()

    const errors = await activityPage.getActivityValidationErrors()
    console.log('Validation Errors:', errors)
    expect(errors).toContain('Activity required') // ✅ update to match exact app text
})

// =========================================
// RESET BUTTON TESTS
// =========================================

test('Activity Reset Enable Test', async ({ activityPage }) => {
    await activityPage.addActivity('HR', 'Temp Activity', false)
    expect(await activityPage.isResetEnabled()).toBeTruthy()
})

test('Activity Reset Form Test', async ({ activityPage }) => {
    await activityPage.addActivity('HR', 'Temp Activity', false)
    await activityPage.clickReset()
    expect(await activityPage.isFormCleared()).toBeTruthy()
})

test('Activity Reset Disables Button Test', async ({ activityPage }) => {
    await activityPage.addActivity('HR', 'Temp Activity', false)
    await activityPage.clickReset()
    expect(await activityPage.isResetEnabled()).toBeFalsy()
})

// =========================================
// DUPLICATE ACTIVITY NAME VALIDATION TEST
// =========================================

test('Duplicate Activity Name Validation Test', async ({ activityPage }) => {
    // Use an existing activity name known to already exist
    const existingActivityName = 'Development1'
    await activityPage.addActivity('Developer', existingActivityName, true)
    const errors = await activityPage.getActivityValidationErrors()
    expect(errors).toContain('Given Activity name already exists')
})