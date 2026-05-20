import { test as base } from '@playwright/test'

import { Utility } from '../helpers/Utility'

import { HomePage } from '../pages/HomePage'
import { ContactUsPage } from '../pages/ContactUsPage'
import { AdminHomePage } from '../pages/AdminHomePage'
import { LandingPage } from '../pages/LandingPage'
import { LoginPage } from '../pages/LoginPage'
import { PannaLoginPage } from '../pages/PannaLoginPage'
import { PannaHomePage } from '../pages/PannaHomePage'
import { YopMailPage } from '../pages/YopMailPage'
import { TimesheetsPage } from '../pages/TimesheetsPage'

/**
 * Declare the Pages that you want to use in your test
 * */
type MyFixtures = {
    utility: Utility
    homePage: HomePage
    contactUsPage: ContactUsPage
    adminHomePage: AdminHomePage
    landingPage: LandingPage
    loginPage: LoginPage
    pannaLoginPage: PannaLoginPage
    pannaHomePage: PannaHomePage
    yopMailPage: YopMailPage
    timesheetsPage: TimesheetsPage
}

/**
 * Create a custom fixture for above page that will be used in your test
 * */

export const test = base.extend<MyFixtures>({
    utility: async ({ page }, use) => {
        return await use(new Utility(page))
    },
    homePage: async ({ page }, use) => {
        return await use(new HomePage(page))
    },
    contactUsPage: async ({ page }, use) => {
        return await use(new ContactUsPage(page))
    },
    adminHomePage: async ({ page }, use) => {
        return await use(new AdminHomePage(page))
    },
    landingPage: async ({ page }, use) => {
        return await use(new LandingPage(page))
    },
    loginPage: async ({ page }, use) => {
        return await use(new LoginPage(page))
    },
    pannaLoginPage: async ({ page }, use) => {
        return await use(new PannaLoginPage(page))
    },
    pannaHomePage: async ({ page }, use) => {
        return await use(new PannaHomePage(page))
    },
    yopMailPage: async ({ page }, use) => {
        return await use(new YopMailPage(page))
    },
    timesheetsPage: async ({ page }, use) => {
        return await use(new TimesheetsPage(page))
    }
})
export { expect } from '@playwright/test'
