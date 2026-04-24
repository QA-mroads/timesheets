import { Page } from '@playwright/test'

import ENV from '../../resources/env/env'
import { Utility } from '../helpers/Utility'

export class BasePage {
    readonly page: Page
    readonly utility: Utility
    readonly ENV = ENV
    constructor(page: Page) {
        this.page = page
        this.utility = new Utility(page)
    }
}
