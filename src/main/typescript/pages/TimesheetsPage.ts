import { BasePage } from "../base/BasePage";
import path from 'path';

export class TimesheetsPage extends BasePage {

    // =========================================
    // LOCATORS — Page / Navigation
    // =========================================

    private readonly settingsTab = "//p[text()='Settings']/ancestor::div[@role='button']"
    private readonly weekSelectedHeader = "//h6[text()='Week Selected']"
    private readonly leavesTab = "//p[text()='Leaves']/ancestor::div[@role='button']"

    // =========================================
    // LOCATORS — Week Navigation
    // =========================================

    private readonly weekDateRangeLabel = "(//h6[text()='Week Selected']/parent::div//button)[1]"
    private readonly prevWeekBtn = "(//h6[text()='Week Selected']/parent::div//button)[2]"
    private readonly nextWeekBtn = "(//h6[text()='Week Selected']/parent::div//button)[3]"
    private readonly unsavedChangesDialog = "//div[@role='dialog']"
    private readonly stayHereBtn = "//button[text()='Stay here']"
    private readonly continueBtn = "//button[text()='Continue']"

    // =========================================
    // LOCATORS — Add Project / Activity
    // =========================================

    private readonly addProjectBtn = "//button[normalize-space()='Add Project']"
    private readonly projectsPopup = '#projects-list'
    private readonly projectSearchBox = "//div[@id='projects-list']//input[@placeholder='Search']"
    private readonly projectPopupCloseBtn = "//div[@id='projects-list']//*[local-name()='svg' and @data-testid='CloseIcon']"
    private readonly noProjectResultsText = "//div[@id='projects-list']//div[text()='No Options']"

    private readonly addActivityBtn = (project: string) => `(//h6[normalize-space()='${project}']/ancestor::div[@data-projection-id]//button)[2]`
    private readonly activityInput = (project: string) => `//h6[text()='${project}']/ancestor::div[contains(@class,'MuiGrid-container')]//input[@placeholder='Select Activity']`
    private readonly activityOption = (activity: string) => `//li[normalize-space()='${activity}']`
    private readonly projectOption = (project: string) => `//div[@id='projects-list']//h6[text()='${project}']`

    private readonly projectRows = "//h6[ancestor::div[@data-projection-id]]/parent::div/parent::div[@data-projection-id]"
    private readonly projectRowByName = (project: string) => `//h6[normalize-space()='${project}']`
    private readonly projectThreeDotsBtn = (project: string) => `(//h6[normalize-space()='${project}']/ancestor::div[@data-projection-id]//button)[1]`
    private readonly projectDeleteOption = '//li[text()="Delete"]'

    private readonly activityChip = (project: string, activity: string) =>
        `//h6[text()='${project}']/ancestor::div[contains(@class,'MuiGrid-container')]//span[text()='${activity}']/ancestor::div[contains(@class,'MuiChip-root')]`
    private readonly activityChipRemoveIcon = (project: string, activity: string) =>
        `${this.activityChip(project, activity)}//*[@data-testid='CancelIcon']`

    // =========================================
    // LOCATORS — Delete Confirmation Dialog (Project/Activity)
    // =========================================

    private readonly deleteConfirmationDialog = "//div[@role='dialog']"
    private readonly okDeleteBtn = "//button[text()='OK']"
    private readonly deleteBtn = "//button[text()='Delete']"
    private readonly cancelDeleteBtn = "//button[text()='Cancel']"

    // =========================================
    // LOCATORS — Hour Entry
    // =========================================

    private readonly projectDayHourInput = (project: string, dayIndex: number) =>
        `(//h6[normalize-space()='${project}']/ancestor::div[@data-projection-id]//input[@type='text'])[${dayIndex}]`
    private readonly projectHourInputs = (project: string) => `//h6[normalize-space()='${project}']/ancestor::div[@data-projection-id]//input[@type='text']`

    // =========================================
    // LOCATORS — Total Hours
    // =========================================

    private readonly totalHoursLabel = "//p[text()='Total Hours :']/following::p[1]"

    // =========================================
    // LOCATORS — Save / Reset
    // =========================================

    private readonly saveBtn = "//button[text()='Save']"
    private readonly resetBtn = "//button[text()='Reset']"
    private readonly confirmResetBtn = "//h2//parent::div//button[text()='Reset']"
    private readonly successToastMessage = "//div[@role='status' and text()='Saved Successfully']"

    // =========================================
    // LOCATORS — Add Notes
    // =========================================

    private readonly addNotesBtn = "//span[text()='Add Notes']/parent::button"
    private readonly notesTextarea = "//textarea[@placeholder='Type Something...']"
    private readonly notesCharCounter = "//p[contains(@id,'helper-text')]"
    private readonly clearAllNotesLink = "//p[text()='Clear all']"

    // =========================================
    // LOCATORS — Documents
    // =========================================

    private readonly documentsBtn = "//span[text()='Documents']/ancestor::button"
    private readonly documentsFileInput = "input[type='file'][accept='application/pdf,image/jpeg,image/png']"
    private readonly uploadedDocumentByName = (filename: string) => `//span[@aria-label='${filename}']`
    private readonly removeDocumentIcon = (filename: string) =>
        `//span[@aria-label='${filename}']/ancestor::div[contains(@class,'relative h-full')]//*[@data-testid='closeIcon']`

    private readonly fileErrorDialogTitle = "//h2[text()='Please select the appropriate file type with file size.']"
    private readonly fileErrorDialogReason = "//div[contains(@class,'text-[red]')]"
    private readonly fileErrorDialogOkBtn = "//div[contains(@class,'MuiDialogActions-root')]//button[text()='OK']"

    // =========================================
    // METHODS — Page / Navigation
    // =========================================

    async getTimeEntryPageTitle() {
        return await this.page.title()
    }

    async getTimeEntryPageUrl() {
        return this.page.url()
    }

    async isWeekSelectedHeaderVisible(): Promise<boolean> {
        return await this.utility.checkIfElementExists({ selector: this.weekSelectedHeader })
    }

    async goToSettingsTab() {
        await this.utility.click({ selector: this.settingsTab })
        await this.page.waitForURL('**/settings/timesheet-configuration', { timeout: 30000 })
    }

    async goToLeavesTab() {
        await this.utility.click({ selector: this.leavesTab })
        await this.page.waitForURL('**/leaves/apply-leaves', { timeout: 30000 })
    }

    // =========================================
    // METHODS — Week Navigation
    // =========================================

    async getWeekDateRangeLabel(): Promise<string> {
        const label = this.page.locator(this.weekDateRangeLabel)
        await label.waitFor({ state: 'visible', timeout: 10000 })
        return (await label.textContent())?.trim() ?? ''
    }

    async isNextWeekButtonDisabled(): Promise<boolean> {
        return await this.page.locator(this.nextWeekBtn).isDisabled()
    }

    async isPrevWeekButtonDisabled(): Promise<boolean> {
        return await this.page.locator(this.prevWeekBtn).isDisabled()
    }

    async clickPreviousWeek(): Promise<void> {
        await this.page.locator(this.prevWeekBtn).click()
    }

    async clickNextWeek(): Promise<void> {
        await this.page.locator(this.nextWeekBtn).click()
    }

    /**
     * Clicks the next/prev week arrow and handles the unsaved-changes dialog if it appears.
     * action: 'stay' keeps current unsaved data; 'continue' discards it and navigates.
     */
    async navigateWeekWithUnsavedChanges(direction: 'prev' | 'next', action: 'stay' | 'continue'): Promise<void> {
        if (direction === 'prev') {
            await this.clickPreviousWeek()
        } else {
            await this.clickNextWeek()
        }

        const dialog = this.page.locator(this.unsavedChangesDialog)
        await this.page.waitForTimeout(1000) // small delay to allow dialog to appear if it will
        await dialog.waitFor({ state: 'visible', timeout: 5000 })

        if (action === 'stay') {
            await this.page.locator(this.stayHereBtn).click()
        } else {
            await this.page.locator(this.continueBtn).click()
        }
    }

    async isUnsavedChangesDialogVisible(): Promise<boolean> {
        return await this.page.locator(this.unsavedChangesDialog).isVisible().catch(() => false)
    }

    // =========================================
    // METHODS — Add / Remove Project & Activity
    // =========================================

    async isAddProjectButtonVisible(): Promise<void> {
        await this.page.locator(this.addProjectBtn).waitFor({ state: 'visible', timeout: 10000 })
    }

    async clickAddProject() {
        await this.utility.click({ selector: this.addProjectBtn })
    }

    async waitForProjectPopup() {
        await this.page.locator(this.projectsPopup).waitFor()
    }

    async searchAndSelectProject(project: string) {
        await this.waitForProjectPopup()
        await this.utility.typeText({ selector: this.projectSearchBox, text: project })
        await this.utility.click({ selector: this.projectOption(project) })
    }

    async searchProjectOnly(project: string): Promise<void> {
        await this.waitForProjectPopup()
        await this.utility.typeText({ selector: this.projectSearchBox, text: project })
    }

    async hasNoProjectResults(): Promise<boolean> {
        return await this.page.locator(this.noProjectResultsText).isVisible().catch(() => false)
    }

    async cancelAddProjectPopup(): Promise<void> {
        const isProjectListVisible = await this.page.locator(this.projectsPopup).isVisible()
        if (isProjectListVisible) {
            this.clickAddProject()
        }
    }

    async isProjectOptionVisible(project: string): Promise<boolean> {
        return await this.utility.checkIfElementExists({ selector: this.projectOption(project) })
    }

    async isProjectRowVisible(project: string): Promise<boolean> {
        return await this.page.locator(this.projectRowByName(project)).isVisible().catch(() => false)
    }

    async getProjectRowCount(): Promise<number> {
        return await this.page.locator(this.projectRows).count()
    }

    async searchAndSelectActivity(project: string, activity: string) {
        await this.utility.click({ selector: this.activityInput(project) })
        await this.utility.typeText({ selector: this.activityInput(project), text: activity })
        await this.utility.click({ selector: this.activityOption(activity) })
    }

    async clickAddActivity(project: string) {
        await this.utility.click({ selector: this.addActivityBtn(project) })
    }

    async selectActivityFromLatestRow(activity: string) {
        const inputs = this.page.locator("input[placeholder='Select Activity']")
        const latestInput = inputs.nth(await inputs.count() - 1)
        await latestInput.click()
        await latestInput.fill(activity)
        await this.utility.click({ selector: this.activityOption(activity) })
    }

    async isActivityChipVisible(project: string, activity: string): Promise<boolean> {
        return await this.page.locator(this.activityChip(project, activity)).isVisible().catch(() => false)
    }

    async removeActivityChip(project: string, activity: string): Promise<void> {
        const removeIcon = this.page.locator(this.activityChipRemoveIcon(project, activity))
        await removeIcon.waitFor({ state: 'visible', timeout: 5000 })
        await removeIcon.click()
    }

    async deleteProjectRow(project: string): Promise<void> {
        const deleteBtn = this.page.locator(this.projectThreeDotsBtn(project))
        await deleteBtn.waitFor({ state: 'visible', timeout: 5000 })
        await deleteBtn.click()
        await this.page.locator(this.projectDeleteOption).click()
    }

    async confirmDeleteProjectOrActivity(action: 'ok' | 'cancel' | 'delete'): Promise<void> {
        const dialog = this.page.locator(this.deleteConfirmationDialog)
        await dialog.waitFor({ state: 'visible', timeout: 5000 })

        if (action === 'ok') {
            await this.page.locator(this.okDeleteBtn).click()
        } else if (action === 'delete') {
            await this.page.locator(this.deleteBtn).click()
        } else {
            await this.page.locator(this.cancelDeleteBtn).click()
        }
    }

    // =========================================
    // METHODS — Hour Entry & Validation
    // =========================================

    async enterHoursForProject(project: string, ...hours: number[]) {
        const inputs = this.page.locator(this.projectHourInputs(project))
        const count = await inputs.count()
        for (let i = 0; i < hours.length && i < count; i++) {
            const input = inputs.nth(i)
            if (await input.isEnabled()) {
                await input.fill(String(hours[i]))
            }
        }
        await this.utility.click({ selector: this.totalHoursLabel })
    }

    /**
     * Fills a single day's hour input for a given project using a raw HH:MM string.
     * dayIndex is 1-based: 1=Mon ... 7=Sun
     */
    async enterHourValue(project: string, dayIndex: number, value: string): Promise<void> {
        const input = this.page.locator(this.projectDayHourInput(project, dayIndex))
        await input.waitFor({ state: 'visible', timeout: 10000 })
        await input.fill(value)
        await input.blur()
    }

    async getHourValue(project: string, dayIndex: number): Promise<string> {
        const input = this.page.locator(this.projectDayHourInput(project, dayIndex))
        return await input.inputValue()
    }

    async clearHourValue(project: string, dayIndex: number): Promise<void> {
        const input = this.page.locator(this.projectDayHourInput(project, dayIndex))
        await input.fill('')
        await input.blur()
    }

    async isHourInputEmpty(project: string, dayIndex: number): Promise<boolean> {
        return (await this.getHourValue(project, dayIndex)) === ''
    }

    // =========================================
    // METHODS — Total Hours
    // =========================================

    /** Converts an "H:MM" or "HH:MM" string into total minutes for arithmetic comparison. */
    private timeStringToMinutes(time: string): number {
        if (!time || time.trim() === '') return 0
        const [hoursPart, minutesPart] = time.split(':')
        const hours = parseInt(hoursPart, 10) || 0
        const minutes = parseInt(minutesPart, 10) || 0
        return hours * 60 + minutes
    }

    /** Converts total minutes back into "H:MM" display format, matching the app's own formatting. */
    private minutesToTimeString(totalMinutes: number): string {
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60
        return `${hours}:${minutes.toString().padStart(2, '0')}`
    }

    /**
     * Computes the expected total by summing a list of "H:MM" hour strings.
     * Useful for asserting Total Hours against values the test itself entered,
     * rather than hardcoding an expected total.
     */
    computeExpectedTotal(hourValues: string[]): string {
        const totalMinutes = hourValues.reduce((sum, val) => sum + this.timeStringToMinutes(val), 0)
        return this.minutesToTimeString(totalMinutes)
    }

    async getTotalHours() {
        const totalHours = await this.utility.getText({ selector: this.totalHoursLabel })
        return Array.isArray(totalHours) ? totalHours[0] : totalHours
    }

    async getTotalHoursValue(): Promise<string> {
        const totalLocator = this.page.locator(this.totalHoursLabel)
        await totalLocator.waitFor({ state: 'visible', timeout: 10000 })
        return (await totalLocator.textContent())?.trim() ?? ''
    }

    // =========================================
    // METHODS — Save / Reset
    // =========================================

    async clickSave() {
        await this.utility.click({ selector: this.saveBtn })
        await this.page.locator(this.successToastMessage).waitFor({ state: 'visible', timeout: 30000 })
        const successMsg = await this.utility.getText({ selector: this.successToastMessage })
        return Array.isArray(successMsg) ? successMsg[0] : successMsg
    }

    async clickReset() {
        const resetButton = this.page.locator(this.resetBtn)

        try {
            await resetButton.waitFor({ state: 'visible', timeout: 5000 })
        } catch {
            console.log('Reset button not visible — skipping reset')
            return null
        }

        await this.utility.click({ selector: this.resetBtn })
        await this.utility.click({ selector: this.confirmResetBtn })
        await this.page.locator(this.successToastMessage).waitFor({ state: 'visible', timeout: 30000 })
        const resetMsg = await this.utility.getText({ selector: this.successToastMessage })
        return Array.isArray(resetMsg) ? resetMsg[0] : resetMsg
    }

    async getSuccessToastMessage(): Promise<string> {
        await this.page.locator(this.successToastMessage).waitFor({ state: 'visible', timeout: 30000 })
        const successMsg = await this.utility.getText({ selector: this.successToastMessage })
        return Array.isArray(successMsg) ? successMsg[0] : successMsg
    }

    // =========================================
    // METHODS — Add Notes
    // =========================================

    async clickAddNotesButton(): Promise<void> {
        await this.page.waitForTimeout(1000) // small delay to ensure button is ready
        await this.utility.click({ selector: this.addNotesBtn })
    }

    async fillNotes(text: string): Promise<void> {
        const textarea = this.page.locator(this.notesTextarea)
        await textarea.waitFor({ state: 'visible', timeout: 10000 })
        await textarea.fill(text)
    }

    async getNotesValue(): Promise<string> {
        return await this.page.locator(this.notesTextarea).inputValue()
    }

    async getNotesCharCounter(): Promise<string> {
        return (await this.page.locator(this.notesCharCounter).textContent())?.trim() ?? ''
    }

    async clearAllNotes(): Promise<void> {
        await this.page.locator(this.clearAllNotesLink).click()
    }

    // =========================================
    // METHODS — Documents
    // =========================================

    async uploadDocument(filePath: string): Promise<void> {
        await this.page.locator(this.documentsFileInput).setInputFiles(filePath)
    }

    async isDocumentVisible(filename: string): Promise<boolean> {
        return await this.page.locator(this.uploadedDocumentByName(filename)).isVisible().catch(() => false)
    }

    async removeDocument(filename: string): Promise<void> {
        const removeIcon = this.page.locator(this.removeDocumentIcon(filename))
        await removeIcon.waitFor({ state: 'visible', timeout: 5000 })
        await removeIcon.click()
    }

    async isFileErrorDialogVisible(): Promise<boolean> {
        return await this.page.locator(this.fileErrorDialogTitle).isVisible().catch(() => false)
    }

    async getFileErrorReason(): Promise<string | null> {
        const reason = this.page.locator(this.fileErrorDialogReason)
        const isVisible = await reason.isVisible().catch(() => false)
        if (!isVisible) return null
        return (await reason.textContent())?.trim() ?? null
    }

    async dismissFileErrorDialog(): Promise<void> {
        const okBtn = this.page.locator(this.fileErrorDialogOkBtn)
        await okBtn.waitFor({ state: 'visible', timeout: 5000 })
        await okBtn.click()
    }

    /**
     * Convenience wrapper: opens the Add Project popup, searches/selects the given
     * project, and selects the given activity. Equivalent to the 4-step sequence
     * repeated across most tests in this suite.
     */
    async addProjectWithActivity(project: string, activity: string): Promise<void> {
        await this.clickAddProject()
        await this.waitForProjectPopup()
        await this.searchAndSelectProject(project)
        await this.searchAndSelectActivity(project, activity)
    }
}