import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('dark mode', async ({ page }) => {
  await expect(page.getByText('Dark')).toBeHidden()

  // Click on the theme toggle button
  await page.getByTestId('theme-toggle').click()
  await expect(page.getByText('Dark')).toBeVisible()

  // Click on the Dark button
  await page.getByText('Dark').click()
  await expect(page.locator('html')).toHaveClass('dark')
  await expect(page.locator('html')).not.toHaveClass('light')
})

test('light mode', async ({ page }) => {
  await expect(page.getByText('Light')).toBeHidden()

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

  // Set to Light mode first
  await page.getByTestId('theme-toggle').click()
  await page.getByText('Light').click()
  await expect(page.locator('html')).toHaveClass('light')
  await expect(page.getByText('Light')).toBeHidden()

  // Open theme toggle again and set to System mode
  await page.getByTestId('theme-toggle').click()
  await page.getByText('System').click()
  await expect(page.getByText('System')).toBeVisible()

  // Ensure that the theme is set to the preferred color scheme (dark)
  await expect(page.locator('html')).toHaveClass('dark')
  await expect(page.locator('html')).not.toHaveClass('light')
})
