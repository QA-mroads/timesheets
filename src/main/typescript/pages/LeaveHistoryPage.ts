import { Page } from '@playwright/test'
import { BasePage } from '../base/BasePage'

export class LeaveHistoryPage extends BasePage {

    // =========================================
    // LOCATORS — Filters
    // =========================================

    private readonly dateFilterBtn = "[data-testid='leaves-history/date']"
    private readonly leaveTypeFilter = "[data-testid='leaves-history/leave-type']"

    // ✅ Status and Year share the same testid — differentiate by hidden input placeholder
    private readonly statusFilter = "[data-testid='leaves-history/status'] input[placeholder='Status']"
    private readonly yearFilter = "[data-testid='leaves-history/status'] input[placeholder='Year']"

    // Clickable wrappers (the visible MUI Select buttons, not the hidden inputs)
    private readonly statusFilterBtn = "[data-testid='leaves-history/status']:has(input[placeholder='Status']) .MuiSelect-select"
    private readonly yearFilterBtn = "[data-testid='leaves-history/status']:has(input[placeholder='Year']) .MuiSelect-select"

    private readonly removeFiltersBtn = "[data-testid='remove-filters']"

    // =========================================
    // LOCATORS — Table
    // =========================================

    private readonly table = "[data-testid='leaves-history-table']"
    private readonly tableHeaders = "[data-testid='leaves-history-table'] thead th"
    private readonly tableRows = "[data-testid='leaves-history-table'] tbody tr"

    // Column indices (0-based within each row's td list)
    // [0]=expand [1]=S.No [2]=Time Period [3]=Days [4]=Leave Type [5]=Status
    private readonly colSNo = 1
    private readonly colTimePeriod = 2
    private readonly colDays = 3
    private readonly colLeaveType = 4
    private readonly colStatus = 5

    // =========================================
    // LOCATORS — Pagination (same pattern as other pages)
    // =========================================

    private readonly paginationNext = "[data-testid='pagination-next']"
    private readonly paginationPrev = "[data-testid='pagination-prev']"

    // =========================================
    // LOCATORS — MUI Select option
    // =========================================

    private readonly selectOption = (value: string) => `//ul[@role='listbox']/li[text()='${value}']`
    private readonly selectStatusOption = (value: string) => `//ul[@role='listbox']//p[text()='${value}']`

    constructor(page: Page) {
        super(page)
    }

    // =========================================
    // METHODS — Navigation
    // =========================================

    async isTableVisible(): Promise<void> {
        await this.page.locator(this.table).waitFor({ state: 'visible', timeout: 30000 })
        await this.page.locator(this.tableRows).first().waitFor({ state: 'visible', timeout: 30000 })
    }

    async getPageUrl(): Promise<string> {
        return this.page.url()
    }

    // =========================================
    // METHODS — Table headers
    // =========================================

    async getTableHeaders(): Promise<string[]> {
        await this.page.locator(this.tableHeaders).first().waitFor({ state: 'visible', timeout: 10000 })
        const headers = await this.page.locator(this.tableHeaders).allTextContents()
        return headers.map(t => t.trim()).filter(t => t !== '')
    }

    // =========================================
    // METHODS — Table data
    // =========================================

    async getRowCount(): Promise<number> {
        return await this.page.locator(this.tableRows).count()
    }

    async getTimePeriod(rowIndex: number): Promise<string> {
        const cell = this.page.locator(this.tableRows).nth(rowIndex).locator('td').nth(this.colTimePeriod)
        return (await cell.textContent())?.trim() ?? ''
    }

    async getDays(rowIndex: number): Promise<string> {
        const cell = this.page.locator(this.tableRows).nth(rowIndex).locator('td').nth(this.colDays)
        return (await cell.textContent())?.trim() ?? ''
    }

    async getLeaveType(rowIndex: number): Promise<string> {
        const cell = this.page.locator(this.tableRows).nth(rowIndex).locator('td').nth(this.colLeaveType)
        return (await cell.textContent())?.trim() ?? ''
    }

    async getStatus(rowIndex: number): Promise<string> {
        const cell = this.page.locator(this.tableRows).nth(rowIndex).locator('td').nth(this.colStatus)
        return (await cell.locator('p').textContent())?.trim() ?? ''
    }

    async getAllStatuses(): Promise<string[]> {
        const rows = await this.page.locator(this.tableRows).count()
        const statuses: string[] = []
        for (let i = 0; i < rows; i++) {
            statuses.push(await this.getStatus(i))
        }
        return statuses
    }

    async getAllLeaveTypes(): Promise<string[]> {
        const rows = await this.page.locator(this.tableRows).count()
        const types: string[] = []
        for (let i = 0; i < rows; i++) {
            types.push(await this.getLeaveType(i))
        }
        return types
    }

    // =========================================
    // METHODS — Filters
    // =========================================

    async getLeaveTypeFilterValue(): Promise<string> {
        return await this.page.locator(`${this.leaveTypeFilter} input`).inputValue()
    }

    async getStatusFilterValue(): Promise<string> {
        return await this.page.locator(this.statusFilter).inputValue()
    }

    async getYearFilterValue(): Promise<string> {
        return await this.page.locator(this.yearFilter).inputValue()
    }

    async filterByLeaveType(leaveType: string): Promise<void> {
        await this.page.locator(`${this.leaveTypeFilter} .MuiSelect-select`).click()
        await this.page.locator(this.selectOption(leaveType)).click()
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
        await this.page.locator(this.tableRows).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    }

    async filterByStatus(status: string): Promise<void> {
        await this.page.locator(this.statusFilterBtn).click()
        await this.page.locator(this.selectStatusOption(status)).click()
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
        await this.page.locator(this.tableRows).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    }

    async filterByYear(year: string): Promise<void> {
        await this.page.locator(this.yearFilterBtn).click()
        await this.page.locator(this.selectOption(year)).click()
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
    }

    async removeFilters(): Promise<void> {
        await this.page.locator(this.removeFiltersBtn).click()
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
        await this.page.locator(this.tableRows).first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})
    }

    // =========================================
    // METHODS — Pagination (same pattern as all other pages)
    // =========================================

    async isNextPageDisabled(): Promise<boolean> {
        const classAttr = await this.page.locator(this.paginationNext).getAttribute('class')
        return classAttr?.includes('opacity-50') ?? true
    }

    async isPrevPageDisabled(): Promise<boolean> {
        const classAttr = await this.page.locator(this.paginationPrev).getAttribute('class')
        return classAttr?.includes('opacity-50') ?? true
    }
}