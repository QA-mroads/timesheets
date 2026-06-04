import { expect, test } from '../../main/typescript/base/customFixtures'

// =========================================
// CONSTANTS
// =========================================

const ORGSETUP_PAGE_URL_FRACTION_VALUE = '/settings/organization'
const USERS_PAGE_PARTIAL_SUCCESS_MSG = 'successfully'  // update to match your AppConstants value
const UPDATED_PARTIAL_SUCCESS_MSG = 'updated'           // update to match your AppConstants value
const DELETED_PARTIAL_SUCCESS_MSG = 'deleted'           // update to match your AppConstants value

// =========================================
// BEFORE EACH - Navigation Setup
// =========================================

test.beforeEach(async ({ pannaHomePage, timesheetsPage, timesheetsSettingsPage, orgSetup }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.goToSettingsTab()
    await timesheetsSettingsPage.goToOrgSetup()
    await orgSetup.isTableDisplayed()
})

// =========================================
// AFTER EACH - Cleanup: close modal if open
// =========================================

// test.afterEach(async ({ orgSetup }) => {
//     try {
//         const isClosed = await orgSetup.isAddLeaveFormClosed()
//         if (!isClosed) {
//             await orgSetup.safelyCloseAddLeaveForm()
//         }
//     } catch {
//         console.log('Form already closed')
//     }
// })

// =========================================
// TEST SUITE: Organization Setup - Leaves
// =========================================

/**
 * Page Title Test
 */
test('Org Setup Page Title Test', async ({ orgSetup }) => {
    const actTitle = await orgSetup.getOrgSetupPageTitle()
    expect(actTitle).toContain('Organization Leaves')
})

/**
 * Page URL Test
 */
test('Org Setup Page URL Test', async ({ orgSetup }) => {
    const actUrl = await orgSetup.getOrgSetupPageUrl()
    expect(actUrl).toContain(ORGSETUP_PAGE_URL_FRACTION_VALUE)
})

/**
 * Table Exists Test
 */
test('Org Setup Table Exists Test', async ({ orgSetup }) => {
    const isVisible = await orgSetup.isTableExists()
    expect(isVisible).toBeTruthy()
})

/**
 * Table Headers Test
 */
test('Org Setup Table Headers Test', async ({ orgSetup }) => {
    const actHeaders = await orgSetup.getTableHeaders()
    const expectedHeaders = ['S.No', 'Leave Type', 'Leave Count', 'Country']
    expect(actHeaders).toEqual(expectedHeaders)
})

/**
 * Default Filters Test
 */
test('Default Filters Test', async ({ orgSetup }) => {
    const defaultValue = await orgSetup.getDefaultFilterValue()
    expect(defaultValue).toBe('0')
})

/**
 * Filter By Country Test
 */
test('Filter By Country Test', async ({ orgSetup }) => {
    const result = await orgSetup.filterByCountry('United States')
    expect(result).toBeTruthy()
})

/**
 * Clear Filters Test
 */
test('Clear Filters Test', async ({ orgSetup }) => {
    await orgSetup.filterByCountry('United States')
    await orgSetup.doClearFilter()
    const defaultValue = await orgSetup.getDefaultFilterValue()
    expect(defaultValue).toBe('0')
})

/**
 * Add Leave Type Test
 */
test('Add Leave Type Test', async ({ orgSetup }) => {
    await orgSetup.addLeaveType('Auto Test One', '10', 'AT', '#0e1213')
    const text = await orgSetup.getSuccessMsg()
    expect(text.toLowerCase()).toContain(USERS_PAGE_PARTIAL_SUCCESS_MSG)
})

/**
 * Edit Leave Type Test
 */
test('Edit Leave Type Test', async ({ orgSetup }) => {
    const updatedFields = new Map<string, string>([
        ['Leave Name', 'Auto Test One Edit'],
        ['Short Code', 'ATE'],
    ])
    await orgSetup.searchLeaveType('Auto Test One (AT)')
    await orgSetup.editLeaveType('Auto Test One (AT)', updatedFields)  // ✅ single call
    expect((await orgSetup.getSuccessMsg()).toLowerCase()).toContain(UPDATED_PARTIAL_SUCCESS_MSG)
})

/**
 * Delete Leave Type Test
 */
test('Delete Leave Type Test', async ({ orgSetup }) => {
    await orgSetup.searchLeaveType('Auto Test One Edit (ATE)')
    await orgSetup.deleteLeaveType('Auto Test One Edit (ATE)')          // ✅ unchanged signature
    expect((await orgSetup.getSuccessMsg()).toLowerCase()).toContain(DELETED_PARTIAL_SUCCESS_MSG)
})

/**
 * Validate Mandatory Fields Test
 */
test('Validate Mandatory Fields Test', async ({ orgSetup }) => {
    await orgSetup.openAddLeaveForm()
    await orgSetup.clickAddWithoutData()

    const errors = await orgSetup.getAllValidationMessages()
    console.log('Validation Errors:', errors)

    expect(errors).toContain('Country required')
    expect(errors).toContain('Leave Type required')
    expect(errors).toContain('Activity required')   // Leave Count
    expect(errors).toContain('Short Name required')
})

/**
 * Partial Mandatory Validation Test
 */
test('Partial Mandatory Validation Test', async ({ orgSetup }) => {
    await orgSetup.openAddLeaveForm()
    await orgSetup.enterLeaveTypeOnly('Test Leave')
    await orgSetup.clickAddWithoutData()

    const errors = await orgSetup.getAllValidationMessages()

    expect(errors).not.toContain('Leave Type required') // should NOT appear
    expect(errors).toContain('Country required')
})

/**
 * Reset Button Enable Test
 */
test('Reset Button Enable Test', async ({ orgSetup }) => {
    await orgSetup.openAddLeaveForm()
    await orgSetup.enterLeaveTypeOnly('Temp Leave')
    const isEnabled = await orgSetup.isResetEnabled()
    expect(isEnabled).toBeTruthy()
})

/**
 * Reset Form Test
 */
test('Reset Form Test', async ({ orgSetup }) => {
    await orgSetup.openAddLeaveForm()
    await orgSetup.enterLeaveTypeOnly('Temp Leave')
    await orgSetup.clickReset()
    const isCleared = await orgSetup.isFormCleared()
    expect(isCleared).toBeTruthy()
})

/**
 * Reset Disables Button Test
 */
test('Reset Disables Button Test', async ({ orgSetup }) => {
    await orgSetup.openAddLeaveForm()
    await orgSetup.enterLeaveTypeOnly('Temp Leave')
    await orgSetup.clickReset()
    const isEnabled = await orgSetup.isResetEnabled()
    expect(isEnabled).toBeFalsy()
})