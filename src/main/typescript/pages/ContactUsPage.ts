import { BasePage } from '../base/BasePage'
import { step } from '../helpers/Decorators'

export class ContactUsPage extends BasePage {
    private readonly nameInput: string = '//div[@placeholder="Enter your name"]'
    private readonly emailInput: string = '//div[@placeholder="Enter your email address"]'
    private readonly messageInput: string = '//div[@placeholder="Tell us about your project or inquiry"]'
    private readonly submitButton: string = '//button[@type="submit"]'
    private readonly emailFormatErrorMessage: string = '//label[@for="email"]//following-sibling::p'

    @step()
    async fillContactUsForm(args: { name: string; email: string; message: string }) {
        await this.utility.typeText({ selector: this.nameInput, text: args.name })
        await this.utility.typeText({ selector: this.emailInput, text: args.email })
        await this.utility.typeText({ selector: this.messageInput, text: args.message })
        await this.utility.click({ selector: this.submitButton })
    }

    @step()
    async getEmailFormatErrorMessage() {
        return await this.utility.getInnerText({ selector: this.emailFormatErrorMessage })
    }
}
