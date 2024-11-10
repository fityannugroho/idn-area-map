import { config } from '@/lib/config'
import { expect, test } from '@playwright/test'

test.describe('meta tags', () => {
  test('has title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(config.appName)
  })

  test('has description', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.locator('head').locator('meta[name="description"]'),
    ).toHaveAttribute('content', config.appDescription)
  })
})
