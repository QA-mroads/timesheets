import { expect, test } from '../../main/typescript/base/customFixtures'

const CLIENTS_PAGE_TITLE_VALUE = 'Organization Clients'      // update to match AppConstants
const CLIENTS_PAGE_URL_FRACTION_VALUE = '/settings/organization/clients'
const USERS_PAGE_PARTIAL_SUCCESS_MSG = 'successfully'
const UPDATED_PARTIAL_SUCCESS_MSG = 'updated'
const DELETED_PARTIAL_SUCCESS_MSG = 'deleted'

// ✅ Shared state across tests in this file (mirrors Java instance field)
let clientToEdit: string

function getRandomClientEmail(): string {
    return `automation${Date.now()}@yopmail.com`
}

function getRandomName(): string {
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

test.beforeEach(async ({ pannaHomePage, timesheetsPage, timesheetsSettingsPage, orgSetup, clientsPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.goToSettingsTab()
    await timesheetsSettingsPage.goToOrgSetup()
    await orgSetup.goToClients()
    await clientsPage.isTableDisplayed()
})

// =========================================
// AFTER EACH
// =========================================

test.afterEach(async ({ clientsPage }) => {
    try {
        if (clientsPage.page.isClosed()) return
        const isClosed = await clientsPage.isClientFormClosed()
        if (!isClosed) await clientsPage.safelyCloseClientForm()
    } catch {
        console.log('Form already closed')
    }
})

// =========================================
// TESTS
// =========================================

test('Clients Page Title Test', async ({ clientsPage }) => {
    const title = await clientsPage.getClientsPageTitle()
    expect(title).toContain(CLIENTS_PAGE_TITLE_VALUE)
})

test('Clients Page URL Test', async ({ clientsPage }) => {
    const url = await clientsPage.getClientsPageUrl()
    expect(url).toContain(CLIENTS_PAGE_URL_FRACTION_VALUE)
})

test('Add Client Test', async ({ clientsPage }) => {
    const actName = getRandomName()
    clientToEdit = actName

    await clientsPage.addClient(actName, 'Auto Test', 'Hyd', '9000000001', getRandomClientEmail())
    const msg = await clientsPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(USERS_PAGE_PARTIAL_SUCCESS_MSG)
})

test('Edit Client Test', async ({ clientsPage }) => {
    const updatedFields = new Map<string, string>([
        ['Location', 'Hyderabad'],
    ])

    await clientsPage.searchClient(clientToEdit)
    await clientsPage.editClient(clientToEdit, updatedFields)
    const msg = await clientsPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(UPDATED_PARTIAL_SUCCESS_MSG)
})

test('Delete Client Test', async ({ clientsPage }) => {
    await clientsPage.searchClient(clientToEdit)
    await clientsPage.deleteClient(clientToEdit)
    const msg = await clientsPage.getSuccessMsg()
    expect(msg.toLowerCase()).toContain(DELETED_PARTIAL_SUCCESS_MSG)
})

test('Clients Table Exists Test', async ({ clientsPage }) => {
    expect(await clientsPage.isTableExists()).toBeTruthy()
})

test('Clients Table Headers Test', async ({ clientsPage }) => {
    const headers = await clientsPage.getTableHeaders()
    expect(headers).toEqual(['S.No', 'Name', 'Email Address', 'Contact Number', 'Contact Person', 'Location'])
})

test('Do Search Test', async ({ clientsPage }) => {
    expect(await clientsPage.doSearch('Apple')).toBeTruthy()
})

test('Validate Client Mandatory Fields Test', async ({ clientsPage }) => {
    await clientsPage.openAddClientForm()
    await clientsPage.clickAddWithoutData()

    const errors = await clientsPage.getClientValidationErrors()
    console.log(errors)

    expect(errors).toContain('Client Name required')
    expect(errors).toContain('Status required')
    expect(errors).toContain('Person Name required')
    expect(errors).toContain('Location required')
    expect(errors).toContain('Email address is required')
})

test('Partial Client Validation Test', async ({ clientsPage }) => {
    await clientsPage.openAddClientForm()
    await clientsPage.enterClientNameOnly('Test Client')
    await clientsPage.clickAddWithoutData()

    const errors = await clientsPage.getClientValidationErrors()
    expect(errors).not.toContain('Client Name required')
})

test('Client Reset Enable Test', async ({ clientsPage }) => {
    await clientsPage.openAddClientForm()
    await clientsPage.enterClientNameOnly('Temp Client')
    expect(await clientsPage.isResetEnabled()).toBeTruthy()
})

test('Client Reset Form Test', async ({ clientsPage }) => {
    await clientsPage.openAddClientForm()
    await clientsPage.enterClientNameOnly('Temp Client')
    await clientsPage.clickReset()
    expect(await clientsPage.isFormCleared()).toBeTruthy()
})

test('Client Reset Disables Button Test', async ({ clientsPage }) => {
    await clientsPage.openAddClientForm()
    await clientsPage.enterClientNameOnly('Temp Client')
    await clientsPage.clickReset()
    expect(await clientsPage.isResetEnabled()).toBeFalsy()
})

// =========================================
// DUPLICATE CLIENT NAME VALIDATION TEST
// =========================================

test('Duplicate Client Email Validation Test', async ({ clientsPage }) => {
    const existingClientName = 'MRoads'
    const existingClientEmail = 'mroads@yopmail.com'
    await clientsPage.addClient(
        existingClientName,
        'Duplicate Test Person',
        'HYD',
        '9000000002',
        existingClientEmail
    )
    const errors = await clientsPage.getClientValidationErrors()
    expect(errors).toContain('Client already exists')
})