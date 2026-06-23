import { expect, test } from '../../main/typescript/base/customFixtures'

const PROJECTS_PAGE_TITLE_VALUE = 'Organization Projects'      // update to match AppConstants
const PROJECTS_PAGE_URL_FRACTION_VALUE = '/settings/organization/projects'
const USERS_PAGE_PARTIAL_SUCCESS_MSG = 'successfully'
const UPDATED_PARTIAL_SUCCESS_MSG = 'updated'
const DELETED_PARTIAL_SUCCESS_MSG = 'deleted'

// ✅ Shared state across tests in this file (mirrors Java instance fields)
let projectToEdit: string
let projectToDelete: string

function getRandomProjectName(): string {
    return `Automation ${Date.now()} Testing`
}

function getRandomColorCode(): string {
    const hexDigits = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
        color += hexDigits[Math.floor(Math.random() * 16)]
    }
    return color
}

// =========================================
// BEFORE EACH
// =========================================

test.beforeEach(async ({ pannaHomePage, timesheetsPage, timesheetsSettingsPage, orgSetup, projectsPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.goToSettingsTab()
    await timesheetsSettingsPage.goToOrgSetup()
    await orgSetup.goToProjects()
    await projectsPage.isTableDisplayed()
})

// =========================================
// AFTER EACH
// =========================================

test.afterEach(async ({ projectsPage }) => {
    try {
        if (projectsPage.page.isClosed()) return
        const isClosed = await projectsPage.isProjectFormClosed()
        if (!isClosed) await projectsPage.safelyCloseProjectForm()
    } catch {
        console.log('Form already closed')
    }
})

// =========================================
// TESTS
// =========================================

test('Projects Page Title Test', async ({ projectsPage }) => {
    const title = await projectsPage.getProjectsPageTitle()
    expect(title).toContain(PROJECTS_PAGE_TITLE_VALUE)
})

test('Projects Page URL Test', async ({ projectsPage }) => {
    const url = await projectsPage.getProjectsPageUrl()
    expect(url).toContain(PROJECTS_PAGE_URL_FRACTION_VALUE)
})

test('Add Project Test', async ({ projectsPage }) => {
    const actName = getRandomProjectName()
    projectToEdit = actName
    await projectsPage.addProject(actName, 'APO', 'MRoads', 'Gautham Hr Pm Three', '2024-January-11', getRandomColorCode())
    const msg = await projectsPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(USERS_PAGE_PARTIAL_SUCCESS_MSG)
})

test('Edit Project Test', async ({ projectsPage }) => {
    const actName = getRandomProjectName()
    projectToDelete = actName
    const updatedFields = new Map<string, string>([
        ['Name of Project', actName],
        ['Display Name', 'APOE'],
    ])

    await projectsPage.page.waitForTimeout(4000) // ✅ kept from original — allow backend index/search refresh
    await projectsPage.searchProject(projectToEdit)
    await projectsPage.editProject(projectToEdit, updatedFields)
    const msg = await projectsPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(UPDATED_PARTIAL_SUCCESS_MSG)
})

test('Delete Project Test', async ({ projectsPage }) => {
    await projectsPage.searchProject(projectToDelete)
    await projectsPage.deleteProject(projectToDelete)
    const msg = await projectsPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(DELETED_PARTIAL_SUCCESS_MSG)
})

test('Projects Table Exists Test', async ({ projectsPage }) => {
    expect(await projectsPage.isTableExists()).toBeTruthy()
})

test('Projects Table Headers Test', async ({ projectsPage }) => {
    const headers = await projectsPage.getTableHeaders()
    expect(headers).toEqual(['S.No', 'Name', 'Client', 'Project Manager', 'Start Date', 'End Date'])
})

test('Default Filters Test', async ({ projectsPage }) => {
    const defaultValue = await projectsPage.getDefaultFilterValue()
    expect(defaultValue).toBe('')
})

test('Filter By Client Test', async ({ projectsPage }) => {
    expect(await projectsPage.filterByClient('Apple')).toBeTruthy()
})

test('Clear Filters Test', async ({ projectsPage }) => {
    await projectsPage.filterByClient('Apple')
    await projectsPage.doClearFilter()
    const defaultValue = await projectsPage.getDefaultFilterValue()
    expect(defaultValue).toBe('')
})

test('Do Search Test', async ({ projectsPage }) => {
    expect(await projectsPage.doSearch('Test')).toBeTruthy()
})

test('Validate Project Mandatory Fields Test', async ({ projectsPage }) => {
    await projectsPage.openAddProjectForm()
    await projectsPage.clickAddWithoutData()
    const errors = await projectsPage.getProjectValidationErrors()
    console.log(errors)
    expect(errors).toContain('Project Name Required')
    expect(errors).toContain('Display Name Required')
    expect(errors).toContain('Client required')
    expect(errors).toContain('Project Manager required')
})

test('Partial Project Validation Test', async ({ projectsPage }) => {
    await projectsPage.openAddProjectForm()
    await projectsPage.enterProjectNameOnly('Test Project')
    await projectsPage.clickAddWithoutData()
    const errors = await projectsPage.getProjectValidationErrors()
    expect(errors).not.toContain('Project Name Required')
    expect(errors).toContain('Display Name Required')
})

test('Project Reset Enable Test', async ({ projectsPage }) => {
    await projectsPage.openAddProjectForm()
    await projectsPage.enterProjectNameOnly('Temp Project')
    expect(await projectsPage.isResetEnabled()).toBeTruthy()
})

test('Project Reset Form Test', async ({ projectsPage }) => {
    await projectsPage.openAddProjectForm()
    await projectsPage.enterProjectNameOnly('Temp Project')
    await projectsPage.clickReset()
    expect(await projectsPage.isFormCleared()).toBeTruthy()
})


test('Duplicate Project Name Validation Test', async ({ projectsPage }) => {
    const existingProjectName = 'ATS'
    await projectsPage.addProject(
        existingProjectName,
        'Duplicate Name Test',
        'MRoads',
        'Gautham Hr Pm Three',
        '2026-January-15',
        getRandomColorCode()
    )
    // const duplicateError = await projectsPage.getDuplicateFieldError()
    // expect(duplicateError).not.toBeNull()
    // expect(duplicateError?.toLowerCase()).toContain('already exist')
    const errors = await projectsPage.getProjectValidationErrors()
    const hasDuplicateError = errors.some(err => err.toLowerCase().includes('already exist'))
    expect(hasDuplicateError).toBeTruthy()
})


test('Duplicate Project Color Code Validation Test', async ({ projectsPage }) => {
    const existingColorCode = '#01B874'
    const newProjectName = getRandomProjectName()
    await projectsPage.addProject(
        newProjectName,
        'Duplicate Color Test',
        'MRoads',
        'Gautham Hr Pm Three',
        '2026-January-16',
        existingColorCode
    )
    const errors = await projectsPage.getProjectValidationErrors()
    const hasDuplicateError = errors.some(err => err.toLowerCase().includes('already assigned to another project'))
    expect(hasDuplicateError).toBeTruthy()
})