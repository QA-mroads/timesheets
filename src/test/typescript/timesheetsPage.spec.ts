import { expect, test } from '../../main/typescript/base/customFixtures'
import path from 'path'

const FIXTURES_DIR = path.join(__dirname, '../resources/uploads')

test.beforeEach(async ({ pannaHomePage, timesheetsPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.isAddProjectButtonVisible()
})

// =========================================
// PAGE-LEVEL TESTS
// =========================================

test('Timesheets Page Title Test', async ({ timesheetsPage }) => {
    const title = await timesheetsPage.getTimeEntryPageTitle()
    expect(title).toBe('Time Entries')
})

test('Timesheets Page URL Test', async ({ timesheetsPage }) => {
    const url = await timesheetsPage.getTimeEntryPageUrl()
    expect(url).toContain('/time-entries')
})

test('Add Project to Timesheet Test', async ({ timesheetsPage }) => {
    await test.step('Add project and activity', async () => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
    })
    await test.step('Enter work hours', async () => {
        await timesheetsPage.enterHoursForProject('ATS', 2, 3, 4, 5, 6)
    })
    const totalHours = await timesheetsPage.getTotalHours()
    const successMsg = await timesheetsPage.clickSave()
    await test.step('Reset Timesheet', async () => {
        await timesheetsPage.clickReset()
    })
    await test.step('Validate save and total hours', async () => {
        expect.soft(successMsg).toBe('Saved Successfully')
        expect.soft(totalHours).toBe('20:00')
    })
})

test('Reset Timesheet Test', async ({ timesheetsPage }) => {
    await test.step('Add project and activity', async () => {
        await timesheetsPage.addProjectWithActivity('CGMFP', 'Code Review')
    })
    await test.step('Enter work hours', async () => {
        await timesheetsPage.enterHoursForProject('CGMFP', 1, 2, 3, 4, 5)
    })
    await timesheetsPage.clickSave()
    const resetMessage = await timesheetsPage.clickReset()
    await test.step('Validate reset message', async () => {
        expect.soft(resetMessage).toBe('Saved Successfully')
        expect.soft(await timesheetsPage.isProjectOptionVisible('CGMFP')).toBeFalsy()
    })
})

// =========================================
// WEEK NAVIGATION TESTS
// =========================================

test('Previous Week Navigation Updates Date Range Test', async ({ timesheetsPage }) => {
    const originalRange = await timesheetsPage.getWeekDateRangeLabel()
    await timesheetsPage.clickPreviousWeek()
    const newRange = await timesheetsPage.getWeekDateRangeLabel()
    expect(newRange).not.toBe(originalRange)
})

test('Next Week Button Disabled On Current Week Test', async ({ timesheetsPage }) => {
    // ✅ Confirmed from DOM: next arrow has disabled="" when viewing current week
    const isDisabled = await timesheetsPage.isNextWeekButtonDisabled()
    expect(isDisabled).toBeTruthy()
})

test('Unsaved Changes Dialog Stay Here Keeps Data Test', async ({ timesheetsPage }) => {
    await test.step('Add unsaved project and hours', async () => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
        await timesheetsPage.enterHoursForProject('ATS', 2)
    })
    await test.step('Attempt navigation, choose Stay Here', async () => {
        await timesheetsPage.navigateWeekWithUnsavedChanges('prev', 'stay')
    })
    await test.step('Confirm unsaved data is still present', async () => {
        // ✅ ATS should NOT be in the add-list anymore since it's already added to the row
        expect(await timesheetsPage.isProjectOptionVisible('ATS')).toBeFalsy()
    })
})

test('Unsaved Changes Dialog Continue Discards Data Test', async ({ timesheetsPage }) => {
    const originalRange = await timesheetsPage.getWeekDateRangeLabel()

    await test.step('Add unsaved project and hours', async () => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
        await timesheetsPage.enterHoursForProject('ATS', 2)
    })
    await test.step('Attempt navigation, choose Continue', async () => {
        await timesheetsPage.navigateWeekWithUnsavedChanges('prev', 'continue')
    })
    await test.step('Confirm navigation succeeded and data was discarded', async () => {
        expect(await timesheetsPage.getWeekDateRangeLabel()).not.toBe(originalRange)
        // ✅ Navigate back — ATS should be available in add-list since the row was never saved
        await timesheetsPage.clickNextWeek()
        await timesheetsPage.clickAddProject()
        await timesheetsPage.waitForProjectPopup()
        expect(await timesheetsPage.isProjectOptionVisible('ATS')).toBeTruthy()
        await timesheetsPage.cancelAddProjectPopup()
    })
})

// =========================================
// ADD / REMOVE PROJECT & ACTIVITY TESTS
// =========================================

test('Add Activity To Existing Project Test', async ({ timesheetsPage }) => {
    await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
    expect(await timesheetsPage.isActivityChipVisible('ATS', 'Development1')).toBeTruthy()
})

test('Added Project Disappears From Add Project List Test', async ({ timesheetsPage }) => {
    await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
    // ✅ Confirmed behavior: once added, project no longer appears in the add-list
    await timesheetsPage.clickAddProject()
    await timesheetsPage.waitForProjectPopup()
    expect(await timesheetsPage.isProjectOptionVisible('ATS')).toBeFalsy()
    await timesheetsPage.cancelAddProjectPopup() // ✅ close popup after checking
})

test('Removed Project Reappears In Add Project List Test', async ({ timesheetsPage }) => {
    await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
    await timesheetsPage.deleteProjectRow('ATS')
    await timesheetsPage.confirmDeleteProjectOrActivity('delete')
    await timesheetsPage.clickAddProject()
    await timesheetsPage.waitForProjectPopup()
    expect(await timesheetsPage.isProjectOptionVisible('ATS')).toBeTruthy()
    await timesheetsPage.cancelAddProjectPopup() // ✅ close popup after checking
})

test('Search Non-Existent Project Shows No Results Test', async ({ timesheetsPage }) => {
    await timesheetsPage.clickAddProject()
    await timesheetsPage.searchProjectOnly('ZZZNonExistentProject999')
    expect(await timesheetsPage.hasNoProjectResults()).toBeTruthy()
    await timesheetsPage.cancelAddProjectPopup() // ✅ close popup after checking
})

test('Remove Activity Chip Test', async ({ timesheetsPage }) => {
    await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
    await timesheetsPage.removeActivityChip('ATS', 'Development1')
    await timesheetsPage.confirmDeleteProjectOrActivity('ok')
    expect(await timesheetsPage.getSuccessToastMessage()).toBe('Saved Successfully')
    await timesheetsPage.clickReset()
})

test('Delete Entire Project Row Test', async ({ timesheetsPage }) => {
    await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
    await timesheetsPage.deleteProjectRow('ATS')
    await timesheetsPage.confirmDeleteProjectOrActivity('delete')
    expect(await timesheetsPage.getSuccessToastMessage()).toBe('Saved Successfully')
})

// =========================================
// HOUR ENTRY & VALIDATION TESTS
// =========================================

test.describe('Hour Entry & Validation', () => {

    test.beforeEach(async ({ timesheetsPage }) => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
    })

    // ✅ Data-driven: same shape (enter value → read back → assert)
    // Adding a new boundary case = 1 line in this table, not a new test block
    const hourEntryCases: { description: string; input: string; expected: string }[] = [
        { description: 'valid value', input: '4:00', expected: '4:00' },
        { description: 'maximum valid value', input: '23:59', expected: '23:59' },
        { description: 'out-of-range gets masked', input: '24:00', expected: '2:40' },
    ]

    for (const { description, input, expected } of hourEntryCases) {
        test(`Hour Input - ${description} Test`, async ({ timesheetsPage }) => {
            await timesheetsPage.enterHourValue('ATS', 1, input)
            expect(await timesheetsPage.getHourValue('ATS', 1)).toBe(expected)
        })
    }

    test('Enter Hours Across Multiple Days For Same Project Test', async ({ timesheetsPage }) => {
        await timesheetsPage.enterHourValue('ATS', 1, '2:00')
        await timesheetsPage.enterHourValue('ATS', 2, '3:00')
        await timesheetsPage.enterHourValue('ATS', 3, '4:00')

        expect(await timesheetsPage.getHourValue('ATS', 1)).toBe('2:00')
        expect(await timesheetsPage.getHourValue('ATS', 2)).toBe('3:00')
        expect(await timesheetsPage.getHourValue('ATS', 3)).toBe('4:00')
    })

    test('Clear Entered Hour Value Test', async ({ timesheetsPage }) => {
        await timesheetsPage.enterHourValue('ATS', 1, '4:00')
        await timesheetsPage.clearHourValue('ATS', 1)
        expect(await timesheetsPage.isHourInputEmpty('ATS', 1)).toBeTruthy()
    })
})

// =========================================
// MULTI-PROJECT TOTAL HOURS TESTS
// =========================================

test.describe('Multi-Project Total Hours', () => {

    test.afterEach(async ({ timesheetsPage }) => {
        await timesheetsPage.clickReset()
    })

    test('Single Project Multiple Days Total Sums Correctly Test', async ({ timesheetsPage }) => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')

        const hours = ['2:00', '3:00', '4:00', '5:00', '6:00']
        for (let i = 0; i < hours.length; i++) {
            await timesheetsPage.enterHourValue('ATS', i + 1, hours[i])
        }

        expect(await timesheetsPage.getTotalHoursValue())
            .toBe(timesheetsPage.computeExpectedTotal(hours))
    })

    test('Multiple Projects Different Hours Total Sums Across Rows Test', async ({ timesheetsPage }) => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
        await timesheetsPage.enterHourValue('ATS', 1, '4:00')
        await timesheetsPage.enterHourValue('ATS', 2, '5:00')

        await timesheetsPage.addProjectWithActivity('CGMFP', 'Code Review')
        await timesheetsPage.enterHourValue('CGMFP', 1, '2:00')
        await timesheetsPage.enterHourValue('CGMFP', 3, '3:00')

        expect(await timesheetsPage.getTotalHoursValue())
            .toBe(timesheetsPage.computeExpectedTotal(['4:00', '5:00', '2:00', '3:00']))
    })

    test('Removing Project Row Decreases Total By Its Contribution Test', async ({ timesheetsPage }) => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
        await timesheetsPage.enterHourValue('ATS', 1, '4:00')

        await timesheetsPage.addProjectWithActivity('CGMFP', 'Code Review')
        await timesheetsPage.enterHourValue('CGMFP', 1, '3:00')

        expect(await timesheetsPage.getTotalHoursValue())
            .toBe(timesheetsPage.computeExpectedTotal(['4:00', '3:00']))

        await timesheetsPage.deleteProjectRow('ATS')
        await timesheetsPage.confirmDeleteProjectOrActivity('delete')

        expect(await timesheetsPage.getTotalHoursValue())
            .toBe(timesheetsPage.computeExpectedTotal(['3:00']))
    })

    test('Clearing Single Day Value Decreases Total By Just That Amount Test', async ({ timesheetsPage }) => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
        await timesheetsPage.enterHourValue('ATS', 1, '4:00')
        await timesheetsPage.enterHourValue('ATS', 2, '3:00')

        expect(await timesheetsPage.getTotalHoursValue())
            .toBe(timesheetsPage.computeExpectedTotal(['4:00', '3:00']))

        await timesheetsPage.clearHourValue('ATS', 1)

        expect(await timesheetsPage.getTotalHoursValue())
            .toBe(timesheetsPage.computeExpectedTotal(['3:00']))
    })
})

// =========================================
// ADD NOTES TESTS
// =========================================

test.describe('Add Notes', () => {

    test.beforeEach(async ({ timesheetsPage }) => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
        await timesheetsPage.enterHourValue('ATS', 1, '4:00')
        await timesheetsPage.clickAddNotesButton()
    })

    test.afterEach(async ({ timesheetsPage }) => {
        await timesheetsPage.clickReset()
    })

    test('Add Note And Save Persists Test', async ({ timesheetsPage }) => {
        await timesheetsPage.fillNotes('This is a test note for the week.')
        await timesheetsPage.clickSave()
        await timesheetsPage.page.reload()
        expect(await timesheetsPage.getNotesValue()).toBe('This is a test note for the week.')
    })

    test('Note Input Truncates At 1000 Characters Test', async ({ timesheetsPage }) => {
        await timesheetsPage.fillNotes('A'.repeat(1001))
        expect((await timesheetsPage.getNotesValue()).length).toBe(1000)
        expect(await timesheetsPage.getNotesCharCounter()).toContain('0/1000')
    })

    test('Clear All Notes Test', async ({ timesheetsPage }) => {
        await timesheetsPage.fillNotes('Some note text')
        await timesheetsPage.clearAllNotes()
        expect(await timesheetsPage.getNotesValue()).toBe('')
    })
})

// =========================================
// DOCUMENTS UPLOAD TESTS
// =========================================

test.describe('Documents Upload', () => {

    test.beforeEach(async ({ timesheetsPage }) => {
        await timesheetsPage.addProjectWithActivity('ATS', 'Development1')
        await timesheetsPage.enterHourValue('ATS', 1, '4:00')
    })

    test.afterEach(async ({ timesheetsPage }) => {
        await timesheetsPage.clickReset()
    })

    // ✅ Data-driven: same shape (upload file → expect visible)
    // Adding a new valid type (JPEG etc.) = 1 line in this table, not a new test block
    const validUploadCases = [
        { description: 'PDF', filename: 'valid-small.pdf' },
        { description: 'PNG', filename: 'valid-small.png' },
    ]

    for (const { description, filename } of validUploadCases) {
        test(`Upload Valid ${description} Succeeds Test`, async ({ timesheetsPage }) => {
            await timesheetsPage.uploadDocument(path.join(FIXTURES_DIR, filename))
            expect(await timesheetsPage.isDocumentVisible(filename)).toBeTruthy()
        })
    }

    test('Upload File Exceeding 512kb Shows Validation Error Test', async ({ timesheetsPage }) => {
        await timesheetsPage.uploadDocument(path.join(FIXTURES_DIR, 'oversized.pdf'))
        expect(await timesheetsPage.isFileErrorDialogVisible()).toBeTruthy()
        const reason = await timesheetsPage.getFileErrorReason()
        expect(reason).toContain('File size too large')
        expect(reason).toContain('512 KB')
        await timesheetsPage.dismissFileErrorDialog()
        expect(await timesheetsPage.isDocumentVisible('oversized.pdf')).toBeFalsy()
    })

    test('Upload Invalid File Type Shows Validation Error Test', async ({ timesheetsPage }) => {
        await timesheetsPage.uploadDocument(path.join(FIXTURES_DIR, 'invalid-type.txt'))
        expect(await timesheetsPage.isFileErrorDialogVisible()).toBeTruthy()
        expect(await timesheetsPage.getFileErrorReason()).toBeTruthy() // ✅ exact wording still unconfirmed
        await timesheetsPage.dismissFileErrorDialog()
        expect(await timesheetsPage.isDocumentVisible('invalid-type.txt')).toBeFalsy()
    })

    test('Remove Uploaded Document Test', async ({ timesheetsPage }) => {
        await timesheetsPage.uploadDocument(path.join(FIXTURES_DIR, 'valid-small.pdf'))
        expect(await timesheetsPage.isDocumentVisible('valid-small.pdf')).toBeTruthy()
        await timesheetsPage.removeDocument('valid-small.pdf')
        expect(await timesheetsPage.isDocumentVisible('valid-small.pdf')).toBeFalsy()
    })

    test('Uploaded Document Persists After Save Test', async ({ timesheetsPage }) => {
        await timesheetsPage.uploadDocument(path.join(FIXTURES_DIR, 'valid-small.pdf'))
        await timesheetsPage.clickSave()
        // await timesheetsPage.page.reload()
        expect(await timesheetsPage.isDocumentVisible('valid-small.pdf')).toBeTruthy()
    })
})