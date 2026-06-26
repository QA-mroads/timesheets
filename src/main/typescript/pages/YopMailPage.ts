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
        const yopmailPage = await this.page.context().newPage()
        await yopmailPage.goto('https://yopmail.com/')

        const before = Date.now()
        console.log('⏱️ Starting 15s wait at:', new Date(before).toISOString())

        await yopmailPage.waitForTimeout(15000)

        const after = Date.now()
        console.log('⏱️ Wait ended at:', new Date(after).toISOString())
        console.log('⏱️ Actual elapsed ms:', after - before)

        await yopmailPage.locator(this.emailInput).fill(userName)
        await yopmailPage.locator(this.proceedBtn).click()
        const frame = yopmailPage.frameLocator(this.mailFrame)
        const signInLink = frame.locator(this.signInLink)
        await signInLink.waitFor({ state: 'visible', timeout: 60000 })
        const [dashboardPage] = await Promise.all([this.page.context().waitForEvent('page'), signInLink.click()])
        await dashboardPage.waitForLoadState('networkidle')
        console.log('Dashboard URL:', await dashboardPage.url())
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