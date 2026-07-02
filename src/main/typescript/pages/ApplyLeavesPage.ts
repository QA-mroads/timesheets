import { Page } from '@playwright/test'
import { BasePage } from '../base/BasePage'
import path from 'path'

export class ApplyLeavesPage extends BasePage {

    // =========================================
    // LOCATORS — Leave Balance
    // =========================================

    private readonly leaveBalanceCard = (index: number) =>
        `[data-testid='apply-leaves/leave-balance/${index}']`
    private readonly leaveBalanceName = (index: number) =>
        `[data-testid='apply-leaves/leave-balance/${index}'] [data-testid='apply-leaves/leave-balance/leave-name']`
    private readonly leaveRemainingCount = (index: number) =>
        `[data-testid='apply-leaves/leave-balance/${index}'] [data-testid='remaining-leaves']`
    private readonly leaveAssignedCount = (index: number) =>
        `[data-testid='apply-leaves/leave-balance/${index}'] [data-testid='assigned-leaves']`
    private readonly leaveUsedCount = (index: number) =>
        `[data-testid='apply-leaves/leave-balance/${index}'] [data-testid='used-leaves']`

    // =========================================
    // LOCATORS — Form Fields
    // =========================================

    private readonly yearDropdown = "[data-testid='apply-leaves/calendarYear']"
    private readonly leaveTypeDropdown = "[data-testid='apply-leaves/leaveType']"
    private readonly startDateBtn = "[data-testid='apply-leaves/start-date']"
    private readonly startSessionDropdown = "[data-testid='apply-leaves/start-date-session']"
    private readonly endDateBtn = "[data-testid='apply-leaves/end-date']"
    private readonly endSessionDropdown = "[data-testid='apply-leaves/end-date-session']"
    private readonly attachmentInput = "//div[@data-testid='apply-leaves/attachment']//following::input[@type='file']"
    private readonly reasonTextarea = "[data-testid='apply-leaves/reason'] textarea:not([aria-hidden='true'])"
    private readonly reasonCharCounter = "[data-testid='apply-leaves/reason'] p.MuiFormHelperText-root"
    private readonly totalDaysText = "//p[contains(text(),'Applying for a total of')]"
    private readonly uploadedDocumentByName = (filename: string) => `//span[@aria-label='${filename}']`

    // =========================================
    // LOCATORS — Buttons
    // =========================================

    private readonly resetBtn = "[data-testid='apply-leaves/reset']"
    private readonly submitBtn = "[data-testid='apply-leaves/submit']"

    // =========================================
    // LOCATORS — Validation Errors
    // =========================================

    // ✅ All exact texts confirmed from validation-state DOM
    private readonly leaveTypeError = "//div[@data-testid='apply-leaves/leaveType']/following-sibling::div[contains(@class,'text-error')]"
    private readonly startDateError = "//div[contains(@class,'text-error')][text()='Start date required']"
    private readonly startSessionError = "//div[@data-testid='apply-leaves/start-date-session']/following-sibling::div[contains(@class,'text-error')]"
    private readonly endDateError = "//div[contains(@class,'text-error')][text()='End date required']"
    private readonly endSessionError = "//div[@data-testid='apply-leaves/end-date-session']/following-sibling::div[contains(@class,'text-error')]"
    private readonly reasonError = "//div[contains(@class,'text-error')][text()='Reason required']"

    // =========================================
    // LOCATORS — Reset/Delete/Cancel Confirmation Dialog
    // =========================================
    private readonly confirmationDialog = "//div[@role='dialog']"
    private readonly resetConfirmationBtn = "//div[@role='dialog']//button[text()='Reset']"
    private readonly submitConfirmationBtn = "//div[@role='dialog']//button[text()='Submit']"
    private readonly cancelConfirmationBtn = "//div[@role='dialog']//button[text()='Cancel']"

    // =========================================
    // LOCATORS — Unsaved Changes Dialog
    // (same DOM as Timesheets — confirmed identical)
    // =========================================

    private readonly unsavedChangesDialog = "//div[@role='dialog'][contains(.,'all the data added will be lost')]"
    private readonly stayHereBtn = "//button[text()='Stay here']"
    private readonly continueBtn = "//button[text()='Continue']"

    // =========================================
    // LOCATORS — Navigation triggers
    // =========================================

    private readonly timesheetsTabBtn = "//p[text()='Time Entries']/ancestor::div[@role='button']"
    private readonly leaveHistoryTabBtn = "//p[text()='History']/ancestor::div[@role='button']"

    // =========================================
    // METHODS — File Error Dialog (same pattern as TimesheetsPage)
    // =========================================

    // ✅ Reuse the same locators confirmed from the Timesheets documents error dialog DOM
    private readonly fileSizeUploadError = "//div[contains(text(),'File size too large')]"
    private readonly removeDocumentIcon = `//div[@data-testid='apply-leaves/attachment']//*[@data-testid='closeIcon']`

    // =========================================
    // LOCATORS — Confirmation Preview Dialog
    // =========================================

    private readonly previewDialog = "[data-testid='leave-preview']"
    private readonly previewLeaveType = "[data-testid='leave-preview/leave-type'] p:last-child"
    private readonly previewFromDate = "[data-testid='leave-preview/from-date'] p:last-child"
    private readonly previewToDate = "[data-testid='leave-preview/to-date'] p:last-child"
    private readonly previewTotalDays = "[data-testid='leave-preview/total-days'] p:last-child"
    private readonly previewAttachment = "[data-testid='leave-preview/attachment'] p"
    private readonly previewReason = "[data-testid='leave-preview/reason'] p:last-child"
    private readonly previewCancelBtn = "[data-testid='leave-preview/cancel']"
    private readonly previewSubmitBtn = "[data-testid='leave-preview/submit']"
    private readonly previewCloseIcon = "[data-testid='closeIcon']"

    private readonly validationMessage = "//div[@role='dialog']//h2[contains(text(),'Already')]"


    // =========================================
    // LOCATORS — MUI Date Picker (same as HolidaysPage/ProjectsPage)
    // =========================================

    private readonly calendarSwitchYear = "//button[contains(@class,'MuiPickersCalendarHeader-switchViewButton')]"
    private readonly currentMonthLabel = "//div[contains(@id,'-grid-label')]"
    private readonly nextMonthBtn = "//button[@title='Next month']"
    private yearBtn = (year: string) =>
        `//button[contains(@class,'PrivatePickersYear-yearButton') or contains(@class,'MuiPickersYear-yearButton')][normalize-space(text())='${year}']`
    private dayBtn = (day: string) =>
        `//button[contains(@class,'MuiPickersDay-root') and not(contains(@class,'MuiPickersDay-dayOutsideMonth')) and not(@disabled) and normalize-space(text())='${day}']`

    // =========================================
    // LOCATORS — MUI Select option
    // =========================================

    private readonly selectOption = (value: string) => `//ul[@role='listbox']/li[contains(text(),'${value}')]`

    constructor(page: Page) {
        super(page)
    }

    // =========================================
    // METHODS — Navigation
    // =========================================

    async isLeaveBalanceTitleVisible(): Promise<boolean> {
        return await this.page.locator(this.leaveBalanceCard(0)).isVisible().catch(() => false)
    }

    // =========================================
    // METHODS — Leave Balance
    // =========================================

    async getLeaveTypeName(cardIndex: number): Promise<string> {
        return (await this.page.locator(this.leaveBalanceName(cardIndex)).textContent())?.trim() ?? ''
    }

    async getRemainingLeaves(cardIndex: number): Promise<string> {
        return (await this.page.locator(this.leaveRemainingCount(cardIndex)).textContent())?.trim() ?? ''
    }

    async getAssignedLeaves(cardIndex: number): Promise<string> {
        return (await this.page.locator(this.leaveAssignedCount(cardIndex)).textContent())?.trim() ?? ''
    }

    async getUsedLeaves(cardIndex: number): Promise<string> {
        return (await this.page.locator(this.leaveUsedCount(cardIndex)).textContent())?.trim() ?? ''
    }

    // =========================================
    // METHODS — Date Picker (same fix as HolidaysPage/ProjectsPage)
    // =========================================

    private async dateSelection(year: string, month: string, day: string): Promise<void> {
        await this.page.locator(this.currentMonthLabel).waitFor({ state: 'visible', timeout: 20000 })

        const switchBtn = this.page.locator(this.calendarSwitchYear)
        await switchBtn.waitFor({ state: 'visible', timeout: 5000 })
        await switchBtn.click()
        await this.page.waitForTimeout(500)

        const anyYearBtn = this.page.locator(
            "//button[contains(@class,'PrivatePickersYear-yearButton') or contains(@class,'MuiPickersYear-yearButton')]"
        ).first()
        await anyYearBtn.waitFor({ state: 'attached', timeout: 15000 })
        await anyYearBtn.waitFor({ state: 'visible', timeout: 5000 })

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
                break
            }
            await this.page.locator(this.nextMonthBtn).click()
            await this.page.waitForTimeout(300)
        }
    }

    // =========================================
    // METHODS — Form Fields
    // =========================================

    async selectLeaveType(leaveTypeName: string): Promise<void> {
        await this.page.locator(this.leaveTypeDropdown).click()
        await this.page.locator(this.selectOption(leaveTypeName)).click()
    }

    async selectStartDate(year: string, month: string, day: string): Promise<void> {
        await this.page.locator(this.startDateBtn).click()
        await this.dateSelection(year, month, day)
    }

    async selectStartSession(session: 'Full Day' | 'First session' | 'Second session'): Promise<void> {
        await this.page.locator(this.startSessionDropdown).click()
        await this.page.locator(this.selectOption(session)).click()
    }

    async selectEndDate(year: string, month: string, day: string): Promise<void> {
        await this.page.locator(this.endDateBtn).click()
        await this.dateSelection(year, month, day)
    }

    async selectEndSession(session: 'Full Day' | 'First session' | 'Second session'): Promise<void> {
        await this.page.locator(this.endSessionDropdown).click()
        await this.page.locator(this.selectOption(session)).click()
    }

    async fillReason(reason: string): Promise<void> {
        const textarea = this.page.locator(this.reasonTextarea)
        await textarea.waitFor({ state: 'visible', timeout: 10000 })
        await textarea.fill(reason)
    }

    async getReason(): Promise<string> {
        return await this.page.locator(this.reasonTextarea).inputValue()
    }

    async getReasonCharCounter(): Promise<string> {
        return (await this.page.locator(this.reasonCharCounter).textContent())?.trim() ?? ''
    }

    async uploadAttachment(filePath: string): Promise<void> {
        await this.page.locator(this.attachmentInput).setInputFiles(filePath)
    }

    async isAttachmentVisible(filename: string): Promise<boolean> {
        await this.page.waitForTimeout(1000)
        const attachmentLocator = this.page.locator(this.uploadedDocumentByName(filename))
        return await attachmentLocator.isVisible().catch(() => false)
    }

    async getTotalDaysText(): Promise<string> {
        return (await this.page.locator(this.totalDaysText).textContent())?.trim() ?? ''
    }

    // =========================================
    // METHODS — Buttons
    // =========================================

    async clickSubmit(): Promise<void> {
        await this.page.locator(this.submitBtn).click()
    }

    async isResetEnabled(): Promise<boolean> {
        return await this.page.locator(this.resetBtn).isEnabled()
    }

    async clickReset(): Promise<void> {
        const btn = this.page.locator(this.resetBtn)
        await btn.waitFor({ state: 'visible', timeout: 5000 })
        await btn.click()
    }

    async isFormCleared(): Promise<boolean> {
        const reason = await this.page.locator(this.reasonTextarea).inputValue()
        const leaveTypeVal = await this.page.locator(`${this.leaveTypeDropdown} input`).inputValue()
        return reason === '' && leaveTypeVal === ''
    }

    // =========================================
    // METHODS — Validation Errors
    // =========================================

    async getValidationErrors(): Promise<string[]> {
        // ✅ Collect all confirmed error texts from DOM
        const errorSelectors = [
            this.leaveTypeError,
            this.startDateError,
            this.startSessionError,
            this.endDateError,
            this.endSessionError,
            this.reasonError,
        ]
        const errors: string[] = []
        for (const selector of errorSelectors) {
            const locator = this.page.locator(selector)
            const isVisible = await locator.isVisible().catch(() => false)
            if (isVisible) {
                const text = await locator.textContent()
                if (text?.trim()) errors.push(text.trim())
            }
        }
        return errors
    }

    async isEndDateDisabled(): Promise<boolean> {
        return await this.page.locator(this.endDateBtn).isDisabled()
    }

    async isEndSessionDisabled(): Promise<boolean> {
        const input = this.page.locator(`${this.endSessionDropdown} input`)
        return await input.isDisabled()
    }

    // =========================================
    // METHODS — Confirmation Preview Dialog
    // =========================================

    async isPreviewDialogVisible(): Promise<boolean> {
        return await this.page.locator(this.previewDialog).isVisible().catch(() => false)
    }

    async getPreviewLeaveType(): Promise<string> {
        await this.page.locator(this.previewLeaveType).waitFor({ state: 'visible', timeout: 10000 })
        return (await this.page.locator(this.previewLeaveType).textContent())?.trim() ?? ''
    }

    async getPreviewFromDate(): Promise<string> {
        return (await this.page.locator(this.previewFromDate).textContent())?.trim() ?? ''
    }

    async getPreviewToDate(): Promise<string> {
        return (await this.page.locator(this.previewToDate).textContent())?.trim() ?? ''
    }

    async getPreviewTotalDays(): Promise<string> {
        return (await this.page.locator(this.previewTotalDays).textContent())?.trim() ?? ''
    }

    async getPreviewAttachment(): Promise<string> {
        return (await this.page.locator(this.previewAttachment).textContent())?.trim() ?? ''
    }

    async getPreviewReason(): Promise<string> {
        return (await this.page.locator(this.previewReason).textContent())?.trim() ?? ''
    }

    async confirmLeaveApplication(): Promise<void> {
        const submitBtn = this.page.locator(this.previewSubmitBtn)
        await submitBtn.waitFor({ state: 'visible', timeout: 10000 })
        await submitBtn.click()
    }

    async cancelLeaveApplication(): Promise<void> {
        await this.page.locator(this.previewCancelBtn).click()
    }

    async closePreviewDialog(): Promise<void> {
        await this.page.locator(this.previewCloseIcon).click()
    }

    // =========================================
    // METHODS — Composite helper
    // =========================================

    /**
     * Fills the entire leave application form.
     * dateValue format: 'YYYY-Month-DD' e.g. '2026-August-10'
     */
    async fillLeaveForm(
        leaveType: string,
        startDateValue: string,
        endDateValue: string,
        reason: string,
        startSession: 'Full Day' | 'First session' | 'Second session' = 'Full Day',
        endSession: 'Full Day' | 'First session' | 'Second session' = 'Full Day'
    ): Promise<void> {
        await this.selectLeaveType(leaveType)

        const [sYear, sMonth, sDay] = startDateValue.split('-')
        await this.selectStartDate(sYear, sMonth, sDay)
        await this.selectStartSession(startSession)

        const [eYear, eMonth, eDay] = endDateValue.split('-')
        await this.selectEndDate(eYear, eMonth, eDay)
        await this.selectEndSession(endSession)

        await this.fillReason(reason)
    }

    async confirmResetSubmitOrCancelLeave(action: 'reset' | 'submit' | 'cancel'): Promise<void> {
        const dialog = this.page.locator(this.confirmationDialog)
        await dialog.waitFor({ state: 'visible', timeout: 5000 })

        if (action === 'reset') {
            await this.page.locator(this.resetConfirmationBtn).click()
        } else if (action === 'submit') {
            await this.page.locator(this.submitConfirmationBtn).click()
        } else {
            await this.page.locator(this.cancelConfirmationBtn).click()
        }
    }


    async isFileErrorDialogVisible(): Promise<boolean> {
        return await this.page.locator(this.fileSizeUploadError).isVisible().catch(() => false)
    }

    async removeUploadDocument(): Promise<void> {
        const okBtn = this.page.locator(this.removeDocumentIcon)
        await okBtn.waitFor({ state: 'visible', timeout: 5000 })
        await okBtn.click()
    }


    // =========================================
    // METHODS — Unsaved Changes Dialog
    // =========================================

    async isUnsavedChangesDialogVisible(): Promise<boolean> {
        await this.page.waitForTimeout(1000) // ✅ small settle — dialog appears after nav click
        return await this.page.locator(this.unsavedChangesDialog).isVisible().catch(() => false)
    }

    async clickStayHere(): Promise<void> {
        const btn = this.page.locator(this.stayHereBtn)
        await btn.waitFor({ state: 'visible', timeout: 5000 })
        await btn.click()
    }

    async clickContinue(): Promise<void> {
        const btn = this.page.locator(this.continueBtn)
        await btn.waitFor({ state: 'visible', timeout: 5000 })
        await btn.click()
    }

    // =========================================
    // METHODS — Navigation triggers
    // =========================================

    async clickTimesheetsTab(): Promise<void> {
        await this.page.locator(this.timesheetsTabBtn).click()
    }

    async clickLeaveHistoryTab(): Promise<void> {
        await this.page.locator(this.leaveHistoryTabBtn).click()
    }

    async goToLeaveHistoryTab(): Promise<void> {
        await this.clickLeaveHistoryTab()
        await this.page.waitForTimeout(1000) // ✅ small settle — tab content appears after click
    }


    async getValidationMessage(): Promise<string> {
        const locator = this.page.locator(this.validationMessage)
        await locator.waitFor({ state: 'visible', timeout: 5000 })
        return (await locator.textContent())?.trim() ?? ''
    }

}