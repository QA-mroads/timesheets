import { Page } from '@playwright/test'
import { BasePage } from '../base/BasePage'

export class DepartmentsPage extends BasePage {

    // =========================================
    // LOCATORS
    // =========================================

    private readonly addNewDepartmentBtn = "//button[text()='Add New Department']"
    private readonly departmentNameField = "//input[@placeholder='Department Name']"
    private readonly descriptionField = "//textarea[@placeholder='Description']"
    private readonly addBtn = "//button[text()='Add']"

    private readonly successMsg = "//div//h2"
    private readonly errorMsg = "//div[@class='text-error text-xs']"
    private readonly closeBtn = "//div[@class='absolute text-right mr-2 right-2 top-2']//*[local-name()='svg' and @class='cursor-pointer']"

    private readonly resetBtn = "//button[text()='Reset']"

    private readonly paginationNext = "//*[local-name()='svg' and @class='-rotate-90 cursor-pointer']"

    private readonly table = 'table.w-full'
    private readonly tableHeaders = 'table.w-full th'
    private readonly tableRows = 'table.w-full tbody tr'

    private readonly departmentListName = "//tbody//td[3]"
    private readonly searchBar = '#input-with-icon-textfield'
    private readonly okBtn = "//button[text()='OK']"
    private readonly updateBtn = "//button[text()='Update']"

    // =========================================
    // LOCATORS — additions for validation
    // =========================================

    private readonly errorMsgs = "//div[contains(@class,'text-error') and not(contains(@style,'display: none'))]"
    private readonly formContainer = "//div[@role='dialog']" // ✅ verify actual modal wrapper class in your app
    private readonly closeIcon = "//div[@role='dialog']//*[local-name()='svg']"

    // =========================================
    // DYNAMIC LOCATORS
    // =========================================

    private rowByName = (name: string) => `//tbody//td[text()='${name}']//parent::tr`
    private editBtnByName = (name: string) => `(//tbody//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=1]`
    private deleteBtnByName = (name: string) => `(//tbody//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=2]`

    constructor(page: Page) {
        super(page)
    }

    // =========================================
    // PAGE INFO
    // =========================================

    async getDepartmentsPageTitle(): Promise<string> {
        await this.page.waitForFunction(
            (text) => document.title.includes(text),
            'Departments',
            { timeout: 30000 }
        )
        return await this.page.title()
    }

    async getDepartmentsPageUrl(): Promise<string> {
        await this.page.waitForURL('**/departments**', { timeout: 30000 })
        return this.page.url()
    }

    // =========================================
    // TABLE
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

    async searchDepartment(name: string): Promise<void> {
        let found = false
        let maxPages = 20 // ✅ hard limit to prevent infinite loop

        do {
            await this.page.locator(this.departmentListName).first().waitFor({ state: 'visible', timeout: 10000 })
            const elements = await this.page.locator(this.departmentListName).all()
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

        if (!found) console.warn(`Department "${name}" not found in any page`)
    }

    // =========================================
    // CRUD
    // =========================================

    async addNewDepartment(deptName: string, deptDescription: string): Promise<void> {
        const addBtnLocator = this.page.locator(this.addNewDepartmentBtn)
        await addBtnLocator.waitFor({ state: 'visible', timeout: 30000 })
        await addBtnLocator.click()

        const nameField = this.page.locator(this.departmentNameField)
        await nameField.waitFor({ state: 'visible', timeout: 30000 })
        await nameField.fill(deptName)

        await this.page.locator(this.descriptionField).fill(deptDescription)
        await this.utility.click({ selector: this.addBtn })
        // ✅ No confirmation prompt for this page (per original Java source — Add goes through directly)
    }

    async editDepartment(deptName: string, updatedFields: Map<string, string>): Promise<void> {
        const row = this.page.locator(this.rowByName(deptName))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()
        await this.page.waitForTimeout(500) // ✅ hover settle before SVG dispatch

        const editBtn = this.page.locator(this.editBtnByName(deptName))
        await editBtn.dispatchEvent('click') // ✅ no waitFor visible — hover-revealed icon
        await this.page.waitForTimeout(1000) // ✅ kept from original Thread.sleep(3000) → reduced, networkidle covers most of it

        for (const [fieldName, value] of updatedFields.entries()) {
            switch (fieldName) {
                case 'Department Name': {
                    const field = this.page.locator(this.departmentNameField)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                case 'Description': {
                    const field = this.page.locator(this.descriptionField)
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
        // ✅ No confirmation prompt for this page either
    }

    async deleteDepartment(name: string): Promise<void> {
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
    // RESET
    // =========================================

    async resetDepartment(deptName: string, deptDescription: string): Promise<void> {
        const addBtnLocator = this.page.locator(this.addNewDepartmentBtn)
        await addBtnLocator.waitFor({ state: 'visible', timeout: 30000 })
        await addBtnLocator.click()

        const nameField = this.page.locator(this.departmentNameField)
        await nameField.waitFor({ state: 'visible', timeout: 30000 })
        await nameField.fill(deptName)

        await this.page.locator(this.descriptionField).fill(deptDescription)
        await this.utility.click({ selector: this.resetBtn })
    }

    async isDepartmentNameEmpty(): Promise<string> {
        return await this.page.locator(this.departmentNameField).inputValue()
    }

    // =========================================
    // SEARCH
    // =========================================

    async doSearch(searchValue: string): Promise<boolean> {
        await this.page.locator(this.searchBar).fill(searchValue)
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { })
        await this.page.waitForTimeout(1000) // ✅ debounce settle (reduced from 4000ms)

        const rows = this.page.locator(this.tableRows)
        const count = await rows.count()
        for (let i = 0; i < count; i++) {
            const cellText = await rows.nth(i).locator('td').nth(2).textContent()
            if (cellText?.trim().includes(searchValue)) return true
        }
        return false
    }

    

    // =========================================
    // FORM VALIDATION METHODS
    // =========================================

    async openAddDepartmentForm(): Promise<void> {
        const btn = this.page.locator(this.addNewDepartmentBtn)
        await btn.waitFor({ state: 'visible', timeout: 30000 })
        await btn.click()
    }

    async clickAddWithoutData(): Promise<void> {
        await this.utility.click({ selector: this.addBtn })
    }

    async getDepartmentValidationErrors(): Promise<string[]> {
        const elements = this.page.locator(this.errorMsgs)
        await elements.first().waitFor({ state: 'visible', timeout: 10000 })
        const texts = await elements.allTextContents()
        return texts.map(t => t.trim())
    }

    async enterDepartmentNameOnly(name: string): Promise<void> {
        const field = this.page.locator(this.departmentNameField)
        await field.fill(name)
        await field.press('Tab') // trigger blur/validation
    }

    // =========================================
    // RESET BUTTON ENABLE/DISABLE CHECK
    // =========================================

    async isResetEnabled(): Promise<boolean> {
        const btn = this.page.locator(this.resetBtn)
        await btn.waitFor({ state: 'attached', timeout: 10000 })
        return await btn.isEnabled()
    }

    async isFormCleared(): Promise<boolean> {
        const nameVal = await this.page.locator(this.departmentNameField).inputValue()
        const descVal = await this.page.locator(this.descriptionField).inputValue()
        return nameVal === '' && descVal === ''
    }

    // =========================================
    // MODAL CLOSE METHODS
    // =========================================

    async isAddDepartmentFormClosed(): Promise<boolean> {
        return await this.page.locator(this.formContainer).count() === 0
    }

    async closeAddDepartmentForm(): Promise<void> {
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

    async safelyCloseAddDepartmentForm(): Promise<void> {
        if (this.page.isClosed()) return
        try {
            await this.closeAddDepartmentForm()
        } catch {
            try {
                await this.pressEscape()
            } catch {
                await this.clickOutsideModal()
            }
        }
    }

    // =========================================
    // NEW: get duplicate-field validation error
    // =========================================

    async getDuplicateFieldError(): Promise<string[]> {
        const errors = await this.getDepartmentValidationErrors()
        return errors.filter(err => err.toLowerCase().includes('already exist'))
    }

    // =========================================
    // NEW: fill form without submitting confirmation
    // (useful for validation tests where Add itself triggers an error, not success)
    // =========================================

    async fillAddDepartmentForm(deptName: string, deptDescription: string): Promise<void> {
        const addBtnLocator = this.page.locator(this.addNewDepartmentBtn)
        await addBtnLocator.waitFor({ state: 'visible', timeout: 30000 })
        await addBtnLocator.click()

        const nameField = this.page.locator(this.departmentNameField)
        await nameField.waitFor({ state: 'visible', timeout: 30000 })
        await nameField.fill(deptName)

        await this.page.locator(this.descriptionField).fill(deptDescription)
        await this.utility.click({ selector: this.addBtn })
        // ✅ No success-prompt wait — caller checks for validation error instead
    }
}