import { BasePage } from '../base/BasePage'
import { step } from '../helpers/Decorators'

export class HomePage extends BasePage {
    private readonly contactUsButton: string = '//button/span[text()="Contact Us"]'

    @step()
    async launchApp() {
        await this.page.goto(this.ENV.BASE_URL)
    }

    @step()
    async clickContactUsButton() {
        await this.utility.click({ selector: this.contactUsButton })
    }
}
