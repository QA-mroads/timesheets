import { BasePage } from "../base/BasePage";

export class LoginPage extends BasePage {

    private readonly emailInput: string = "//input[@type='email']";
    private readonly pswrdInput: string = "//input[@type='password']";
    private readonly loginBtn: string = "//button[@type='submit']";

    async performLogin(email: string, password: string) {
        await this.utility.typeText({ selector: this.emailInput, text: email });
        await this.utility.typeText({ selector: this.pswrdInput, text: password });
        await this.utility.click({ selector: this.loginBtn });

    }

}