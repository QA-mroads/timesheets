import { test as base } from '@playwright/test'

import { Utility } from '../helpers/Utility'
import { PannaLoginPage } from '../pages/PannaLoginPage'
import { PannaHomePage } from '../pages/PannaHomePage'
import { YopMailPage } from '../pages/YopMailPage'
import { TimesheetsPage } from '../pages/TimesheetsPage'
import { TimesheetsSettingsPage } from '../pages/TimesheetsSettingsPage'
import { OrgSetupPage } from '../pages/OrgsetupPage'
import { HolidaysPage } from '../pages/HolidaysPage'
import { ProjectsPage } from '../pages/ProjectsPage'

/**
 * Declare the Pages that you want to use in your test
 * */
type MyFixtures = {
    utility: Utility
    pannaLoginPage: PannaLoginPage
    pannaHomePage: PannaHomePage
    yopMailPage: YopMailPage
    timesheetsPage: TimesheetsPage
    timesheetsSettingsPage: TimesheetsSettingsPage
    orgSetup: OrgSetupPage
    holidaysPage: HolidaysPage
    projectsPage: ProjectsPage
}

/**
 * Create a custom fixture for above page that will be used in your test
 * */

export const test = base.extend<MyFixtures>({
    utility: async ({ page }, use) => {
        return await use(new Utility(page))
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
    },
    timesheetsSettingsPage: async ({ page }, use) => {
        return await use(new TimesheetsSettingsPage(page))
    },
    orgSetup: async ({ page }, use) => {
        return await use(new OrgSetupPage(page))
    },
    holidaysPage: async ({ page }, use) => {
        return await use(new HolidaysPage(page))
    },
    projectsPage: async ({ page }, use) => {
        return await use(new ProjectsPage(page))
    }
})
export { expect } from '@playwright/test'
