import { BasePage } from "../base/BasePage";

export class PannaHomePage extends BasePage{

    private readonly dashboardLink: string = "//p[text()='Dashboard']//ancestor::div[@role='button']";
    private readonly timesheetsTab = "//h6[text()='Timesheets']/parent::div";
    private readonly homePageHeaders = "//div[@role='button']//p";
    private readonly usersBtn = "//p[text()='Users']/parent::div/parent::div";

     /**
     * Get Home Page Title
     */
    async getHomePageTitle(): Promise<string> {
        await this.page.waitForLoadState('networkidle')
        return await this.page.title()
    }

    /**
     * Get Home Page URL
     */
    async getHomePageUrl(): Promise<string> {
        await this.page.waitForLoadState('networkidle')
        return this.page.url()
    }

    /**
     * Verify Dashboard Link Exists
     */
    async isDashboardLinkVisible(): Promise<boolean> {
        return await this.utility.checkIfElementExists({selector: this.dashboardLink})
    }

    /**
     * Verify Timesheets Tab Exists
     */
    async isTimesheetsTabVisible(): Promise<boolean> {
        return await this.utility.checkIfElementExists({selector: this.timesheetsTab})
    }

    /**
     * Click Timesheets Tab
     */
    async clickTimesheetsTab() {
    await this.utility.click({ selector: this.timesheetsTab })
    await this.page.waitForURL('**/time-entries', { timeout: 30000 })       
    }

    /**
     * Click dashboard link     */
    async clickDashboardLink() {
        await this.utility.click({ selector: this.dashboardLink })
    }

}
