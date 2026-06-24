import { Page } from '@playwright/test'
import { BasePage } from '../base/BasePage'

export class ClientsPage extends BasePage {

    // =========================================
    // LOCATORS
    // =========================================

    private readonly addNewClientBtn = "//button[text()='Add New Client']"
    private readonly clientNameField = "//input[@placeholder='Client Name']"
    private readonly selStatus = "//form//div[@role='button']"
    private readonly statusActive = "//ul//li[text()='ACTIVE']"
    private readonly contactPersonField = "//input[@placeholder='Contact Person']"
    private readonly locationField = "//input[@placeholder='Location']"
    private readonly contactNumberField = "input[name='contactNumber']"
    private readonly emailAddressField = "//input[@placeholder='Email Address']"
    private readonly addBtn = "//button[text()='Add']"
    private readonly cnfmPromptOkBtn = "//button[text()='Ok']"
    private readonly successMsg = "//div//h2"
    private readonly okBtn = "//button[text()='OK']"
    private readonly updateBtn = "//button[text()='Update']"

    private readonly errorMsg = "//div[@class='text-error text-xs']"
    private readonly closeBtn = "//div[@class='absolute text-right mr-2 right-2 top-2']//*[local-name()='svg' and @class='cursor-pointer']"

    private readonly clientsListName = "//tbody//td[3]"
    private readonly paginationNext = "//*[local-name()='svg' and @class='-rotate-90 cursor-pointer']"

    private readonly table = 'table.w-full'
    private readonly tableHeaders = 'table.w-full th'
    private readonly tableRows = 'table.w-full tbody tr'

    private readonly searchBar = '#input-with-icon-textfield'

    private readonly formContainer = "//div[contains(@class,'MuiDialog-container')]"
    private readonly statusDropdown = "//div[@data-testid='add-client/status']"
    private readonly resetBtn = "//button[@data-testid='add-client/reset']"
    private readonly addBtnForm = "//button[@data-testid='add-client/add-or-update']"
    private readonly errorMsgs = "//div[contains(@class,'text-error') and not(contains(@style,'display: none'))]"
    private readonly closeIcon = "//div[contains(@class,'MuiDialog-container')]//*[local-name()='svg']"

    // =========================================
    // DYNAMIC LOCATORS
    // =========================================

    private statusOption = (status: string) => `//ul//li[text()='${status}']`
    private rowByName = (name: string) => `//tbody//td[text()='${name}']//parent::tr`
    private editBtnByName = (name: string) => `(//tbody//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=1]`
    private deleteBtnByName = (name: string) => `(//tbody//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=2]`

    constructor(page: Page) {
        super(page)
    }

    // =========================================
    // PAGE INFO
    // =========================================

    async getClientsPageTitle(): Promise<string> {
        await this.page.waitForFunction(
            (text) => document.title.includes(text),
            'Clients',
            { timeout: 30000 }
        )
        return await this.page.title()
    }

    async getClientsPageUrl(): Promise<string> {
        await this.page.waitForURL('**/clients**', { timeout: 30000 })
        return this.page.url()
    }

    // =========================================
    // TABLE
    // =========================================

    async isTableExists(): Promise<boolean> {
        return await this.page.locator(this.clientsListName).first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false)
    }

    async getTableHeaders(): Promise<string[]> {
        // ✅ Wait for th elements specifically, not just the table container
        await this.page.locator(this.tableHeaders).first().waitFor({ state: 'visible', timeout: 10000 })
        const headers = await this.page.locator(this.tableHeaders).allTextContents()
        return headers.map(t => t.trim()).filter(t => t !== '')
    }

    // =========================================
    // SUCCESS / ERROR MESSAGE
    // =========================================

    async getSuccessMsg(): Promise<string> {
        if (this.page.isClosed()) return 'Failed Process'
        try {
            const successLocator = this.page.locator(this.successMsg)
            await successLocator.waitFor({ state: 'visible', timeout: 10000 })
            const text = await successLocator.innerText()
            console.log(text)
            await this.page.waitForTimeout(2000)
            return text
        } catch {
            if (this.page.isClosed()) return 'Failed Process'
            try {
                const errorText = await this.page.locator(this.errorMsg).innerText()
                console.log(errorText)
                await this.utility.click({ selector: this.closeBtn })
                return errorText
            } catch {
                return 'Failed Process'
            }
        }
    }

    // =========================================
    // PAGINATION
    // =========================================

    async isPageNextExists(): Promise<boolean> {
        try {
            await this.page.locator(this.paginationNext).waitFor({ state: 'visible', timeout: 5000 })
            return true
        } catch {
            return false
        }
    }

    async searchClient(name: string): Promise<void> {
        let found = false
        let maxPages = 20 // ✅ hard limit to prevent infinite loop

        do {
            await this.page.locator(this.clientsListName).first().waitFor({ state: 'visible', timeout: 10000 })
            const elements = await this.page.locator(this.clientsListName).all()
            for (const element of elements) {
                const text = await element.textContent()
                if (text?.includes(name)) {
                    found = true
                    break
                }
            }
            if (!found) {
                const hasNext = await this.isPageNextExists()
                if (!hasNext || maxPages-- <= 0) break
                await this.utility.click({ selector: this.paginationNext })
                await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { })
                await this.page.waitForTimeout(500)
            }
        } while (!found)

        if (!found) console.warn(`Client "${name}" not found in any page`)
    }

    // =========================================
    // CRUD
    // =========================================

    async addClient(
        cName: string,
        personName: string,
        loc: string,
        contactNumber: string,
        emailAddress: string
    ): Promise<void> {
        const addBtnLocator = this.page.locator(this.addNewClientBtn)
        await addBtnLocator.waitFor({ state: 'visible', timeout: 30000 })
        await addBtnLocator.click()

        const nameField = this.page.locator(this.clientNameField)
        await nameField.waitFor({ state: 'visible', timeout: 30000 })
        await nameField.fill(cName)

        await this.utility.click({ selector: this.selStatus })
        const statusActiveLocator = this.page.locator(this.statusActive)
        await statusActiveLocator.waitFor({ state: 'visible', timeout: 30000 })
        await statusActiveLocator.click()

        await this.page.locator(this.contactPersonField).fill(personName)
        await this.page.locator(this.locationField).fill(loc)
        await this.page.locator(this.contactNumberField).fill(contactNumber)
        await this.page.locator(this.emailAddressField).fill(emailAddress)
        await this.utility.click({ selector: this.addBtn })

        // ✅ Confirmation prompt may not always appear (app bug noted in original Java source)
        try {
            await this.page.locator(this.cnfmPromptOkBtn).waitFor({ state: 'visible', timeout: 5000 })
            await this.page.locator(this.cnfmPromptOkBtn).click()
        } catch {
            console.log('Confirmation prompt did not appear — skipping')
        }
    }

    async editClient(clientName: string, updatedFields: Map<string, string>): Promise<void> {
        const row = this.page.locator(this.rowByName(clientName))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()
        await this.page.waitForTimeout(500) // ✅ hover settle before SVG dispatch

        const editBtn = this.page.locator(this.editBtnByName(clientName))
        await editBtn.dispatchEvent('click') // ✅ no waitFor visible — hover-revealed icon

        for (const [fieldName, value] of updatedFields.entries()) {
            switch (fieldName) {
                case 'Client Name': {
                    const field = this.page.locator(this.clientNameField)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                case 'Contact Person': {
                    const field = this.page.locator(this.contactPersonField)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                case 'Location': {
                    const field = this.page.locator(this.locationField)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                case 'Contact Number': {
                    const field = this.page.locator(this.contactNumberField)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                case 'Email Address': {
                    const field = this.page.locator(this.emailAddressField)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                default:
                    console.log(`Invalid field name: ${fieldName}`)
            }
        }

        await this.utility.click({ selector: this.updateBtn })
        try {
            await this.page.locator(this.cnfmPromptOkBtn).waitFor({ state: 'visible', timeout: 5000 })
            await this.page.locator(this.cnfmPromptOkBtn).click()
        } catch {
            console.log('Confirmation prompt did not appear — skipping')
        }
    }

    async deleteClient(name: string): Promise<void> {
        const row = this.page.locator(this.rowByName(name))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()
        await this.page.waitForTimeout(500) // ✅ hover settle

        const deleteBtn = this.page.locator(this.deleteBtnByName(name))
        await deleteBtn.dispatchEvent('click') // ✅ no waitFor visible

        try {
            await this.page.locator(this.okBtn).waitFor({ state: 'visible', timeout: 5000 })
            await this.page.locator(this.okBtn).click()
            await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { })
            await this.page.waitForTimeout(1000)
        } catch {
            console.log('Delete confirmation did not appear')
        }
    }

    // =========================================
    // SEARCH
    // =========================================

    async doSearch(searchValue: string): Promise<boolean> {
        await this.page.locator(this.searchBar).fill(searchValue)
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { })
        await this.page.waitForTimeout(1000) // ✅ debounce settle (reduced from 3000ms)

        const rows = this.page.locator(this.tableRows)
        const count = await rows.count()
        for (let i = 0; i < count; i++) {
            const cellText = await rows.nth(i).locator('td').nth(2).textContent()
            if (cellText?.trim().includes(searchValue)) return true
        }
        return false
    }

    // =========================================
    // FORM VALIDATION
    // =========================================

    async openAddClientForm(): Promise<void> {
        const btn = this.page.locator(this.addNewClientBtn)
        await btn.waitFor({ state: 'visible', timeout: 30000 })
        await btn.click()
    }

    async clickAddWithoutData(): Promise<void> {
        await this.utility.click({ selector: this.addBtnForm })
    }

    async getClientValidationErrors(): Promise<string[]> {
        const elements = this.page.locator(this.errorMsgs)
        await elements.first().waitFor({ state: 'visible', timeout: 10000 })
        const texts = await elements.allTextContents()
        return texts.map(t => t.trim())
    }

    async enterClientNameOnly(name: string): Promise<void> {
        const field = this.page.locator(this.clientNameField)
        await field.fill(name)
        await field.press('Tab') // trigger validation
    }

    async selectStatus(status: string): Promise<void> {
        await this.utility.click({ selector: this.statusDropdown })
        const optionLocator = this.page.locator(this.statusOption(status))
        await optionLocator.waitFor({ state: 'visible', timeout: 30000 })
        await optionLocator.click()
    }

    async isResetEnabled(): Promise<boolean> {
        const btn = this.page.locator(this.resetBtn)
        await btn.waitFor({ state: 'attached', timeout: 10000 })
        return await btn.isEnabled()
    }

    async clickReset(): Promise<void> {
        const btn = this.page.locator(this.resetBtn)
        await btn.waitFor({ state: 'visible', timeout: 10000 })
        await btn.click()
    }

    async isFormCleared(): Promise<boolean> {
        const nameVal = await this.page.locator(this.clientNameField).inputValue()
        const locVal = await this.page.locator(this.locationField).inputValue()
        const contactVal = await this.page.locator(this.contactNumberField).inputValue()
        return nameVal === '' && locVal === '' && contactVal === ''
    }

    // =========================================
    // MODAL CLOSE
    // =========================================

    async isClientFormClosed(): Promise<boolean> {
        return await this.page.locator(this.formContainer).count() === 0
    }

    async safelyCloseClientForm(): Promise<void> {
        if (this.page.isClosed()) return
        try {
            const icon = this.page.locator(this.closeIcon)
            await icon.waitFor({ state: 'visible', timeout: 5000 })
            await icon.click()
        } catch {
            try {
                await this.page.keyboard.press('Escape')
            } catch {
                await this.page.locator('body').click()
            }
        }
    }

    // =========================================
    // NEW: get duplicate-field validation error
    // =========================================

    async getDuplicateFieldError(): Promise<string[]> {
        const errors = await this.getClientValidationErrors()
        return errors.filter(err => err.toLowerCase().includes('already exist'))
    }

    // =========================================
    // NEW: fill form without submitting confirmation
    // (useful for validation tests where Add itself triggers an error, not success)
    // =========================================

    async fillAddClientForm(
        cName: string,
        personName: string,
        loc: string,
        contactNumber: string,
        emailAddress: string
    ): Promise<void> {
        const addBtnLocator = this.page.locator(this.addNewClientBtn)
        await addBtnLocator.waitFor({ state: 'visible', timeout: 30000 })
        await addBtnLocator.click()

        const nameField = this.page.locator(this.clientNameField)
        await nameField.waitFor({ state: 'visible', timeout: 30000 })
        await nameField.fill(cName)

        await this.utility.click({ selector: this.selStatus })
        const statusActiveLocator = this.page.locator(this.statusActive)
        await statusActiveLocator.waitFor({ state: 'visible', timeout: 30000 })
        await statusActiveLocator.click()

        await this.page.locator(this.contactPersonField).fill(personName)
        await this.page.locator(this.locationField).fill(loc)
        await this.page.locator(this.contactNumberField).fill(contactNumber)
        await this.page.locator(this.emailAddressField).fill(emailAddress)
        await this.utility.click({ selector: this.addBtn })
        // ✅ No confirmation click — caller checks for validation error instead
    }
}