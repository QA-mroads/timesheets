import { BasePage } from "../base/BasePage";


export class AdminHomePage extends BasePage {

    private readonly recentOrdersHeader: string = "//h3[text()='Recent Orders']";
    private readonly clearDataBtn: string = "//button[@data-testid='clear-data-button']";

    async isRecentOrdersHeaderVisible() {
        return await this.utility.checkIfElementExists({ selector: this.recentOrdersHeader });
    }

    async clickClearDataBtn() {
        await this.utility.click({ selector: this.clearDataBtn });
    }

}