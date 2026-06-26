import { expect, test } from '../../main/typescript/base/customFixtures'

const DEPARTMENTS_PAGE_TITLE_VALUE = 'Organization Departments'      // update to match AppConstants
const DEPARTMENTS_PAGE_URL_FRACTION_VALUE = '/settings/organization/departments'
const USERS_PAGE_PARTIAL_SUCCESS_MSG = 'successfully'
const UPDATED_PARTIAL_SUCCESS_MSG = 'updated'
const DELETED_PARTIAL_SUCCESS_MSG = 'deleted'

// ✅ Shared state across tests in this file (mirrors Java instance fields)
let departmentToEdit: string
let departmentToDelete: string

function getRandomDeptName(): string {
    const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const makeWord = () => {
        const length = Math.floor(Math.random() * (10 - 2 + 1)) + 2 // 2-10 chars
        let word = ''
        for (let j = 0; j < length; j++) {
            word += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length))
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }
    return `${makeWord()} ${makeWord()}`
}

// =========================================
// BEFORE EACH
// =========================================

test.beforeEach(async ({ pannaHomePage, timesheetsPage, timesheetsSettingsPage, orgSetup, departmentsPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.goToSettingsTab()
    await timesheetsSettingsPage.goToOrgSetup()
    await orgSetup.goToDepartments()
    await departmentsPage.isTableDisplayed()
})

// =========================================
// AFTER EACH — cleanup: close modal if open
// =========================================

test.afterEach(async ({ departmentsPage }) => {
    try {
        if (departmentsPage.page.isClosed()) return
        const isClosed = await departmentsPage.isAddDepartmentFormClosed()
        if (!isClosed) await departmentsPage.safelyCloseAddDepartmentForm()
    } catch {
        console.log('Form already closed')
    }
})

// =========================================
// TESTS
// =========================================

test('Departments Page Title Test', async ({ departmentsPage }) => {
    const title = await departmentsPage.getDepartmentsPageTitle()
    expect(title).toContain(DEPARTMENTS_PAGE_TITLE_VALUE)
})

test('Departments Page URL Test', async ({ departmentsPage }) => {
    const url = await departmentsPage.getDepartmentsPageUrl()
    expect(url).toContain(DEPARTMENTS_PAGE_URL_FRACTION_VALUE)
})

test('Departments Table Exists Test', async ({ departmentsPage }) => {
    expect(await departmentsPage.isTableExists()).toBeTruthy()
})

test('Departments Table Headers Test', async ({ departmentsPage }) => {
    const headers = await departmentsPage.getTableHeaders()
    expect(headers).toEqual(['S.No', 'Name'])
})

test('Add New Department Test', async ({ departmentsPage }) => {
    const actName = getRandomDeptName()
    departmentToEdit = actName

    await departmentsPage.addNewDepartment(actName, 'Preethi')
    const msg = await departmentsPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(USERS_PAGE_PARTIAL_SUCCESS_MSG)
})

test('Edit Department Test', async ({ departmentsPage }) => {
    const actName = getRandomDeptName()
    departmentToDelete = actName
    const updatedFields = new Map<string, string>([
        ['Department Name', actName],
        ['Description', 'Scrum Team'],
    ])

    await departmentsPage.page.waitForTimeout(4000) // ✅ kept from original — allow backend index/search refresh
    await departmentsPage.searchDepartment(departmentToEdit)
    await departmentsPage.editDepartment(departmentToEdit, updatedFields)
    const msg = await departmentsPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(UPDATED_PARTIAL_SUCCESS_MSG)
})

test('Delete Department Test', async ({ departmentsPage }) => {
    await departmentsPage.page.waitForTimeout(4000) // ✅ kept from original
    await departmentsPage.searchDepartment(departmentToDelete)
    await departmentsPage.deleteDepartment(departmentToDelete)
    const msg = await departmentsPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(DELETED_PARTIAL_SUCCESS_MSG)
})

test('Do Search Test', async ({ departmentsPage }) => {
    expect(await departmentsPage.doSearch('Developer')).toBeTruthy()
})

// test('Reset Department Test', async ({ departmentsPage }) => {
//     await departmentsPage.resetDepartment('Power BI', 'Testing')
//     const nameValue = await departmentsPage.isDepartmentNameEmpty()
//     expect(nameValue).toBe('')
// })




// =========================================
// FORM VALIDATION TESTS
// =========================================

test('Validate Department Mandatory Fields Test', async ({ departmentsPage }) => {
    await departmentsPage.openAddDepartmentForm()
    await departmentsPage.clickAddWithoutData()
    const errors = await departmentsPage.getDepartmentValidationErrors()
    console.log('Validation Errors:', errors)
    expect(errors).toContain('Department required') // ✅ update to match exact app text
})

test('Partial Department Validation Test', async ({ departmentsPage }) => {
    await departmentsPage.openAddDepartmentForm()
    await departmentsPage.enterDepartmentNameOnly('Test Department')
    await departmentsPage.clickAddWithoutData()
    const errors = await departmentsPage.getDepartmentValidationErrors()
    expect(errors).not.toContain('Department required') // should NOT appear
})

// =========================================
// RESET BUTTON TESTS
// =========================================

test('Department Reset Enable Test', async ({ departmentsPage }) => {
    await departmentsPage.openAddDepartmentForm()
    await departmentsPage.enterDepartmentNameOnly('Temp Department')
    expect(await departmentsPage.isResetEnabled()).toBeTruthy()
})

test('Department Reset Clears Form Test', async ({ departmentsPage }) => {
    await departmentsPage.resetDepartment('Power BI', 'Testing')
    expect(await departmentsPage.isFormCleared()).toBeTruthy()
})

// =========================================
// DUPLICATE DEPARTMENT NAME VALIDATION TEST
// =========================================

test('Duplicate Department Name Validation Test', async ({ departmentsPage }) => {
    const existingDeptName = 'Developer'
    await departmentsPage.fillAddDepartmentForm(existingDeptName, 'Duplicate Department Test')
    const duplicateErrors = await departmentsPage.getDuplicateFieldError()
    expect(duplicateErrors.length).toBeGreaterThan(0)
    expect(duplicateErrors.some(e => e.toLowerCase().includes('already exist'))).toBeTruthy()
    await departmentsPage.safelyCloseAddDepartmentForm()
})