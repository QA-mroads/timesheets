import { Page } from '@playwright/test'
import { BasePage } from '../base/BasePage'

export class ProjectsPage extends BasePage {

    // =========================================
    // LOCATORS
    // =========================================

    private readonly addNewProjectBtn = "//button[text()='Add New Project']"
    private readonly selClient = "//form//label[text()='Client Name']//parent::div/div"
    private readonly selProjectManager = "//form//label[text()='Project Manager']//parent::div/div"
    private readonly startDate = "//label[text()='Start Date']/parent::div//button"
    private readonly colorCode = "(//input[@type='text'])[2]"
    private readonly addBtn = "//button[text()='Add']"
    private readonly cnfmPromptOkBtn = "//button[text()='Ok']"
    private readonly successMsg = "//div//h2"
    private readonly okBtn = "//button[text()='OK']"
    private readonly updateBtn = "//button[text()='Update']"
    private readonly errorMsg = "//div[@class='text-error text-xs']"
    private readonly closeBtn = "//div[@class='absolute text-right mr-2 right-2 top-2']//*[local-name()='svg' and @class='cursor-pointer']"

    // Date picker — exact MUI classes (confirmed from Holidays page DOM)
    private readonly calendarSwitchYear = "//button[contains(@class,'MuiPickersCalendarHeader-switchViewButton')]"
    private readonly currentMonthLabel = "//div[contains(@id,'-grid-label')]"
    private readonly nextMonthBtn = "//button[@title='Next month']"

    private readonly projectsListName = "//tbody//td[3]"
    private readonly paginationNext = "//*[local-name()='svg' and @class='-rotate-90 cursor-pointer']"

    private readonly table = 'table.w-full'
    private readonly tableHeaders = 'table.w-full th'
    private readonly tableRows = 'table.w-full tbody tr'

    private readonly clientDD = "//label[text()='Client']/parent::div//div[@role='button']"
    private readonly clientDefault = "//input[@placeholder='Client']"
    private readonly removeFilter = "div.bg-white.items-center svg"

    private readonly searchBar = "#input-with-icon-textfield"

    private readonly modalDialog = "//div[@role='dialog']"
    private readonly projectName = "//input[@placeholder='Name of Project']"
    private readonly displayName = "//input[@placeholder='Display Name']"
    private readonly resetBtn = "//button[@data-testid='add-project/reset']"
    private readonly errorMsgs = "//div[contains(@class,'text-error') and not(contains(@style,'display: none'))]"
    private readonly closeIcon = "//div[@role='dialog']//*[local-name()='svg']"

    // =========================================
    // DYNAMIC LOCATORS
    // =========================================

    private yearBtn = (year: string) => `//button[contains(@class,'PrivatePickersYear-yearButton') or contains(@class,'MuiPickersYear-yearButton')][normalize-space(text())='${year}']`
    private dayBtn = (day: string) => `//button[contains(@class,'MuiPickersDay-root') and not(contains(@class,'MuiPickersDay-dayOutsideMonth')) and not(@disabled) and normalize-space(text())='${day}']`
    private optionByText = (value: string) => `//ul//li[text()='${value}']`
    private optionContains = (value: string) => `//ul//li[contains(text(),'${value}')]`
    private filterOption = (value: string) => `//ul[@role='listbox']/li[text()='${value}']`
    private rowByName = (name: string) => `//tbody//td[text()='${name}']//parent::tr`
    private editBtnByName = (name: string) => `(//tbody//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=1]`
    private deleteBtnByName = (name: string) => `(//tbody//td[text()='${name}']//parent::tr//*[local-name()='svg'])[position()=2]`

    constructor(page: Page) {
        super(page)
    }

    // =========================================
    // PAGE INFO
    // =========================================

    async getProjectsPageTitle(): Promise<string> {
        await this.page.waitForFunction(
            (text) => document.title.includes(text),
            'Projects',
            { timeout: 30000 }
        )
        return await this.page.title()
    }

    async getProjectsPageUrl(): Promise<string> {
        await this.page.waitForURL('**/projects**', { timeout: 30000 })
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
            await successLocator.waitFor({ state: 'visible', timeout: 30000 })
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
    // DATE PICKER (private helper — same fix as HolidaysPage)
    // =========================================

    private async dateSelection(year: string, month: string, day: string): Promise<void> {
        await this.page.waitForTimeout(2000) // ✅ allow calendar render settle
        await this.page.locator(this.currentMonthLabel).waitFor({ state: 'visible', timeout: 20000 })

        const switchBtn = this.page.locator(this.calendarSwitchYear)
        await switchBtn.waitFor({ state: 'visible', timeout: 5000 })
        await switchBtn.click()

        await this.page.waitForTimeout(500)

        // ✅ Wait for year grid to render
        const anyYearBtn = this.page.locator("//button[contains(@class,'PrivatePickersYear-yearButton') or contains(@class,'MuiPickersYear-yearButton')]").first()
        await anyYearBtn.waitFor({ state: 'attached', timeout: 15000 })  // ✅ 'attached' first — DOM presence before visibility
        await anyYearBtn.waitFor({ state: 'visible', timeout: 5000 })

        // ✅ Year may be off-screen in virtual scroll list — scroll into view
        const yearLocator = this.page.locator(this.yearBtn(year))
        await yearLocator.scrollIntoViewIfNeeded()
        await yearLocator.click()

        await this.page.locator(this.currentMonthLabel).waitFor({ state: 'visible', timeout: 5000 })
        await this.page.waitForTimeout(300)

        for (let i = 0; i < 12; i++) {
            const currentMonthText = await this.page.locator(this.currentMonthLabel).textContent()
            if (currentMonthText?.includes(month)) {
                const dayLocator = this.page.locator(this.dayBtn(day))
                await dayLocator.first().waitFor({ state: 'visible', timeout: 5000 })
                await dayLocator.first().click()
                // ✅ OK button only present in some picker variants
                try {
                    const okButton = this.page.locator("//button[text()='OK']")
                    await okButton.waitFor({ state: 'visible', timeout: 2000 })
                    await okButton.click()
                } catch { /* inline picker — no OK needed */ }
                break
            }
            const nextBtn = this.page.locator(this.nextMonthBtn)
            await nextBtn.waitFor({ state: 'visible', timeout: 5000 })
            await nextBtn.click()
            await this.page.waitForTimeout(300)
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

    async searchProject(name: string): Promise<void> {
        let found = false
        let maxPages = 20 // ✅ hard limit to prevent infinite loop

        do {
            await this.page.locator(this.projectsListName).first().waitFor({ state: 'visible', timeout: 10000 })
            const elements = await this.page.locator(this.projectsListName).all()
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

        if (!found) console.warn(`Project "${name}" not found in any page`)
    }

    // =========================================
    // CRUD
    // =========================================

    async addProject(pName: string, dName: string, cName: string, pMName: string, dateValue: string, col: string): Promise<void> {
        await this.page.locator(this.addNewProjectBtn).waitFor({ state: 'visible', timeout: 30000 })
        await this.page.locator(this.addNewProjectBtn).click()

        await this.page.locator(this.projectName).waitFor({ state: 'visible', timeout: 30000 })
        await this.page.locator(this.projectName).fill(pName)
        await this.page.locator(this.displayName).fill(dName)

        await this.utility.click({ selector: this.selClient })
        await this.utility.click({ selector: this.optionByText(cName) })

        await this.utility.click({ selector: this.startDate })
        const [year, month, day] = dateValue.split('-')
        await this.dateSelection(year, month, day)

        await this.utility.click({ selector: this.selProjectManager })
        // ✅ Project manager option may need hover before click (MUI list virtualization)
        const pmOption = this.page.locator(this.optionContains(pMName))
        await pmOption.waitFor({ state: 'visible', timeout: 10000 })
        await pmOption.hover()
        await pmOption.click()

        await this.page.locator(this.colorCode).fill(col)
        await this.utility.click({ selector: this.addBtn })

        try {
            await this.page.locator(this.cnfmPromptOkBtn).waitFor({ state: 'visible', timeout: 5000 })
            await this.page.locator(this.cnfmPromptOkBtn).click()
        } catch {
            console.log('Confirmation prompt did not appear — skipping')
        }
    }

    async editProject(projectName_: string, updatedFields: Map<string, string>): Promise<void> {
        const row = this.page.locator(this.rowByName(projectName_))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()
        await this.page.waitForTimeout(500) // ✅ hover settle before SVG dispatch

        const editBtn = this.page.locator(this.editBtnByName(projectName_))
        await editBtn.dispatchEvent('click') // ✅ no waitFor visible — hover-revealed icon

        for (const [fieldName, value] of updatedFields.entries()) {
            switch (fieldName) {
                case 'Client Name': {
                    await this.utility.click({ selector: this.selClient })
                    await this.utility.click({ selector: this.optionByText(value) })
                    break
                }
                case 'Start Date': {
                    const [y, m, d] = value.split('-')
                    await this.utility.click({ selector: this.startDate })
                    await this.dateSelection(y, m, d)
                    break
                }
                case 'Name of Project': {
                    const field = this.page.locator(this.projectName)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                case 'Display Name': {
                    const field = this.page.locator(this.displayName)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    break
                }
                case 'Color Code': {
                    const field = this.page.locator(this.colorCode)
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

    async deleteProject(name: string): Promise<void> {
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
    // FILTERS
    // =========================================

    async filterByClient(clientName: string): Promise<boolean> {
        await this.utility.click({ selector: this.clientDD })
        await this.utility.click({ selector: this.filterOption(clientName) })

        // ✅ Wait for table re-render with filtered data (avoids stale-row race condition)
        await this.page.locator(this.tableRows).first().waitFor({ state: 'visible', timeout: 10000 })
        try {
            await this.page.waitForFunction(
                ({ selector, name }: { selector: string; name: string }) => {
                    const rows = document.querySelectorAll(selector)
                    return Array.from(rows).some(row => {
                        const cells = row.querySelectorAll('td')
                        return cells[3]?.textContent?.includes(name) // ✅ index 3 = Client column
                    })
                },
                { selector: 'table.w-full tbody tr', name: clientName },
                { timeout: 10000 }
            )
        } catch {
            return false
        }
        return true
    }

    async getDefaultFilterValue(): Promise<string> {
        return await this.page.locator(this.clientDefault).inputValue()
    }

    async doClearFilter(): Promise<void> {
        const filterLocator = this.page.locator(this.removeFilter)
        await filterLocator.waitFor({ state: 'visible', timeout: 30000 })
        await filterLocator.click()
    }

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

    async openAddProjectForm(): Promise<void> {
        const btn = this.page.locator(this.addNewProjectBtn)
        await btn.waitFor({ state: 'visible', timeout: 30000 })
        await btn.scrollIntoViewIfNeeded()
        await btn.click()
    }

    async clickAddWithoutData(): Promise<void> {
        await this.utility.click({ selector: this.addBtn })
    }

    async getProjectValidationErrors(): Promise<string[]> {
        const elements = this.page.locator(this.errorMsgs)
        await elements.first().waitFor({ state: 'visible', timeout: 10000 })
        const texts = await elements.allTextContents()
        return texts.map(t => t.trim())
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
        const pName = await this.page.locator(this.projectName).inputValue()
        const dName = await this.page.locator(this.displayName).inputValue()
        return pName === '' && dName === ''
    }

    async enterProjectNameOnly(name: string): Promise<void> {
        const field = this.page.locator(this.projectName)
        await field.fill(name)
        await field.press('Tab') // trigger validation
    }

    // =========================================
    // MODAL CLOSE
    // =========================================

    async isProjectFormClosed(): Promise<boolean> {
        return await this.page.locator(this.modalDialog).count() === 0
    }

    async closeIconClick(): Promise<void> {
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

    async safelyCloseProjectForm(): Promise<void> {
        if (this.page.isClosed()) return
        try {
            await this.closeIconClick()
        } catch {
            try {
                await this.pressEscape()
            } catch {
                await this.clickOutsideModal()
            }
        }
    }
}