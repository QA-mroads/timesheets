import { BasePage } from "../base/BasePage";

export class LandingPage extends BasePage {

    private readonly loginToTestBtn: string = "//button[text()='Login']";

    async navigateToLandingPage() {
        await this.page.goto(this.ENV.BASE_URL);
    }

    async clickLoginToTestBtn() {
        await this.utility.click({ selector: this.loginToTestBtn });
    }


}