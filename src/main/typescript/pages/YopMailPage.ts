import { BasePage } from '../base/BasePage'

export class YopMailPage extends BasePage {

    // Locators
    private readonly emailInput = "//input[@id='login']"
    private readonly proceedBtn = "//button[@title='Check Inbox @yopmail.com']"
    private readonly signInLink = "//span[text()='Sign In']"
    private readonly mailFrame = 'iframe#ifmail'

    /**
     * Login Through YopMail
     */
    async mailLogin(userName: string) {

    const yopmailPage =
        await this.page.context().newPage()

    await yopmailPage.goto('https://yopmail.com/')

    await yopmailPage.locator(this.emailInput)
        .fill(userName)

    await yopmailPage.waitForTimeout(7000)

    await yopmailPage.locator(this.proceedBtn)
        .click()

    const frame =
        yopmailPage.frameLocator('iframe#ifmail')

    const signInLink =
        frame.locator("//a[contains(.,'Sign In')]")

    await signInLink.waitFor({
        state: 'visible',
        timeout: 60000
    })

    // Capture NEW authenticated page
    const [dashboardPage] =
        await Promise.all([

            this.page.context().waitForEvent('page'),

            signInLink.click()
        ])

    await dashboardPage.waitForLoadState(
        'networkidle'
    )

    console.log(
        'Dashboard URL:',
        await dashboardPage.url()
    )

    return dashboardPage
}
    /**
     * Remove Advertisement Iframes
     */
    async removeAdIframe(page: any) {
        await page.evaluate(() => {
            document.querySelectorAll("iframe[id^='aswift_']").forEach(e => e.remove())
            document.querySelectorAll("iframe[title='Advertisement']").forEach(e => e.remove())
        })
    }
}