import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
    path: `./src/main/resources/env/.env.${process.env.environmentToRun || 'dev'}`
});

setup('Login and Save Session', async ({ page }) => {

    // Open application
    await page.goto(process.env.BASE_URL!);
    // Enter email
    await page.locator('[name="email"]').fill('gautham.orgauto5@yopmail.com');
    // Click proceed
    await page.locator('text=Proceed').click();

    // ====================================
    // YOPMAIL LOGIN FLOW
    // ====================================

    // Open new tab
    const yopmailPage = await page.context().newPage();
    await yopmailPage.goto('https://yopmail.com');
    // Enter inbox name
    await yopmailPage.locator('#login').fill('gautham.orgauto5');
    await yopmailPage.waitForTimeout(7000)
    await yopmailPage.keyboard.press('Enter');

    // Open latest mail
    const inboxFrame = yopmailPage.frameLocator('#ifinbox');
    await inboxFrame.locator('.m').first().click();

    // Click login link
    const mailFrame = yopmailPage.frameLocator('#ifmail');
    const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        mailFrame.locator('a')
            .first()
            .click()
    ]);
    await newPage.waitForLoadState();
    // Verify login success
    await expect(newPage).toHaveURL(/dashboard/);

    // ====================================
    // SAVE SESSION
    // ====================================

    await newPage.context().storageState({
        path: './src/auth/user.json'
    });
});