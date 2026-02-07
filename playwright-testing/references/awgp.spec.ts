import { test, expect } from '@playwright/test'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

test.describe('AWGP MVP - End to End', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Navigation & Layout', () => {
    
    test('should display dashboard on load', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Overview')
      await expect(page.locator('text=Dashboard')).toBeVisible()
    })

    test('should have working sidebar navigation', async ({ page }) => {
      const navItems = ['Dashboard', 'Assistants', 'Approvals', 'Audit', 'Costs', 'Organization', 'Settings']
      
      for (const item of navItems) {
        await expect(page.locator(`nav:has-text("${item}")`)).toBeVisible()
      }
    })

    test('should navigate to Assistants page', async ({ page }) => {
      await page.click('text=Assistants')
      await expect(page).toHaveURL(/assistants/)
      await expect(page.locator('h2')).toContainText('Manage Assistants')
    })

    test('should navigate to Approvals page', async ({ page }) => {
      await page.click('text=Approvals')
      await expect(page).toHaveURL(/approvals/)
      await expect(page.locator('h2')).toContainText('Approvals')
    })

    test('should have dark mode toggle', async ({ page }) => {
      await page.click('button[title*="dark mode"], button[title*="light mode"]')
      // Check if dark class is applied to html
      const hasDarkClass = await page.evaluate(() => 
        document.documentElement.classList.contains('dark')
      )
      expect(hasDarkClass).toBeTruthy()
    })
  })

  test.describe('Assistants Page', () => {
    
    test('should display assistants table or empty state', async ({ page }) => {
      await page.click('text=Assistants')
      
      // Either table exists or empty state
      const hasTable = await page.locator('table').isVisible().catch(() => false)
      const hasEmptyState = await page.locator('text=No assistants').isVisible().catch(() => false)
      
      expect(hasTable || hasEmptyState).toBeTruthy()
    })

    test('should open create assistant modal', async ({ page }) => {
      await page.click('text=Assistants')
      await page.click('button:has-text("Create Assistant")')
      
      await expect(page.locator('text=Create Assistant')).toBeVisible()
      await expect(page.locator('input[name="name"]')).toBeVisible()
    })

    test('should validate create assistant form', async ({ page }) => {
      await page.click('text=Assistants')
      await page.click('button:has-text("Create Assistant")')
      
      // Try submit without filling form
      await page.click('button[type="submit"]')
      
      // Should still be on modal (validation prevents close)
      await expect(page.locator('text=Create Assistant')).toBeVisible()
    })

    test('should close modal on cancel', async ({ page }) => {
      await page.click('text=Assistants')
      await page.click('button:has-text("Create Assistant")')
      await page.click('button:has-text("Cancel")')
      
      await expect(page.locator('text=Create Assistant')).not.toBeVisible()
    })
  })

  test.describe('Approvals Page', () => {
    
    test('should display approval tabs', async ({ page }) => {
      await page.click('text=Approvals')
      
      const tabs = ['My Inbox', 'My Requests', 'All Pending']
      for (const tab of tabs) {
        await expect(page.locator(`button:has-text("${tab}")`)).toBeVisible()
      }
    })

    test('should filter approvals by tab', async ({ page }) => {
      await page.click('text=Approvals')
      
      // Click on different tabs
      await page.click('button:has-text("My Requests")')
      await page.click('button:has-text("All Pending")')
      
      // Should still show the approvals page
      await expect(page.locator('h2')).toContainText('Approvals')
    })
  })

  test.describe('Dashboard Stats', () => {
    
    test('should display stats cards', async ({ page }) => {
      const stats = ['Active Assistants', 'Pending Approvals', "Today's Spend"]
      
      for (const stat of stats) {
        await expect(page.locator(`text=${stat}`)).toBeVisible()
      }
    })

    test('should display activity feed', async ({ page }) => {
      await expect(page.locator('text=Real-Time Activity Feed')).toBeVisible()
    })

    test('should display cost breakdown', async ({ page }) => {
      await expect(page.locator('text=Cost by Subsidiary')).toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Navigation should adapt
      await expect(page.locator('text=AWGP')).toBeVisible()
    })

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      
      await expect(page.locator('h2')).toContainText('Overview')
    })
  })
})
