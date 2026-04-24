import { FullConfig } from '@playwright/test'
import dotenv from 'dotenv'
import rimraf from 'rimraf'

async function globalSetup(_config: FullConfig) {
    if (process.env.environmentToRun) {
        dotenv.config({
            path: `./src/main/resources/env/.env.${process.env.environmentToRun}`,
            override: false,
        })
    }

    await new Promise(resolve => {
        rimraf(`./allure-results`, resolve)
    })
}
export default globalSetup
