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

test.describe('theme toggle', () => {
  test('dark mode', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Dark')).not.toBeVisible()

    // Click on the theme toggle button
    await page.getByTestId('theme-toggle').click()
    await expect(page.getByText('Dark')).toBeVisible()

    // Click on the Dark button
    await page.getByText('Dark').click()
    await expect(page.locator('html')).toHaveClass('dark')
    await expect(page.locator('html')).not.toHaveClass('light')
  })

  test('light mode', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Light')).not.toBeVisible()

    // Click on the theme toggle button
    await page.getByTestId('theme-toggle').click()
    await expect(page.getByText('Light')).toBeVisible()

    // Click on the Light button
    await page.getByText('Light').click()
    await expect(page.locator('html')).toHaveClass('light')
    await expect(page.locator('html')).not.toHaveClass('dark')
  })

  test('system default mode', async ({ page }) => {
    // Emulate dark mode as the preferred color scheme
    await page.emulateMedia({ colorScheme: 'dark' })

    await page.goto('/')

    // Set to Light mode first
    await page.getByTestId('theme-toggle').click()
    await page.getByText('Light').click()
    await expect(page.locator('html')).toHaveClass('light')
    await expect(page.getByText('Light')).not.toBeVisible()

    // Open theme toggle again and set to System mode
    await page.getByTestId('theme-toggle').click()
    await page.getByText('System').click()
    await expect(page.getByText('System')).toBeVisible()

    // Ensure that the theme is set to the preferred color scheme (dark)
    await expect(page.locator('html')).toHaveClass('dark')
    await expect(page.locator('html')).not.toHaveClass('light')
  })
})

test.describe.fixme('area selector', () => {
  // TODO: Add tests for the area selector
})

test.describe.fixme('boundary settings', () => {
  // TODO: Add tests for the boundary settings
})