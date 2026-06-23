import { Page } from '@playwright/test'
import { BasePage } from '../base/BasePage'

export class HolidaysPage extends BasePage {

    // =========================================
    // LOCATORS
    // =========================================

    private readonly addHolidayBtn = "//button[text()='Add New Holiday']"
    private readonly cnfmPromptOkBtn = "//button[text()='Ok']"
    private readonly successMsg = "//div//h2"
    private readonly updateBtn = "//button[text()='Update']"
    private readonly okBtn = "//button[text()='OK']"
    private readonly holidayCalendar = "//input[@data-testid='add-holiday/holiday-calender']"
    private readonly addBtn = "//button[@data-testid='add-holiday/add-or-update']"
    private readonly errorMsg = "//div[@class='text-error text-xs']"
    private readonly closeBtn = "//div[@class='absolute text-right mr-2 right-2 top-2']//*[local-name()='svg' and @class='cursor-pointer']"
    private readonly holidaysListName = "//tbody//td[3]"
    private readonly paginationNext = "//*[local-name()='svg' and @class='-rotate-90 cursor-pointer']"
    private readonly table = 'table.w-full'
    private readonly tableHeaders = 'table.w-full th'
    private readonly tableRows = 'table.w-full tbody tr'
    private readonly holidayCalendarDD = "//label[text()='Holiday Calendar']/parent::div//div[@role='button']"
    private readonly holidayCalendarDefault = "//div[@data-testid='org-holidays/choose-holiday-calendar']//span[contains(@class,'font')]"
    private readonly yearDefault = "//input[@placeholder='Select Year']"
    private readonly removeFilter = "div.bg-white.items-center path:nth-child(2)"
    private readonly formContainer = "//div[contains(@class,'MuiDialog-container')]"
    private readonly holidayDate = "//button[@data-testid='add-holiday/holiday-date']"
    private readonly description = "//input[@placeholder='Description *']"
    private readonly resetBtn = "//button[@data-testid='add-holiday/reset']"
    private readonly errorMsgs = "//div[contains(@class,'text-error') and not(contains(@style,'display: none'))]"
    private readonly closeIcon = "//div[contains(@class,'MuiDialog-container')]//*[local-name()='svg']"

    private readonly calendarSwitchYear = "//button[contains(@class,'MuiPickersCalendarHeader-switchViewButton')]"
    private readonly currentMonthLabel = "//div[contains(@id,'-grid-label')]"
    private readonly nextMonthBtn = "//button[@title='Next month']"

    // =========================================
    // DYNAMIC LOCATORS
    // =========================================

    private yearBtn = (year: string) => `//button[text()='${year}']`
    // private currentMonthLabel = "//button[@aria-label='calendar view is open, switch to year view']/preceding-sibling::div/div"
    private dayBtn = (day: string) => `//button[not(contains(@class,'MuiPickersDay-dayOutsideMonth'))][text()='${day}']`
    private calendarOption = (name: string) => `//ul//li[text()='${name}']`
    private filterOption = (value: string) => `//ul[@role='listbox']/li[text()='${value}']`
    private rowByDescription = (name: string) => `//tbody//div[text()='${name}']//parent::td//parent::tr`
    private editBtnByDescription = (name: string) => `(//tbody//div[text()='${name}']//parent::td//parent::tr//*[local-name()='svg'])[position()=1]`
    private deleteBtnByDescription = (name: string) => `(//tbody//div[text()='${name}']//parent::td//parent::tr//*[local-name()='svg'])[position()=2]`

    constructor(page: Page) {
        super(page)
    }

    // =========================================
    // PAGE INFO
    // =========================================

    async getHolidaysPageTitle(): Promise<string> {
        await this.page.waitForFunction(
            (text) => document.title.includes(text),
            'Holidays',
            { timeout: 30000 }
        )
        const title = await this.page.title()
        console.log('Holidays Page Title is:', title)
        return title
    }

    async getHolidaysPageUrl(): Promise<string> {
        await this.page.waitForURL('**/holidays**', { timeout: 30000 })
        const url = this.page.url()
        console.log('Holidays Page Url is:', url)
        return url
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
        await this.page.locator(this.tableHeaders).first().waitFor({ state: 'visible', timeout: 10000 })
        const headers = await this.page.locator(this.tableHeaders).allTextContents()
        return headers.map(t => t.trim()).filter(t => t !== '')
    }

    // =========================================
    // DATE PICKER (private helper)
    // =========================================

    private async dateSelection(year: string, month: string, day: string): Promise<void> {
        await this.page.waitForTimeout(2000)
        await this.page.locator(this.currentMonthLabel).waitFor({ state: 'visible', timeout: 20000 })

        const switchBtn = this.page.locator(this.calendarSwitchYear)
        await switchBtn.waitFor({ state: 'visible', timeout: 5000 })
        await switchBtn.click()

        await this.page.waitForTimeout(1000)

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

    async searchHoliday(holidayName: string): Promise<void> {
        let found = false
        do {
            await this.page.locator(this.holidaysListName).first().waitFor({ state: 'visible', timeout: 10000 })
            const elements = await this.page.locator(this.holidaysListName).all()
            for (const element of elements) {
                const text = await element.textContent()
                if (text?.includes(holidayName)) {
                    found = true
                    break
                }
            }
            if (!found) {
                const hasNext = await this.isPageNextExists()
                if (!hasNext) break
                await this.utility.click({ selector: this.paginationNext })
                await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { })
            }
        } while (!found)
    }

    // =========================================
    // CRUD
    // =========================================

    async addNewHoliday(calendarName: string, dateValue: string, hDescription: string): Promise<void> {
        await this.page.locator(this.addHolidayBtn).waitFor({ state: 'visible', timeout: 30000 })
        await this.page.waitForTimeout(2000)  // ✅ Ensure button is interactable
        await this.page.locator(this.addHolidayBtn).click()

        // Type calendar name and select from autocomplete
        await this.page.locator(this.holidayCalendar).fill(calendarName)
        await this.page.locator(this.holidayCalendar).press('ArrowDown')
        await this.page.locator(this.holidayCalendar).press('Enter')

        // Date
        await this.page.locator(this.holidayDate).click()
        // await this.dateSelection(hYear, hMonth, hDay)
        const [year, month, day] = dateValue.split('-')
        await this.dateSelection(year, month, day)

        // Description
        await this.page.locator(this.description).fill(hDescription)
        await this.page.locator(this.description).press('Tab')

        // Add + Confirm
        await this.utility.click({ selector: this.addBtn })
        try {
            await this.page.locator(this.cnfmPromptOkBtn).waitFor({ state: 'visible', timeout: 5000 })
            await this.page.locator(this.cnfmPromptOkBtn).click()
        } catch {
            console.log('Confirmation prompt did not appear — skipping')
        }
    }

    async editHoliday(holidayName: string, updatedFields: Map<string, string>): Promise<void> {
        const row = this.page.locator(this.rowByDescription(holidayName))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()

        const editBtn = this.page.locator(this.editBtnByDescription(holidayName))
        await editBtn.waitFor({ state: 'visible', timeout: 5000 })
        await editBtn.dispatchEvent('click')

        for (const [fieldName, value] of updatedFields.entries()) {
            switch (fieldName) {
                case 'Client Name': {
                    await this.page.locator(this.holidayCalendar).click()
                    await this.utility.click({ selector: this.calendarOption(value) })
                    break
                }
                case 'Holiday Date': {
                    const [y, m, d] = value.split('-')
                    await this.page.locator(this.holidayDate).click()
                    await this.dateSelection(y, m, d)
                    break
                }
                case 'Description': {
                    const field = this.page.locator(this.description)
                    await field.click()
                    await field.selectText()
                    await field.press('Delete')
                    await field.fill(value)
                    await field.press('Tab')
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

    async deleteHoliday(holidayName: string): Promise<void> {
        const row = this.page.locator(this.rowByDescription(holidayName))
        await row.waitFor({ state: 'visible', timeout: 10000 })
        await row.hover()

        const deleteBtn = this.page.locator(this.deleteBtnByDescription(holidayName))
        await deleteBtn.waitFor({ state: 'visible', timeout: 5000 })
        await deleteBtn.dispatchEvent('click')

        try {
            await this.page.locator(this.okBtn).waitFor({ state: 'visible', timeout: 5000 })
            await this.page.locator(this.okBtn).click()
            await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { })
            await this.page.waitForTimeout(1000)
        } catch {
            console.log('Delete confirmation did not appear — skipping')
        }
    }

    // =========================================
    // FILTERS
    // =========================================

    // async filterByHolidayCalendar(calendarName: string): Promise<boolean> {
    //     await this.utility.click({ selector: this.holidayCalendarDD })
    //     await this.utility.click({ selector: this.filterOption(calendarName) })
    //     await this.page.waitForLoadState('networkidle')

    //     const rows = this.page.locator(this.tableRows)
    //     const count = await rows.count()
    //     for (let i = 0; i < count; i++) {
    //         const cellText = await rows.nth(i).locator('td').nth(4).textContent()
    //         if (cellText?.includes(calendarName)) return true
    //     }
    //     return false
    // }

    async filterByHolidayCalendar(calendarName: string): Promise<boolean> {
        await this.utility.click({ selector: this.holidayCalendarDD })
        await this.utility.click({ selector: this.filterOption(calendarName) })

        // ✅ Wait for the table to re-render with filtered rows
        // by waiting until the first Holiday Calendar cell reflects the selected filter
        await this.page.locator(this.tableRows).first().waitFor({ state: 'visible', timeout: 10000 })
        await this.page.waitForFunction(
            ({ selector, name }: { selector: string; name: string }) => {
                const rows = document.querySelectorAll(selector)
                return Array.from(rows).some(row => {
                    const cells = row.querySelectorAll('td')
                    return cells[4]?.textContent?.includes(name)
                })
            },
            { selector: 'table.w-full tbody tr', name: calendarName },
            { timeout: 10000 }
        )
        return true
    }

    async getDefaultFilterValue(): Promise<string[]> {
        const cal = await this.page.locator(this.holidayCalendarDefault).textContent()
        const year = await this.page.locator(this.yearDefault).inputValue()
        return [cal?.trim() ?? '', year]
    }

    async doClearFilter(): Promise<void> {
        await this.page.locator(this.removeFilter).waitFor({ state: 'visible', timeout: 30000 })
        await this.page.locator(this.removeFilter).click()
    }

    // =========================================
    // FORM VALIDATION
    // =========================================

    async openAddHolidayForm(): Promise<void> {
        await this.page.locator(this.addHolidayBtn).waitFor({ state: 'visible', timeout: 30000 })
        await this.page.locator(this.addHolidayBtn).click()
    }

    async clickAddWithoutData(): Promise<void> {
        await this.utility.click({ selector: this.addBtn })
    }

    async getHolidayValidationErrors(): Promise<string[]> {
        const elements = this.page.locator(this.errorMsgs)
        await elements.first().waitFor({ state: 'visible', timeout: 10000 })
        const texts = await elements.allTextContents()
        return texts.map(t => t.trim())
    }

    async enterHolidayCalendarOnly(calendar: string): Promise<void> {
        await this.page.locator(this.holidayCalendar).fill(calendar)
        await this.page.locator(this.holidayCalendar).press('ArrowDown')
        await this.page.locator(this.holidayCalendar).press('Enter')
        await this.page.locator(this.holidayCalendar).press('Tab')
    }

    async enterDescriptionOnly(descriptionText: string): Promise<void> {
        await this.page.locator(this.description).fill(descriptionText)
        await this.page.locator(this.description).press('Tab')
    }

    async isResetEnabled(): Promise<boolean> {
        await this.page.locator(this.resetBtn).waitFor({ state: 'attached', timeout: 10000 })
        return await this.page.locator(this.resetBtn).isEnabled()
    }

    async clickReset(): Promise<void> {
        await this.page.locator(this.resetBtn).waitFor({ state: 'visible', timeout: 10000 })
        await this.page.locator(this.resetBtn).click()
    }

    async isFormCleared(): Promise<boolean> {
        const cal = await this.page.locator(this.holidayCalendar).inputValue()
        const desc = await this.page.locator(this.description).inputValue()
        return cal === '' && desc === ''
    }

    // =========================================
    // MODAL CLOSE
    // =========================================

    async isHolidayFormClosed(): Promise<boolean> {
        return await this.page.locator(this.formContainer).count() === 0
    }

    async safelyCloseHolidayForm(): Promise<void> {
        if (this.page.isClosed()) return
        try {
            await this.page.locator(this.closeIcon).waitFor({ state: 'visible', timeout: 5000 })
            await this.page.locator(this.closeIcon).click()
        } catch {
            try {
                await this.page.keyboard.press('Escape')
            } catch {
                await this.page.locator('body').click()
            }
        }
    }

    // =========================================
    // DATE UTILITY — returns "YYYY-Month-DD" to match addNewHoliday's dateValue param
    // =========================================

    getRandomFutureDate(): { dateValue: string; year: string; month: string; day: string } {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ]
        const daysAhead = 30 + Math.floor(Math.random() * 210)
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + daysAhead)

        const year = futureDate.getFullYear().toString()
        const month = monthNames[futureDate.getMonth()]
        const day = futureDate.getDate().toString()

        return { dateValue: `${year}-${month}-${day}`, year, month, day }
    }

    // =========================================
    // NEW: check if a specific day is disabled in the picker (past-date test)
    // =========================================
    async isCurrentMonthDayDisabled(day: string): Promise<boolean> {
        // ✅ Wait for calendar grid to render (current month, no navigation needed)
        await this.page.locator(this.currentMonthLabel).waitFor({ state: 'visible', timeout: 20000 })
        // ✅ Match day button using exact DOM structure — excludes outside-month days
        const dayBtnLocator = this.page.locator(
            `//button[contains(@class,'MuiPickersDay-root') and not(contains(@class,'MuiPickersDay-dayOutsideMonth')) and normalize-space(text())='${day}']`
        )
        await dayBtnLocator.first().waitFor({ state: 'visible', timeout: 5000 })
        // ✅ Confirmed from DOM: disabled days have class="Mui-disabled" AND disabled="" attribute
        return await dayBtnLocator.first().isDisabled()
    }

    // =========================================
    // NEW: get duplicate-date validation error text after Add
    // =========================================

    async getDuplicateDateError(): Promise<string | null> {
        await this.page.waitForTimeout(1000)  // ✅ Allow time for error message to appear
        const duplicateError = this.page.locator(this.errorMsgs)
        const isVisible = await duplicateError.isVisible().catch(() => false)
        if (!isVisible) return null
        return (await duplicateError.textContent())?.trim() ?? null
    }

    /**
     * Opens the Add Holiday form and the holiday date picker, ready for date interaction.
     */
    async openHolidayDatePicker(): Promise<void> {
        await this.openAddHolidayForm()
        await this.page.locator(this.holidayDate).click()
    }
}