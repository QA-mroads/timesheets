import { BasePage } from "../base/BasePage";

export class PannaLoginPage extends BasePage{
    private readonly emailInput: string = "//input[@name='email']";
    private readonly proceedBtn: string = "//button[text()='Proceed']";
    private readonly mailCheckHeader: string = "//h2[text()='Check your email']";
    private readonly errorUserDoesNotExist: string = "//h2[text()='User does Not exist']";
    private readonly errorInvalidEmail: string = "//span[text()='Invalid email']";
    private readonly errorEmptyEmail: string = "//span[text()='Email is required']";
    private readonly loginWithGoogleBtn: string = "//span[text()='Continue with Google']//parent::button";


    async navigateToLoginPage() {
        await this.page.goto(this.ENV.BASE_URL);
    }

    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }

    async performLogin(email: string) {
        await this.utility.typeText({ selector: this.emailInput, text: email });
        await this.utility.click({ selector: this.proceedBtn });
    }

    async isMailCheckHeaderVisible(): Promise<string[]> {
        return await this.utility.getText({ selector: this.mailCheckHeader });
    }

    async isUserDoesNotExistErrorVisible(): Promise<string[]> {
        return await this.utility.getText({ selector: this.errorUserDoesNotExist });
    }

    async isInvalidEmailErrorVisible(): Promise<string[]> {
        return await this.utility.getText({ selector: this.errorInvalidEmail });
    }

    async isEmptyEmailErrorVisible(): Promise<string[]> {
        return await this.utility.getText({ selector: this.errorEmptyEmail });
    }

}
