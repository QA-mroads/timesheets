import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: `./src/main/resources/env/.env.${process.env.environmentToRun || 'dev'}` });

// =========================================
// CONFIG
// =========================================

const LOGIN_EMAIL = process.env.LOGIN_EMAIL || 'gautham.orgauto5@yopmail.com';
const YOPMAIL_INBOX = LOGIN_EMAIL.split('@')[0]; // ✅ derived from email — avoids drift between the two hardcoded values

setup('Login and Save Session', async ({ page }) => {

    // ====================================
    // APP LOGIN — TRIGGER MAGIC LINK EMAIL
    // ====================================

    await page.goto(process.env.BASE_URL!);
    await page.locator('[name="email"]').fill(LOGIN_EMAIL);
    await page.locator('text=Proceed').click();

    // ====================================
    // YOPMAIL LOGIN FLOW
    // ====================================

    const yopmailPage = await page.context().newPage();
    await yopmailPage.goto('https://yopmail.com');

    // ✅ Remove ad iframes so they can't intercept clicks on inbox/email locators
    await yopmailPage.evaluate(() => {
        document.querySelectorAll("iframe[id^='aswift_']").forEach(e => e.remove());
        document.querySelectorAll("iframe[title='Advertisement']").forEach(e => e.remove());
    });

    // Enter inbox name and look it up
    await yopmailPage.locator('#login').fill(YOPMAIL_INBOX);
    await yopmailPage.waitForTimeout(10000); // ✅ hard wait — confirmed intentional, gives YopMail time to settle/load inbox
    await yopmailPage.keyboard.press('Enter');

    // Open latest mail in the inbox list
    const inboxFrame = yopmailPage.frameLocator('#ifinbox');
    await inboxFrame.locator('.m').first().click();

    // Click the sign-in/magic link inside the opened email — captures the new dashboard tab it opens
    const mailFrame = yopmailPage.frameLocator('#ifmail');
    const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        mailFrame.locator('a').first().click()
    ]);
    await newPage.waitForLoadState();

    // ====================================
    // VERIFY LOGIN SUCCESS
    // ====================================

    try {
        await expect(newPage).toHaveURL(/dashboard/, { timeout: 15000 }); // ✅ bumped from default 5s for resilience
    } catch (err) {
        console.error('Login failed — stuck on:', newPage.url());
        throw err;
    }

    // ====================================
    // SAVE SESSION
    // ====================================

    await newPage.context().storageState({ path: './src/auth/user.json' });
});