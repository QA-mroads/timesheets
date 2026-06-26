import { expect, test } from '../../main/typescript/base/customFixtures'

const USERS_PAGE_PARTIAL_SUCCESS_MSG = 'successfully'
const UPDATED_PARTIAL_SUCCESS_MSG = 'updated'
const DELETED_PARTIAL_SUCCESS_MSG = 'deleted'

let countryToEdit: string
let countryToDelete: string

function getRandomCountryName(): string {
    return `Testland ${Date.now()}`
}

function getRandomShortName(): string {
    return `T${Math.floor(Math.random() * 100)}`
}

// =========================================
// BEFORE EACH
// =========================================

test.beforeEach(async ({ pannaHomePage, timesheetsPage, timesheetsSettingsPage, orgSetup, countriesPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.goToSettingsTab()
    await timesheetsSettingsPage.goToOrgSetup()
    await orgSetup.page.locator("[data-testid='org-countries']").click() // ✅ navigate to Countries tab
    await countriesPage.isTableDisplayed()
})

// =========================================
// AFTER EACH
// =========================================

test.afterEach(async ({ countriesPage }) => {
    try {
        if (countriesPage.page.isClosed()) return
        const isClosed = await countriesPage.isAddCountryFormClosed()
        if (!isClosed) await countriesPage.safelyCloseAddCountryForm()
    } catch {
        console.log('Form already closed')
    }
})

// =========================================
// TESTS
// =========================================

test('Countries Table Exists Test', async ({ countriesPage }) => {
    expect(await countriesPage.isTableExists()).toBeTruthy()
})

test('Countries Table Headers Test', async ({ countriesPage }) => {
    const headers = await countriesPage.getTableHeaders()
    expect(headers).toEqual(['S.No', 'Name', 'Short Name', 'Country Code'])
})

// test('Add Country Test', async ({ countriesPage }) => {
//     const countryName = getRandomCountryName()
//     countryToEdit = countryName

//     await countriesPage.addCountry(countryName, getRandomShortName(), '+99')
//     const msg = await countriesPage.getSuccessMsg()
//     expect(msg.toLowerCase()).toContain(USERS_PAGE_PARTIAL_SUCCESS_MSG)
// })

// test('Edit Country Test', async ({ countriesPage }) => {
//     const updatedFields = new Map<string, string>([
//         ['Short Name', 'TST'],
//     ])

//     await countriesPage.editCountry(countryToEdit, updatedFields)
//     const msg = await countriesPage.getSuccessMsg()
//     expect(msg.toLowerCase()).toContain(UPDATED_PARTIAL_SUCCESS_MSG)
// })

// test('Delete Country Test', async ({ countriesPage }) => {
//     await countriesPage.deleteCountry(countryToEdit)
//     const msg = await countriesPage.getSuccessMsg()
//     expect(msg.toLowerCase()).toContain(DELETED_PARTIAL_SUCCESS_MSG)
// })

test('Do Search Test', async ({ countriesPage }) => {
    expect(await countriesPage.doSearch('INDIA')).toBeTruthy()
})

// =========================================
// FORM VALIDATION TESTS
// =========================================

test('Validate Country Mandatory Fields Test', async ({ countriesPage }) => {
    await countriesPage.openAddCountryForm()
    await countriesPage.clickAddWithoutData()

    const errors = await countriesPage.getCountryValidationErrors()
    console.log('Validation Errors:', errors)
    expect(errors).toContain('Country name is required')
})

test('Partial Country Validation Test', async ({ countriesPage }) => {
    await countriesPage.openAddCountryForm()
    await countriesPage.enterCountryNameOnly('Test Country')
    await countriesPage.clickAddWithoutData()

    const errors = await countriesPage.getCountryValidationErrors()
    expect(errors).not.toContain('Country name is required')
})

// =========================================
// RESET BUTTON TESTS
// =========================================

test('Country Reset Disabled By Default Test', async ({ countriesPage }) => {
    await countriesPage.openAddCountryForm()
    // ✅ Confirmed from DOM — Reset button has disabled="" attribute when form is empty
    expect(await countriesPage.isResetEnabled()).toBeFalsy()
})

test('Country Reset Enable Test', async ({ countriesPage }) => {
    await countriesPage.openAddCountryForm()
    await countriesPage.enterCountryNameOnly('Temp Country')
    expect(await countriesPage.isResetEnabled()).toBeTruthy()
})

test('Country Reset Form Test', async ({ countriesPage }) => {
    await countriesPage.openAddCountryForm()
    await countriesPage.enterCountryNameOnly('Temp Country')
    await countriesPage.clickReset()
    expect(await countriesPage.isFormCleared()).toBeTruthy()
})

test('Country Reset Disables Button Test', async ({ countriesPage }) => {
    await countriesPage.openAddCountryForm()
    await countriesPage.enterCountryNameOnly('Temp Country')
    await countriesPage.clickReset()
    expect(await countriesPage.isResetEnabled()).toBeFalsy()
})

// =========================================
// DUPLICATE COUNTRY NAME VALIDATION TEST
// =========================================

test('Duplicate Country Name Validation Test', async ({ countriesPage }) => {
    const existingCountryName = 'Test Country'
    await countriesPage.fillAddCountryForm(existingCountryName, '', '')
    const duplicateErrors = await countriesPage.getDuplicateFieldError()
    expect(duplicateErrors.length).toBeGreaterThan(0)
    expect(duplicateErrors.some(e => e.toLowerCase().includes('already exist'))).toBeTruthy()
    await countriesPage.safelyCloseAddCountryForm()
})