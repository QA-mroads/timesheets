import { Page } from '@playwright/test'
import { BasePage } from '../base/BasePage'

export class OrgSetupPage extends BasePage {

    // =========================================
    // LOCATORS
    // =========================================

    // Buttons
    private readonly addLeaveTypeBtn = "//button[text()='Add New Leave Type']"
    private readonly addBtn = "//button[text()='Add']"
    private readonly updateBtn = "//button[text()='Update']"
    private readonly cnfmPromptOkBtn = "//button[text()='Ok']"
    private readonly okBtn = "//button[text()='OK']"
    private readonly resetBtn = "//button[@data-testid='add-new-leave/reset']"
    private readonly addBtnForm = "//button[@data-testid='add-new-leave/add-or-update']"

    // Dropdowns & Inputs
    private readonly selCountry = "//form//div[@role='button']"
    private readonly indiaCountry = "//li[text()='INDIA']"
    private readonly leaveType = "//input[@placeholder='Leave Type']"
    private readonly leaveCount = "//input[@placeholder='Leave Count']"
    private readonly shortName = "//input[@placeholder='Short Name']"
    private readonly colorCode = "//input[@type='text']"
    private readonly countryDD = "//label[text()='Choose Country']/parent::div//div[@role='button']"
    private readonly countryDefault = "//input[@placeholder='Choose Country']"

    // Messages & Alerts
    private readonly successMsg = "//div//h2"
    private readonly errorMsg = "//div[@class='text-error text-xs']"
    private readonly errorMsgs = "//div[contains(@class,'text-error') and not(contains(@style,'display: none'))]"

    // Table
    private readonly table = 'table.w-full'
    private readonly tableHeaders = 'table.w-full th'
    private readonly tableRows = 'table.w-full tbody tr'
    private readonly leaveTypeListName = "//tbody//td[3]/div/div"

    // ✅ More reliable — use data-testid instead of exact class string matching
    private readonly paginationNext = "[data-testid='pagination-next']"
    private readonly paginationPrev = "[data-testid='pagination-prev']"

    // Close / Modal
    private readonly closeBtn = "//div[@class='absolute text-right mr-2 right-2 top-2']//*[local-name()='svg' and @class='cursor-pointer']"
    private readonly closeIcon = "//div[@role='dialog']//*[local-name()='svg']"
    private readonly modalForm = "//div[@role='dialog']"

    // Filter
    private readonly removeFilter = "//div[contains(@class,'bg-white') and contains(@class,'items-center') and contains(@class,'z-10')]"

    // Navigation Tabs
    private readonly holidaysTabBtn = "//a[@href='/settings/organization/holidays']"
    private readonly projectsTabBtn = "//a[@href='/settings/organization/projects']"
    private readonly activitiesTabBtn = "//a[@href='/settings/organization/activities']"
    private readonly clientsTabBtn = "//a[@href='/settings/organization/clients']"
    private readonly departmentsTabBtn = "//a[@href='/settings/organization/departments']"
    private readonly eventsTabBtn = "//a[@href='/settings/organization/events']"

    // =========================================
    // DYNAMIC LOCATORS
    // =========================================

    private countryOption = (countryName: string) => `//ul[@role='listbox']/li[text()='${countryName}']`
    private rowByLeaveType = (name: string) => `//tbody//td//div[text()='${name}']//ancestor::tr`
    private editBtnByLeaveType = (name: string) => `(//tbody//td//div[text()='${name}']//ancestor::tr//*[local-name()='svg'])[position()=2]`
    private deleteBtnByLeaveType = (name: string) => `(//tbody//td//div[text()='${name}']//ancestor::tr//*[local-name()='svg'])[position()=3]`

    // =========================================
    // CONSTRUCTOR
    // =========================================

    constructor(page: Page) {
        super(page)
    }

    // =========================================
    // PAGE INFO METHODS
    // =========================================

    async getOrgSetupPageTitle(): Promise<string> {
        await this.page.waitForFunction(
            (text) => document.title.includes(text),
            'Leaves',
            { timeout: 10000 }
        )
        const title = await this.page.title()
        console.log('Org Setup Page Title is:', title)
        return title
    }

    async getOrgSetupPageUrl(): Promise<string> {
        await this.page.waitForURL('**/organization**', { timeout: 30000 })
        const url = this.page.url()
        console.log('Org Setup Page Url is:', url)
        return url
    }

    // =========================================
    // TABLE METHODS
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
        // ✅ Guard against closed page
        if (this.page.isClosed()) return 'Failed Process'

        try {
            const successLocator = this.page.locator(this.successMsg)
            await successLocator.waitFor({ state: 'visible', timeout: 10000 })
            const text = await successLocator.innerText()
            console.log(text)
            await this.page.waitForTimeout(2000)
            return text
        } catch {
            if (this.page.isClosed()) return 'Failed Process'  // ✅ guard here too
            try {
                const errorText = await this.page.locator(this.errorMsg).innerText()
                console.log(errorText)
                await this.utility.click({ selector: this.closeBtn })
                return errorText
            } catch {
                return 'Failed Process'  // ✅ removed closeBtn click — page may be closed
            }
        }
    }

    // =========================================
    // PAGINATION
    // =========================================

    async isPageNextExists(): Promise<boolean> {
        const nextBtn = this.page.locator(this.paginationNext)
        const exists = await nextBtn.count() > 0
        if (!exists) return false

        // ✅ Check if it's disabled via the opacity-50 class (confirmed from DOM)
        const classAttr = await nextBtn.getAttribute('class')
        return !classAttr?.includes('opacity-50')
    }

    /**
     * Searches for a leave type across pages using pagination
     */
    async searchLeaveType(leaveTypeName: string): Promise<void> {
        let found = false
        let maxPages = 20
        do {
            const elements = await this.page.locator(this.leaveTypeListName).all()
            for (const element of elements) {
                const text = await element.textContent()
                if (text?.includes(leaveTypeName)) {
                    found = true
                    break
                }
            }
            if (!found) {
                const hasNext = await this.isPageNextExists() // ✅ now correctly detects opacity-50 disabled state
                if (!hasNext || maxPages-- <= 0) break
                await this.page.locator(this.paginationNext).click()
                await this.page.waitForTimeout(500) // let next page render
            }
        } while (!found)
        if (!found) {
            throw new Error(`Leave type "${leaveTypeName}" not found after searching all pages`)
        }
    }

    // =========================================
    // CRUD METHODS
    // =========================================

    async editBtnClick(leaveTypeName: string): Promise<void> {
        const rowLocator = this.page.locator(this.rowByLeaveType(leaveTypeName))
        await rowLocator.hover()
        await this.utility.click({ selector: this.editBtnByLeaveType(leaveTypeName) })
    }

    // async deleteLeaveType(leaveTypeName: string): Promise<void> {
    //     const rowLocator = this.page.locator(this.rowByLeaveType(leaveTypeName))
    //     await rowLocator.hover()
    //     await this.utility.click({ selector: this.deleteBtnByLeaveType(leaveTypeName) })
    //     const okLocator = this.page.locator(this.okBtn)
    //     await okLocator.waitFor({ state: 'visible', timeout: 30000 })
    //     await okLocator.click()
    //     await this.page.waitForTimeout(2000)
    // }

    async addLeaveType(
        leaveName: string,
        count: string,
        shortCode: string,
        col: string
    ): Promise<void> {
        const addLeaveBtnLocator = this.page.locator(this.addLeaveTypeBtn)
        await addLeaveBtnLocator.waitFor({ state: 'visible', timeout: 30000 })
        await addLeaveBtnLocator.click()

        const countryLocator = this.page.locator(this.selCountry)
        await countryLocator.waitFor({ state: 'visible', timeout: 30000 })
        await countryLocator.click()

        await this.utility.click({ selector: this.indiaCountry })
        await this.page.locator(this.leaveType).fill(leaveName)
        await this.page.locator(this.leaveCount).fill(count)
        await this.page.locator(this.shortName).fill(shortCode)
        await this.page.locator(this.colorCode).fill(col)
        await this.utility.click({ selector: this.addBtn })

        const cnfmLocator = this.page.locator(this.cnfmPromptOkBtn)
        await cnfmLocator.waitFor({ state: 'visible', timeout: 30000 })
        await cnfmLocator.click()
    }

    // ✅ Single method for Edit
    async editLeaveType(leaveTypeName: string, updatedFields: Map<string, string>): Promise<void> {
        const row = this.page.locator(this.rowByLeaveType(leaveTypeName))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()

        // ✅ Wait for the SVG icon to actually appear after hover
        const editBtn = this.page.locator(this.editBtnByLeaveType(leaveTypeName))
        await editBtn.waitFor({ state: 'visible', timeout: 5000 })
        await editBtn.dispatchEvent('click')  // ✅ bypasses hover-state dependency

        for (const [fieldName, value] of updatedFields.entries()) {
            let selector: string
            switch (fieldName) {
                case 'Leave Name': selector = this.leaveType; break
                case 'Leave Count': selector = this.leaveCount; break
                case 'Short Code': selector = this.shortName; break
                case 'Color Code': selector = this.colorCode; break
                default: console.log(`Invalid field: ${fieldName}`); continue
            }
            const field = this.page.locator(selector)
            await field.click()
            await field.selectText()
            await field.press('Delete')
            await field.fill(value)
        }

        await this.utility.click({ selector: this.updateBtn })
        try {
            await this.page.locator(this.cnfmPromptOkBtn).waitFor({ state: 'visible', timeout: 5000 })
            await this.page.locator(this.cnfmPromptOkBtn).click()
        } catch {
            console.log('Confirmation prompt did not appear — skipping')
        }
    }

    async deleteLeaveType(leaveTypeName: string): Promise<void> {
        const row = this.page.locator(this.rowByLeaveType(leaveTypeName))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()

        const deleteBtn = this.page.locator(this.deleteBtnByLeaveType(leaveTypeName))
        await deleteBtn.waitFor({ state: 'visible', timeout: 5000 })
        await deleteBtn.dispatchEvent('click')

        // // ✅ Wait for the confirm prompt modal to appear
        // const confirmModal = this.page.locator("//h2[contains(text(),'Are you sure')]")
        // await confirmModal.waitFor({ state: 'visible', timeout: 5000 })

        // // ✅ Click OK only within the confirm modal — avoids locator ambiguity
        // const okBtn = this.page.locator("//h2[contains(text(),'Are you sure')]/ancestor::div[@role='dialog']//button[text()='OK' or text()='Ok']")
        // await okBtn.waitFor({ state: 'visible', timeout: 5000 })
        // await okBtn.click()
        // ✅ Wait for confirm modal
        await this.page.waitForTimeout(1000)

        // ✅ Debug: log all button texts inside any dialog/modal
        const allBtns = await this.page.locator("//div[@role='dialog']//button | //div[contains(@class,'modal')]//button | //div[contains(@class,'swal')]//button").all()
        for (const btn of allBtns) {
            console.log('Button found in modal:', await btn.textContent())
        }

        const okLocator = this.page.locator(this.okBtn)
        await okLocator.waitFor({ state: 'visible', timeout: 30000 })
        await okLocator.click()
        await this.page.waitForTimeout(2000)
    }
    // async editLeaveType(updatedFields: Map<string, string>): Promise<void> {
    //     for (const [fieldName, value] of updatedFields.entries()) {
    //         switch (fieldName) {
    //             case 'Leave Name': {
    //                 const field = this.page.locator(this.leaveType)
    //                 await field.click()
    //                 await field.selectText()
    //                 await field.press('Delete')
    //                 await field.fill(value)
    //                 break
    //             }
    //             case 'Leave Count': {
    //                 const field = this.page.locator(this.leaveCount)
    //                 await field.click()
    //                 await field.selectText()
    //                 await field.press('Delete')
    //                 await field.fill(value)
    //                 break
    //             }
    //             case 'Short Code': {
    //                 const field = this.page.locator(this.shortName)
    //                 await field.click()
    //                 await field.selectText()
    //                 await field.press('Delete')
    //                 await field.fill(value)
    //                 break
    //             }
    //             case 'Color Code': {
    //                 const field = this.page.locator(this.colorCode)
    //                 await field.click()
    //                 await field.selectText()
    //                 await field.press('Delete')
    //                 await field.fill(value)
    //                 break
    //             }
    //             default:
    //                 console.log(`Invalid field name: ${fieldName}`)
    //         }
    //     }

    //     await this.utility.click({ selector: this.updateBtn })
    //     const cnfmLocator = this.page.locator(this.cnfmPromptOkBtn)
    //     await cnfmLocator.waitFor({ state: 'visible', timeout: 30000 })
    //     await cnfmLocator.click()
    // }

    // =========================================
    // FILTER METHODS
    // =========================================

    async filterByCountry(countryName: string): Promise<boolean> {
        await this.utility.click({ selector: this.countryDD })
        await this.utility.click({ selector: this.countryOption(countryName) })
        await this.page.waitForLoadState('networkidle')

        const rows = this.page.locator(this.tableRows)
        const count = await rows.count()
        for (let i = 0; i < count; i++) {
            const cellText = await rows.nth(i).locator('td').nth(4).textContent()
            if (cellText?.includes(countryName)) {
                return true
            }
        }
        return false
    }

    async getDefaultFilterValue(): Promise<string> {
        return await this.page.locator(this.countryDefault).inputValue()
    }

    async doClearFilter(): Promise<void> {
        const filterLocator = this.page.locator(this.removeFilter)
        await filterLocator.waitFor({ state: 'visible', timeout: 30000 })
        await filterLocator.click()
    }

    // =========================================
    // FORM VALIDATION METHODS
    // =========================================

    async openAddLeaveForm(): Promise<void> {
        const btnLocator = this.page.locator(this.addLeaveTypeBtn)
        await btnLocator.waitFor({ state: 'visible', timeout: 30000 })
        await btnLocator.click()
    }

    async clickAddWithoutData(): Promise<void> {
        await this.utility.click({ selector: this.addBtnForm })
    }

    async getAllValidationMessages(): Promise<string[]> {
        const elements = this.page.locator(this.errorMsgs)
        await elements.first().waitFor({ state: 'visible', timeout: 30000 })
        const texts = await elements.allTextContents()
        return texts.map(t => t.trim())
    }

    async isResetEnabled(): Promise<boolean> {
        const btnLocator = this.page.locator(this.resetBtn)
        await btnLocator.waitFor({ state: 'attached', timeout: 30000 })
        return await btnLocator.isEnabled()
    }

    async enterLeaveTypeOnly(name: string): Promise<void> {
        const field = this.page.locator(this.leaveType)
        await field.fill(name)
        await field.press('Tab') // trigger blur — important for validation
    }

    async clickReset(): Promise<void> {
        const resetLocator = this.page.locator(this.resetBtn)
        await resetLocator.waitFor({ state: 'visible', timeout: 30000 })
        await resetLocator.click()
    }

    async isFormCleared(): Promise<boolean> {
        const leaveVal = await this.page.locator(this.leaveType).inputValue()
        const countVal = await this.page.locator(this.leaveCount).inputValue()
        const shortVal = await this.page.locator(this.shortName).inputValue()
        return leaveVal === '' && countVal === '' && shortVal === ''
    }

    // =========================================
    // MODAL CLOSE METHODS
    // =========================================

    async closeAddLeaveForm(): Promise<void> {
        try {
            const closeLocator = this.page.locator(this.closeIcon)
            await closeLocator.waitFor({ state: 'visible', timeout: 5000 })
            await closeLocator.click()
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

    async safelyCloseAddLeaveForm(): Promise<void> {
        try {
            await this.closeAddLeaveForm()
        } catch {
            try {
                await this.pressEscape()
            } catch {
                await this.clickOutsideModal()
            }
        }
    }

    async isAddLeaveFormClosed(): Promise<boolean> {
        const count = await this.page.locator(this.modalForm).count()
        return count === 0
    }

    // =========================================
    // NAVIGATION METHODS
    // =========================================

    async goToHolidays(): Promise<void> {
        const tabLocator = this.page.locator(this.holidaysTabBtn)
        await tabLocator.waitFor({ state: 'visible', timeout: 30000 })
        await tabLocator.click()
    }

    async goToProjects(): Promise<void> {
        const tabLocator = this.page.locator(this.projectsTabBtn)
        await tabLocator.waitFor({ state: 'visible', timeout: 30000 })
        await tabLocator.click()
    }

    async goToActivities(): Promise<void> {
        const tabLocator = this.page.locator(this.activitiesTabBtn)
        await tabLocator.waitFor({ state: 'visible', timeout: 30000 })
        await tabLocator.click()
    }

    async goToClients(): Promise<void> {
        const tabLocator = this.page.locator(this.clientsTabBtn)
        await tabLocator.waitFor({ state: 'visible', timeout: 30000 })
        await tabLocator.click()
    }

    async goToDepartments(): Promise<void> {
        const tabLocator = this.page.locator(this.departmentsTabBtn)
        await tabLocator.waitFor({ state: 'visible', timeout: 30000 })
        await tabLocator.click()
    }

    async goToEvents(): Promise<void> {
        const tabLocator = this.page.locator(this.eventsTabBtn)
        await tabLocator.waitFor({ state: 'visible', timeout: 30000 })
        await tabLocator.click()
    }
}