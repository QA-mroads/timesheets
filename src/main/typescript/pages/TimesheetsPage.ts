import { BasePage } from "../base/BasePage";

export class TimesheetsPage extends BasePage{

// =========================================
// LOCATORS
// =========================================

private readonly settingsTab = "//p[text()='Settings']/ancestor::div[@role='button']"
private readonly weekSelectedHeader = "//h6[text()='Week Selected']"
private readonly addProjectBtn = "//button[normalize-space()='Add Project']"
private readonly projectsPopup = '#projects-list'
private readonly projectSearchBox = "//div[@id='projects-list']//input[@placeholder='Search']"
private readonly projectOptions = "//div[@id='projects-list']//li[@role='option']"

private readonly totalHoursLabel = "//p[text()='Total Hours :']/following::p[1]"
private readonly saveBtn = "//button[text()='Save']"
private readonly resetBtn = "//button[text()='Reset']"
private readonly confirmResetBtn = "//h2//parent::div//button[text()='Reset']"
private readonly successToastMessage = "//div[@role='status' and text()='Saved Successfully']"

private readonly addActivityBtn = (project: string) => `(//h6[normalize-space()='${project}']/ancestor::div[@data-projection-id]//button)[2]`

private readonly activityInput = (project: string) => `//h6[text()='${project}']/ancestor::div[contains(@class,'MuiGrid-container')]//input[@placeholder='Select Activity']`

private readonly activityOption = (activity: string) => `//li[normalize-space()='${activity}']`
private projectRow = (project: string) => `//h6[normalize-space()='${project}']/ancestor::div[@data-projection-id]`

private projectHourInputs = (project: string) => `//h6[normalize-space()='${project}']/ancestor::div[@data-projection-id]//input[@type='text']`


// =========================================
// DYNAMIC LOCATORS
// =========================================

private projectOption(project: string) {
    return `//div[@id='projects-list']//h6[text()='${project}']`
}

// =========================================
// METHODS
// =========================================

async getTimeEntryPageTitle() {
        return await this.page.title()
}

async getTimeEntryPageUrl() {
        return this.page.url()
}

async isWeekSelectedHeaderVisible(): Promise<boolean> {
    return await this.utility.checkIfElementExists({selector: this.weekSelectedHeader})
}

async clickAddProject() {
    await this.utility.click({selector: this.addProjectBtn})
}

async waitForProjectPopup() {
    await this.page.locator(this.projectsPopup).waitFor()
}

async searchAndSelectProject(project: string) {
    await this.waitForProjectPopup()
    await this.utility.typeText({selector: this.projectSearchBox, text: project})
    await this.utility.click({selector: this.projectOption(project)})
}

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

async getTotalHours() {
    const totalHours = await this.utility.getText({ selector: this.totalHoursLabel })
    return Array.isArray(totalHours) ? totalHours[0] : totalHours
}

async clickSave() {
    await this.utility.click({ selector: this.saveBtn })
    await this.page.locator(this.successToastMessage).waitFor({state: 'visible', timeout: 30000})
    const successMsg = await this.utility.getText({selector: this.successToastMessage})
    return Array.isArray(successMsg) ? successMsg[0] : successMsg
}

async clickReset() {
    await this.utility.click({ selector: this.resetBtn })
    await this.utility.click({ selector: this.confirmResetBtn })
    await this.page.locator(this.successToastMessage).waitFor({state: 'visible',timeout: 30000 })
    const resetMsg = await this.utility.getText({ selector: this.successToastMessage })
    return Array.isArray(resetMsg) ? resetMsg[0] : resetMsg
}


async searchAndSelectActivity(project: string, activity: string) {
    await this.utility.click({ selector: this.activityInput(project)  })
    await this.utility.typeText({ selector: this.activityInput(project), text: activity})
    await this.utility.click({ selector: this.activityOption(activity)})
}

async clickAddActivity(project: string) {
    await this.utility.click({ selector: this.addActivityBtn(project)})
}

async selectActivityFromLatestRow(activity: string) {
    const inputs = this.page.locator( "input[placeholder='Select Activity']")
    const latestInput = inputs.nth(await inputs.count() - 1)
    await latestInput.click()
    await latestInput.fill(activity)
    await this.utility.click({selector: this.activityOption(activity)})
}

async isProjectOptionVisible(project: string): Promise<boolean> {
    return await this.utility.checkIfElementExists({selector: this.projectOption(project)}) 
}

async goToSettingsTab() {
    await this.utility.click({ selector: this.settingsTab })
    await this.page.waitForURL('**/settings/timesheet-configuration', { timeout: 30000 })
}

}