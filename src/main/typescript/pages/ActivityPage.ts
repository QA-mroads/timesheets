import { Page } from '@playwright/test'
import { BasePage } from '../base/BasePage'

export class ActivityPage extends BasePage {

    // =========================================
    // LOCATORS
    // =========================================

    private readonly addNewActivityBtn = "//button[text()='Add New Activity']"
    private readonly selDepartment = "//form//div[@role='button']"
    private readonly activityNameField = "//input[@placeholder='Activity Name']"
    private readonly addBtn = "//button[text()='Add']"
    private readonly cnfmPromptOkBtn = "//button[text()='Ok']"
    private readonly successMsg = "//div//h2"
    private readonly okBtn = "//button[text()='OK']"
    private readonly updateBtn = "//button[text()='Update']"

    private readonly errorMsg = "//div[@class='text-error text-xs']"
    private readonly closeBtn = "//div[@class='absolute text-right mr-2 right-2 top-2']//*[local-name()='svg' and @class='cursor-pointer']"

    private readonly activityListName = "//tbody//td[3]"
    private readonly paginationNext = "//*[local-name()='svg' and @class='-rotate-90 cursor-pointer']"

    private readonly table = 'table.w-full'
    private readonly tableHeaders = 'table.w-full th'
    private readonly tableRows = 'table.w-full tbody tr'

    private readonly searchBar = '#input-with-icon-textfield'

    // =========================================
    // LOCATORS for validation/reset
    // =========================================

    private readonly errorMsgs = "//div[contains(@class,'text-error') and not(contains(@style,'display: none'))]"
    private readonly resetBtn = "//button[@data-testid='add-activity/reset']" // ✅ verify actual data-testid in your app
    private readonly modalDialog = "//div[@role='dialog']"
    private readonly closeIcon = "//div[@role='dialog']//*[local-name()='svg']"

    // =========================================
    // DYNAMIC LOCATORS
    // =========================================

    private departmentOption = (departmentName: string) => `//ul//li[text()='${departmentName}']`
    private rowByName = (name: string) => `//tbody//td[text()='${name}']//parent::tr`
    private editBtnByName = (name: string) => `(//tbody//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=1]`
    private deleteBtnByName = (name: string) => `(//tbody//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=2]`

    constructor(page: Page) {
        super(page)
    }

    // =========================================
    // PAGE INFO
    // =========================================

    async getActivityPageTitle(): Promise<string> {
        await this.page.waitForFunction(
            (text) => document.title.includes(text),
            'Activities',
            { timeout: 30000 }
        )
        return await this.page.title()
    }

    async getActivityPageUrl(): Promise<string> {
        await this.page.waitForURL('**/activities**', { timeout: 30000 })
        return this.page.url()
    }

    // =========================================
    // TABLE
    // =========================================

    async isTableDisplayed(): Promise<void> {
        await this.page.locator(this.table).waitFor({ state: 'visible', timeout: 30000 })
    }

    async isTableExists(): Promise<boolean> {
        return await this.page.locator(this.table).isVisible()
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

    async searchActivity(name: string): Promise<void> {
        let found = false
        let maxPages = 20 // ✅ hard limit to prevent infinite loop

        do {
            await this.page.locator(this.activityListName).first().waitFor({ state: 'visible', timeout: 10000 })
            const elements = await this.page.locator(this.activityListName).all()
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

        if (!found) console.warn(`Activity "${name}" not found in any page`)
    }

    // =========================================
    // CRUD
    // =========================================

    async addActivity(departmentName: string, actName: string, doAdd: boolean): Promise<void> {
        await this.page.waitForTimeout(2000)
        const addBtnLocator = this.page.locator(this.addNewActivityBtn)
        await addBtnLocator.waitFor({ state: 'visible', timeout: 30000 })
        await addBtnLocator.click()

        const deptDD = this.page.locator(this.selDepartment)
        await deptDD.waitFor({ state: 'visible', timeout: 30000 })
        await deptDD.click()

        await this.utility.click({ selector: this.departmentOption(departmentName) })
        await this.page.locator(this.activityNameField).fill(actName)
        if (doAdd) {
            await this.utility.click({ selector: this.addBtn })
            // ✅ Confirmation prompt may not always appear — guard with try/catch + short timeout
            try {
                await this.page.locator(this.cnfmPromptOkBtn).waitFor({ state: 'visible', timeout: 5000 })
                await this.page.locator(this.cnfmPromptOkBtn).click()
            } catch {
                console.log('Confirmation prompt did not appear — skipping')
            }

        }

    }

    async editActivity(activityName: string, updatedFields: Map<string, string>): Promise<void> {
        const row = this.page.locator(this.rowByName(activityName))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()
        await this.page.waitForTimeout(500) // ✅ hover settle before SVG dispatch

        const editBtn = this.page.locator(this.editBtnByName(activityName))
        await editBtn.dispatchEvent('click') // ✅ no waitFor visible — hover-revealed icon

        for (const [fieldName, value] of updatedFields.entries()) {
            switch (fieldName) {
                case 'Department Name': {
                    await this.utility.click({ selector: this.selDepartment })
                    await this.utility.click({ selector: this.departmentOption(value) })
                    break
                }
                case 'Activity Name': {
                    const field = this.page.locator(this.activityNameField)
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

    async deleteActivity(name: string): Promise<void> {
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
    // FORM VALIDATION METHODS
    // =========================================

    async openAddActivityForm(): Promise<void> {
        const btn = this.page.locator(this.addNewActivityBtn)
        await btn.waitFor({ state: 'visible', timeout: 30000 })
        await btn.click()
    }

    async clickAddWithoutData(): Promise<void> {
        await this.utility.click({ selector: this.addBtn })
    }

    async getActivityValidationErrors(): Promise<string[]> {
        const elements = this.page.locator(this.errorMsgs)
        await elements.first().waitFor({ state: 'visible', timeout: 10000 })
        const texts = await elements.allTextContents()
        return texts.map(t => t.trim())
    }

    async enterActivityNameOnly(name: string): Promise<void> {
        const field = this.page.locator(this.activityNameField)
        await field.fill(name)
        await field.press('Tab') // trigger blur/validation
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
        const nameVal = await this.page.locator(this.activityNameField).inputValue()
        return nameVal === ''
    }

    // =========================================
    // MODAL CLOSE METHODS
    // =========================================

    async isAddActivityFormClosed(): Promise<boolean> {
        return await this.page.locator(this.modalDialog).count() === 0
    }

    async closeAddActivityForm(): Promise<void> {
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

    async safelyCloseAddActivityForm(): Promise<void> {
        if (this.page.isClosed()) return
        try {
            await this.closeAddActivityForm()
        } catch {
            try {
                await this.pressEscape()
            } catch {
                await this.clickOutsideModal()
            }
        }
    }
}