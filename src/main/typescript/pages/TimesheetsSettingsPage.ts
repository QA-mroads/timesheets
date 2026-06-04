import { expect } from '@playwright/test'
import { BasePage } from '../base/BasePage'

export class TimesheetsSettingsPage extends BasePage {

    // =========================================
    // LOCATORS
    // =========================================

    private readonly orgSetupTab = "//a[@data-testid='org-setup']"
    private readonly table = 'table.w-full'
    private readonly tableHeaders = 'table.w-full th'
    private readonly tableRows = 'table.w-full tbody tr'
    private readonly clientDD = "//label[text()='Client']/parent::div//div[@role='button']"
    private readonly projectDD = "//label[text()='Project']/parent::div//div[@role='button']"
    private readonly managerDD = "//label[text()='Manager']/parent::div//div[@role='button']"
    private readonly clientDefault = "//input[@placeholder='Client']"
    private readonly projectDefault = "//input[@placeholder='Project']"
    private readonly managerDefault = "//input[@placeholder='Manager']"
    private readonly removeFiltersBtn = "//button[text()='Remove filters']"
    private readonly successToastMessage = "//div[@role='status']"

    // =========================================
    // DYNAMIC LOCATORS
    // =========================================

    private filterOption = (value: string) => `//ul[@role='listbox']/li[text()='${value}']`

    // =========================================
    // METHODS
    // =========================================

    async waitForSettingsPage() {
        await this.page.waitForURL('**/settings**',{ timeout: 30000 })
        await this.page.locator(this.table).waitFor({ state: 'visible', timeout: 30000  })
    }

    async getSettingsPageTitle() {
        return await this.page.title()
    }

    async getSettingsPageUrl() {
        return this.page.url()
    }

    async isTableExists() {
        return await this.page.locator(this.table).isVisible()
    }

    async getTableHeaders() {
        const headers =  await this.page.locator(this.tableHeaders).allTextContents()
        return headers.map(text => text.trim()).filter(text => text !== '')
    }

    async getDefaultFiltersValue() {
        const client = await this.page.locator(this.clientDefault).inputValue()
        const project = await this.page.locator(this.projectDefault).inputValue()
        const manager = await this.page.locator(this.managerDefault).inputValue()
        return [client, project, manager]
    }

    async filterByClient(clientName: string) {
        await this.utility.click({selector: this.clientDD})
        await this.utility.click({selector: this.filterOption(clientName)})
        await this.page.waitForLoadState('networkidle')
        await this.page.waitForTimeout(2000)
        const rows = this.page.locator(this.tableRows)
        const count = await rows.count()
        for (let i = 0; i < count; i++) {
            const cellText = await rows.nth(i).locator('td').nth(2).textContent()
            if (cellText?.includes(clientName)) {
                return true
            }
        }
        return false
    }

    async filterByProject(projectName: string) {
        await this.utility.click({selector: this.projectDD})
        await this.utility.click({selector: this.filterOption(projectName)})
        await this.page.waitForLoadState('networkidle')
        await this.page.waitForTimeout(2000)
        const rows = this.page.locator(this.tableRows)
        const count = await rows.count()
        for (let i = 0; i < count; i++) {
            const cellText = await rows.nth(i).locator('td').nth(4).textContent()
            if (cellText?.includes(projectName)) {
                return true
            }
        }
        return false
    }

    async filterByManager(managerName: string) {
        await this.utility.click({selector: this.managerDD})
        await this.utility.click({selector: this.filterOption(managerName)})
        await this.page.waitForLoadState('networkidle')
        await this.page.waitForTimeout(2000)
        const rows = this.page.locator(this.tableRows)
        const count = await rows.count()
        for (let i = 0; i < count; i++) {
            const cellText = await rows.nth(i).locator('td').nth(3).textContent()
            if (cellText?.includes(managerName)) {
                return true
            }
        }
        return false
    }

    async clearFilters() {
        await this.utility.click({selector: this.removeFiltersBtn})
    }

    async goToOrgSetup() {
        await this.utility.click({selector: this.orgSetupTab})
        await this.page.waitForURL('**/settings/organization/leaves-configuration**', { timeout: 30000 })
    }
}