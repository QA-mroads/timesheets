import { expect, test } from '../../main/typescript/base/customFixtures'

test.beforeEach(async ({ pannaHomePage, timesheetsPage, applyLeavesPage, leaveHistoryPage }) => {
    await pannaHomePage.page.goto(`${process.env.BASE_URL}/dashboard`)
    await pannaHomePage.clickDashboardLink()
    await pannaHomePage.clickTimesheetsTab()
    await timesheetsPage.goToLeavesTab()
    await applyLeavesPage.goToLeaveHistoryTab()
    await leaveHistoryPage.isTableVisible()
})

// =========================================
// PAGE-LEVEL TESTS
// =========================================

test('Leave History Page URL Test', async ({ leaveHistoryPage }) => {
    expect(await leaveHistoryPage.getPageUrl()).toContain('/leaves/leaves-history')
})

test('Leave History Table Headers Test', async ({ leaveHistoryPage }) => {
    const headers = await leaveHistoryPage.getTableHeaders()
    // ✅ Confirmed from DOM — first th is empty (expand column), filtered out
    expect(headers).toEqual(['S.No', 'Time Period', 'Days', 'Leave Type', 'Status'])
})

test('Leave History Table Has Records Test', async ({ leaveHistoryPage }) => {
    // ✅ Confirmed from DOM — 4 rows visible (rows 1–4)
    expect(await leaveHistoryPage.getRowCount()).toBeGreaterThan(0)
})

// =========================================
// DEFAULT FILTER VALUES TESTS
// =========================================

test('Default Leave Type Filters Test', async ({ leaveHistoryPage }) => {
    const currentYear = new Date().getFullYear().toString()
    const filters = {
        leaveType: await leaveHistoryPage.getLeaveTypeFilterValue(),
        status: await leaveHistoryPage.getStatusFilterValue(),
        year: await leaveHistoryPage.getYearFilterValue(),
    }
    expect(filters).toEqual({ leaveType: 'All', status: 'ALL', year: currentYear })
})

// =========================================
// FILTER TESTS
// =========================================

test('Filter By Leave Type Shows Matching Records Test', async ({ leaveHistoryPage }) => {
    await leaveHistoryPage.filterByLeaveType('Paid Leave')
    const leaveTypes = await leaveHistoryPage.getAllLeaveTypes()
    // ✅ Every row should contain 'Paid Leave' after filtering
    expect(leaveTypes.every(t => t.includes('Paid Leave'))).toBeTruthy()
})

test('Filter By Status Rejected Shows Matching Records Test', async ({ leaveHistoryPage }) => {
    await leaveHistoryPage.filterByStatus('Rejected')
    const statuses = await leaveHistoryPage.getAllStatuses()
    // ✅ Confirmed from DOM: "Rejected" status exists in seeded data
    expect(statuses.every(s => s === 'Rejected')).toBeTruthy()
})

test('Filter By Status Pending Approval Shows Matching Records Test', async ({ leaveHistoryPage }) => {
    await leaveHistoryPage.filterByStatus('Pending Approval')
    const statuses = await leaveHistoryPage.getAllStatuses()
    // ✅ Confirmed from DOM: "Pending Approval" status exists in seeded data
    expect(statuses.every(s => s === 'Pending Approval')).toBeTruthy()
})

test('Remove Filters Restores All Records Test', async ({ leaveHistoryPage }) => {
    const totalBefore = await leaveHistoryPage.getRowCount()
    await leaveHistoryPage.filterByStatus('Rejected')
    await leaveHistoryPage.removeFilters()
    const totalAfter = await leaveHistoryPage.getRowCount()
    expect(totalAfter).toBe(totalBefore)
})

// =========================================
// PAGINATION TESTS
// =========================================

test('Pagination Shows Single Page When Records Fit Test', async ({ leaveHistoryPage }) => {
    // ✅ Confirmed from DOM: page "1/1" with both arrows having opacity-50 (disabled)
    expect(await leaveHistoryPage.isPrevPageDisabled()).toBeTruthy()
    expect(await leaveHistoryPage.isNextPageDisabled()).toBeTruthy()
})