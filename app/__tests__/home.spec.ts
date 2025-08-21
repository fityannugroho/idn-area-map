import { expect, test } from '@playwright/test'
import { config } from '@/lib/config'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test.describe('meta tags', () => {
  test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(config.appName)
  })

  test('has description', async ({ page }) => {
    await expect(
      page.locator('head').locator('meta[name="description"]'),
    ).toHaveAttribute('content', config.appDescription)
  })
})
