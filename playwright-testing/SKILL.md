---
name: playwright-testing
description: Automated end-to-end browser testing using Playwright. Use when verifying web application functionality, testing user workflows, checking UI components, or validating API integrations through the browser. Includes test scripts for authentication flows, CRUD operations, form submissions, and multi-page navigation testing.
---

# Playwright Testing

## Overview

Playwright is a Node.js library for browser automation and end-to-end testing. It supports Chromium, Firefox, and WebKit with a single API.

## Quick Start

### Installation

```bash
npm install @playwright/test
npx playwright install  # Download browsers
```

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'

test('basic navigation', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await expect(page).toHaveTitle(/AWGP/)
})
```

## Testing AWGP MVP

### Test Suite Structure

```typescript
// tests/awgp.spec.ts
import { test, expect } from '@playwright/test'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

test.describe('AWGP MVP', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })

  test.describe('Navigation', () => {
    test('should display dashboard', async ({ page }) => {
      await expect(page.locator('h2')).toContainText('Overview')
    })

    test('should navigate to assistants page', async ({ page }) => {
      await page.click('text=Assistants')
      await expect(page).toHaveURL(/assistants/)
    })
  })

  test.describe('Assistants', () => {
    test('should open create assistant modal', async ({ page }) => {
      await page.click('text=Assistants')
      await page.click('text=Create Assistant')
      await expect(page.locator('text=Create Assistant')).toBeVisible()
    })

    test('should create an assistant', async ({ page }) => {
      await page.click('text=Assistants')
      await page.click('text=Create Assistant')
      
      await page.fill('input[name="name"]', 'Test Assistant')
      await page.selectOption('select[name="type"]', 'company_finance')
      await page.click('button[type="submit"]')
      
      await expect(page.locator('text=Test Assistant')).toBeVisible()
    })
  })
})
```

### Authentication Tests

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  
  test('should show login when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // Check for login button or redirect
    await expect(page.locator('text=Sign In')).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/login')
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/dashboard/)
  })
})
```

### API Integration Tests

```typescript
// tests/api.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Supabase API Integration', () => {
  
  test('should load assistants from API', async ({ page }) => {
    await page.goto('http://localhost:3000/assistants')
    
    // Wait for API response
    await page.waitForResponse(response => 
      response.url().includes('supabase') && 
      response.status() === 200
    )
    
    // Verify data loaded
    await expect(page.locator('table tbody tr')).toHaveCount.greaterThan(0)
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock failed API call
    await page.route('**/supabase.co/**', route => route.abort())
    
    await page.goto('http://localhost:3000/assistants')
    
    await expect(page.locator('text=Error')).toBeVisible()
  })
})
```

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/awgp.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with specific browser
npx playwright test --project=chromium

# Debug mode
npx playwright test --debug

# Generate HTML report
npx playwright test --reporter=html
```

## Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
})
```

## Common Selectors for AWGP

```typescript
// Navigation
await page.click('nav a:has-text("Assistants")')
await page.click('nav a:has-text("Approvals")')

// Buttons
await page.click('button:has-text("Create Assistant")')
await page.click('button:has-text("Approve")')

// Forms
await page.fill('input[name="name"]', 'Test Name')
await page.selectOption('select', 'option-value')
await page.click('button[type="submit"]')

// Tables
await expect(page.locator('table tbody tr')).toHaveCount(5)

// Status badges
await expect(page.locator('text=active')).toBeVisible()

// Modals
await expect(page.locator('.modal')).toBeVisible()
await page.click('.modal button:has-text("Cancel")')
```

## Testing Scripts

See [scripts/run-tests.sh](scripts/run-tests.sh) for automated test execution.
See [scripts/setup-tests.sh](scripts/setup-tests.sh) for test environment setup.

## References

- [Playwright Docs](https://playwright.dev/docs/intro)
- [API Reference](references/api_reference.md)
- [Best Practices](references/best-practices.md)
