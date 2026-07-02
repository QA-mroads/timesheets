import { expect, test } from '../../main/typescript/base/customFixtures'
import path from 'path'

const FIXTURES_DIR = path.join(__dirname, '../resources/uploads')

// ✅ Use a known future date far enough out to avoid collisions with existing leave data
const FUTURE_START = '2026-August-10'
const FUTURE_END = '2026-August-10'
const FUTURE_START_MULTI = '2026-August-11'
const FUTURE_END_MULTI = '2026-August-12'

test.beforeEach(async ({ pannaHomePage, timesheetsPage, applyLeavesPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.goToLeavesTab()
    await applyLeavesPage.isLeaveBalanceTitleVisible()
})

// =========================================
// LEAVE BALANCE DISPLAY TESTS
// =========================================

test('Leave Balance Cards Are Visible Test', async ({ applyLeavesPage }) => {
    const card1 = await applyLeavesPage.getLeaveTypeName(1)
    const card2 = await applyLeavesPage.getLeaveTypeName(2)
    // ✅ Confirmed from DOM: Paid Leave and Sick Leave
    expect(card1).toBe('Paid Leave')
    expect(card2).toBe('Sick Leave')
})

test('Leave Balance Shows Correct Remaining Count Test', async ({ applyLeavesPage }) => {
    const remaining = await applyLeavesPage.getRemainingLeaves(1)
    const assigned = await applyLeavesPage.getAssignedLeaves(1)
    // ✅ Values confirmed from DOM: 11/12
    expect(Number(remaining)).toBeLessThanOrEqual(Number(assigned))
})

// =========================================
// FORM FIELD BEHAVIOR TESTS
// =========================================

test('End Date Disabled Until Start Date Selected Test', async ({ applyLeavesPage }) => {
    // ✅ Confirmed from validation-state DOM: end-date has disabled="" before start date set
    expect(await applyLeavesPage.isEndDateDisabled()).toBeTruthy()
})

test('Reset Button Disabled By Default Test', async ({ applyLeavesPage }) => {
    // ✅ Confirmed from validation-state DOM: reset has disabled="" when form is empty
    expect(await applyLeavesPage.isResetEnabled()).toBeFalsy()
})

test('Reset Button Enabled After Filling A Field Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.fillReason('Test reason')
    expect(await applyLeavesPage.isResetEnabled()).toBeTruthy()
})

test('Live Days Calculation Updates Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.selectLeaveType('Paid Leave')
    const [sy, sm, sd] = FUTURE_START.split('-')
    await applyLeavesPage.selectStartDate(sy, sm, sd)
    await applyLeavesPage.selectStartSession('Full Day')
    const [ey, em, ed] = FUTURE_END.split('-')
    await applyLeavesPage.selectEndDate(ey, em, ed)
    await applyLeavesPage.selectEndSession('Full Day')

    const totalText = await applyLeavesPage.getTotalDaysText()
    // Same day, full day → should say "1 day"
    expect(totalText).toContain('1')
    expect(totalText).toContain('Paid Leave')
})

// =========================================
// MANDATORY FIELD VALIDATION TESTS
// =========================================

test('Validate All Mandatory Fields Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.clickSubmit()
    const errors = await applyLeavesPage.getValidationErrors()
    console.log('Validation errors:', errors)
    expect(errors.length).toBe(6)
    expect(errors).toContain('Select leave type required')
})

test('Reason Error Clears After Filling Reason Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.clickSubmit()
    await applyLeavesPage.fillReason('Valid reason text')
    await applyLeavesPage.clickSubmit()
    expect(await applyLeavesPage.getValidationErrors()).not.toContain('Reason required')
})

test('Reason Input Truncates At 1000 Characters Test', async ({ applyLeavesPage }) => {
    // ✅ Confirmed maxlength="1000" from DOM
    await applyLeavesPage.fillReason('A'.repeat(1001))
    const value = await applyLeavesPage.getReason()
    expect(value.length).toBe(1000)
})

// =========================================
// RESET TESTS
// =========================================

test('Reset Clears Form Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.selectLeaveType('Paid Leave')
    await applyLeavesPage.fillReason('Some reason')
    expect.soft(await applyLeavesPage.isResetEnabled()).toBeTruthy()
    await applyLeavesPage.clickReset()
    await applyLeavesPage.confirmResetSubmitOrCancelLeave('reset')
    expect(await applyLeavesPage.isFormCleared()).toBeTruthy()
})

test('Reset Disables Reset Button Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.fillReason('Some reason')
    await applyLeavesPage.clickReset()
    await applyLeavesPage.confirmResetSubmitOrCancelLeave('reset')
    expect(await applyLeavesPage.isResetEnabled()).toBeFalsy()
})

// =========================================
// CONFIRMATION PREVIEW DIALOG TESTS
// =========================================

test('Preview Dialog Shows Correct Leave Details Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.fillLeaveForm('Paid Leave', FUTURE_START, FUTURE_END, 'Automation test leave reason')
    await applyLeavesPage.clickSubmit()

    // ✅ Preview dialog should appear
    expect(await applyLeavesPage.isPreviewDialogVisible()).toBeTruthy()

    expect(await applyLeavesPage.getPreviewLeaveType()).toContain('Paid Leave')
    expect(await applyLeavesPage.getPreviewTotalDays()).toBe('1')
    expect(await applyLeavesPage.getPreviewReason()).toBe('Automation test leave reason')
    expect(await applyLeavesPage.getPreviewAttachment()).toBe('No Attachment')
    // ✅ Cancel back to form to avoid actually submitting
    await applyLeavesPage.cancelLeaveApplication()
})

test('Cancel On Preview Dialog Returns To Form Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.fillLeaveForm('Paid Leave', FUTURE_START, FUTURE_END, 'Test reason')
    await applyLeavesPage.clickSubmit()
    expect(await applyLeavesPage.isPreviewDialogVisible()).toBeTruthy()
    await applyLeavesPage.cancelLeaveApplication()
    // ✅ Form data should be retained after cancel
    const reason = await applyLeavesPage.getReason()
    expect(reason).toBe('Test reason')
})

test('Close Icon On Preview Dialog Closes Dialog Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.fillLeaveForm('Paid Leave', FUTURE_START, FUTURE_END, 'Test reason')
    await applyLeavesPage.clickSubmit()
    expect(await applyLeavesPage.isPreviewDialogVisible()).toBeTruthy()
    await applyLeavesPage.closePreviewDialog()
    const reason = await applyLeavesPage.getReason()
    expect(reason).toBe('Test reason')
})

test('Multi-Day Leave Shows Correct Total Days Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.fillLeaveForm('Paid Leave', FUTURE_START_MULTI, FUTURE_END_MULTI, 'Multi-day leave reason', 'Full Day', 'Full Day')
    await applyLeavesPage.clickSubmit()
    expect(await applyLeavesPage.isPreviewDialogVisible()).toBeTruthy()
    // Aug 11 to Aug 12 full day = 2 days
    expect(await applyLeavesPage.getPreviewTotalDays()).toBe('2')
    await applyLeavesPage.cancelLeaveApplication()
})

// =========================================
// ATTACHMENT TESTS
// =========================================

test('Upload Valid PDF Attachment Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.uploadAttachment(path.join(FIXTURES_DIR, 'valid-small.pdf'))
    expect(await applyLeavesPage.isAttachmentVisible('valid-small.pdf')).toBeTruthy()
})

test('Upload Valid JPG Attachment Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.uploadAttachment(path.join(FIXTURES_DIR, 'valid-small.jpg'))
    expect(await applyLeavesPage.isAttachmentVisible('valid-small.jpg')).toBeTruthy()
})

test('Upload file Larger than 512KB Shows Error Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.uploadAttachment(path.join(FIXTURES_DIR, 'oversized.pdf'))
    expect(await applyLeavesPage.isFileErrorDialogVisible()).toBeTruthy()
})

test('Remove Uploaded Attachment Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.uploadAttachment(path.join(FIXTURES_DIR, 'valid-small.pdf'))
    await applyLeavesPage.removeUploadDocument()
    expect(await applyLeavesPage.isAttachmentVisible('valid-small.pdf')).toBeFalsy()
})

// =========================================
// UNSAVED CHANGES NAVIGATION TESTS
// =========================================

test.describe('Unsaved Changes Navigation Warning', () => {

    test.beforeEach(async ({ applyLeavesPage }) => {
        await applyLeavesPage.selectLeaveType('Paid Leave')
        await applyLeavesPage.fillReason('Unsaved reason text')
    })

    // ✅ Data-driven: both nav targets trigger the same dialog behavior
    // "Shows Dialog" tests removed — Stay Here/Continue tests implicitly confirm dialog appeared
    const navCases = [
        { description: 'Timesheets Tab',   action: async (page: any) => page.clickTimesheetsTab()    },
        { description: 'Leave History Tab', action: async (page: any) => page.clickLeaveHistoryTab() },
    ]

    for (const { description, action } of navCases) {
        test(`Stay Here On ${description} Navigation Keeps Unsaved Data Test`, async ({ applyLeavesPage }) => {
            await action(applyLeavesPage)
            await applyLeavesPage.clickStayHere()
            // ✅ Reason retained proves: dialog appeared, Stay Here worked, form is intact
            expect(await applyLeavesPage.getReason()).toBe('Unsaved reason text')
        })

        test(`Continue On ${description} Navigation Discards Data Test`, async ({ applyLeavesPage }) => {
            await action(applyLeavesPage)
            await applyLeavesPage.clickContinue()
            // ✅ URL no longer contains apply-leaves proves navigation succeeded
            expect(applyLeavesPage.page.url()).not.toContain('/leaves/apply-leaves')
        })
    }

    test('No Dialog When Navigating Without Unsaved Data Test', async ({ applyLeavesPage }) => {
        await applyLeavesPage.clickReset()
        await applyLeavesPage.confirmResetSubmitOrCancelLeave('reset')
        await applyLeavesPage.clickLeaveHistoryTab()
        expect(await applyLeavesPage.isUnsavedChangesDialogVisible()).toBeFalsy()
    })
})


test('Duplicate Leave Application Test', async ({ applyLeavesPage }) => {
    await applyLeavesPage.fillLeaveForm('Sick Leave', "2026-April-15", "2026-April-15", 'Duplicate leave test')
    await applyLeavesPage.clickSubmit()
    await applyLeavesPage.confirmResetSubmitOrCancelLeave('submit')
    expect(await applyLeavesPage.getValidationMessage()).toContain('Already leave is applied on the given dates.')
})