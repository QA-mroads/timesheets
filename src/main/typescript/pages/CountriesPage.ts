import { Page } from '@playwright/test'
import { BasePage } from '../base/BasePage'

export class CountriesPage extends BasePage {

    // =========================================
    // LOCATORS
    // =========================================

    // ✅ Note: this button uses data-test-id (with hyphen), not data-testid like everything else
    private readonly addNewCountryBtn = "[data-test-id='add-new-country']"

    private readonly countryNameField = "[data-testid='add-country/name'] input"
    private readonly shortNameField = "[data-testid='add-country/shortName'] input"
    private readonly countryCodeField = "[data-testid='add-country/'] input"

    private readonly addBtn = "[data-testid='add-country/add-or-update']"
    private readonly resetBtn = "[data-testid='add-country/reset']"
    private readonly closeIcon = "[data-testid='closeIcon']"

    private readonly successMsg = "//div//h2"
    private readonly errorMsg = "//div[@class='text-error text-xs']"
    private readonly errorMsgs = "//div[contains(@class,'text-error') and not(contains(@style,'display: none'))]"
    private readonly closeBtn = "//div[@class='absolute text-right mr-2 right-2 top-2']//*[local-name()='svg' and @class='cursor-pointer']"

    private readonly modalDialog = "[role='dialog']"

    private readonly table = "[data-testid='org-countries-table']"
    private readonly tableHeaders = "[data-testid='org-countries-table'] table thead th"
    private readonly tableRows = "[data-testid='org-countries-table'] table tbody tr"
    private readonly countryNamesList = "//table//td[3]"

    private readonly searchBar = '#input-with-icon-textfield'

    private readonly paginationNext = "[data-testid='pagination-next']"

    // =========================================
    // DYNAMIC LOCATORS
    // =========================================

    private rowByName = (name: string) => `//table//td[text()='${name}']//parent::tr`
    private editBtnByName = (name: string) => `(//table//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=1]`
    private deleteBtnByName = (name: string) => `(//table//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=2]`

    constructor(page: Page) {
        super(page)
    }

    // =========================================
    // TABLE — with proper wait for slow rendering
    // =========================================

    async isTableDisplayed(): Promise<void> {
        // ✅ Wait for the table container itself to attach to DOM first
        await this.page.locator(this.table).waitFor({ state: 'attached', timeout: 30000 })
        // ✅ Then wait for actual rows to render — table container can exist before data loads
        await this.page.locator(this.tableRows).first().waitFor({ state: 'visible', timeout: 30000 })
    }

    async isTableExists(): Promise<boolean> {
        try {
            await this.page.locator(this.table).waitFor({ state: 'visible', timeout: 30000 })
            await this.page.locator(this.tableRows).first().waitFor({ state: 'visible', timeout: 30000 })
            return true
        } catch {
            return false
        }
    }

    async getTableHeaders(): Promise<string[]> {
        // ✅ Wait for headers specifically — they can render before/after rows depending on data fetch timing
        await this.page.locator(this.tableHeaders).first().waitFor({ state: 'visible', timeout: 30000 })
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
    // CRUD
    // =========================================

    async openAddCountryForm(): Promise<void> {
        const btn = this.page.locator(this.addNewCountryBtn)
        await btn.waitFor({ state: 'visible', timeout: 30000 })
        await btn.click()
    }

    async addCountry(countryName: string, shortName: string, countryCode: string): Promise<void> {
        await this.openAddCountryForm()

        const nameField = this.page.locator(this.countryNameField)
        await nameField.waitFor({ state: 'visible', timeout: 30000 })
        await nameField.fill(countryName)

        await this.page.locator(this.shortNameField).fill(shortName)
        await this.page.locator(this.countryCodeField).fill(countryCode)

        await this.page.locator(this.addBtn).click()
        // ✅ No confirmation prompt observed in DOM — form submits directly via type="submit"
    }

    async editCountry(countryName: string, updatedFields: Map<string, string>): Promise<void> {
        const row = this.page.locator(this.rowByName(countryName))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()
        await this.page.waitForTimeout(500) // ✅ hover settle before SVG dispatch

        const editBtn = this.page.locator(this.editBtnByName(countryName))
        await editBtn.dispatchEvent('click') // ✅ no waitFor visible — hover-revealed icon

        for (const [fieldName, value] of updatedFields.entries()) {
            switch (fieldName) {
                case 'Country Name': {
                    const field = this.page.locator(this.countryNameField)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                case 'Short Name': {
                    const field = this.page.locator(this.shortNameField)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                case 'Country Code': {
                    const field = this.page.locator(this.countryCodeField)
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

        await this.page.locator(this.addBtn).click() // ✅ same testid used for Add/Update per DOM convention
    }

    async deleteCountry(name: string): Promise<void> {
        const row = this.page.locator(this.rowByName(name))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()
        await this.page.waitForTimeout(500) // ✅ hover settle

        const deleteBtn = this.page.locator(this.deleteBtnByName(name))
        await deleteBtn.dispatchEvent('click') // ✅ no waitFor visible

        try {
            const okBtn = this.page.locator("//button[text()='OK']")
            await okBtn.waitFor({ state: 'visible', timeout: 5000 })
            await okBtn.click()
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
        try {
            await this.page.locator(this.tableRows).first().waitFor({ state: 'visible', timeout: 10000 })
        } catch {
            return false // no rows matched the search at all
        }
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

    async clickAddWithoutData(): Promise<void> {
        await this.page.locator(this.addBtn).click()
    }

    async getCountryValidationErrors(): Promise<string[]> {
        const elements = this.page.locator(this.errorMsgs)
        await elements.first().waitFor({ state: 'visible', timeout: 10000 })
        const texts = await elements.allTextContents()
        return texts.map(t => t.trim())
    }

    async enterCountryNameOnly(name: string): Promise<void> {
        const field = this.page.locator(this.countryNameField)
        await field.fill(name)
        await field.press('Tab') // trigger blur/validation
    }

    // =========================================
    // RESET BUTTON
    // =========================================

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
        const nameVal = await this.page.locator(this.countryNameField).inputValue()
        const shortVal = await this.page.locator(this.shortNameField).inputValue()
        const codeVal = await this.page.locator(this.countryCodeField).inputValue()
        return nameVal === '' && shortVal === '' && codeVal === ''
    }

    // =========================================
    // MODAL CLOSE
    // =========================================

    async isAddCountryFormClosed(): Promise<boolean> {
        return await this.page.locator(this.modalDialog).count() === 0
    }

    async closeAddCountryForm(): Promise<void> {
        try {
            const icon = this.page.locator(this.closeIcon)
            await icon.waitFor({ state: 'visible', timeout: 5000 })
            await icon.click()
        } catch {
            console.log('Close icon not found, trying ESC...')
            await this.pressEscape()
        }
    }

    async pressEscape(): Promise<void> {
        await this.page.keyboard.press('Escape')
    }

    async clickOutsideModal(): Promise<void> {
        await this.page.locator('body').click()
    }

    async safelyCloseAddCountryForm(): Promise<void> {
        if (this.page.isClosed()) return
        try {
            await this.closeAddCountryForm()
        } catch {
            try {
                await this.pressEscape()
            } catch {
                await this.clickOutsideModal()
            }
        }
    }

    // =========================================
    // DUPLICATE VALIDATION
    // =========================================

    async getDuplicateFieldError(): Promise<string[]> {
        const errors = await this.getCountryValidationErrors()
        return errors.filter(err => err.toLowerCase().includes('already exist'))
    }

    async fillAddCountryForm(countryName: string, shortName: string, countryCode: string): Promise<void> {
        await this.openAddCountryForm()

        const nameField = this.page.locator(this.countryNameField)
        await nameField.waitFor({ state: 'visible', timeout: 30000 })
        await nameField.fill(countryName)

        await this.page.locator(this.shortNameField).fill(shortName)
        await this.page.locator(this.countryCodeField).fill(countryCode)

        await this.page.locator(this.addBtn).click()
        // ✅ No confirmation click — caller checks for validation error instead
    }
}