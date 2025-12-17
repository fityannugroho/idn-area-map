import test, { expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('should show the boundary settings, enabled by default', async ({
  page,
}) => {
  await expect(page.getByLabel('Province')).toBeChecked()
  await expect(page.getByLabel('Regency')).toBeChecked()
  await expect(page.getByLabel('District')).toBeChecked()
  await expect(page.getByLabel('Village')).toBeChecked()
})

test('should hide the province boundary when disabled', async ({ page }) => {
  // Select a province
  await page.getByRole('button', { name: 'Province' }).click()
  await page.getByRole('option', { name: 'jakarta' }).click()
  await expect(page.getByRole('main').locator('g path')).toBeVisible({
    timeout: 10_000,
  })

  // Disable the province boundary
  await page.getByLabel('Province').click()
  await expect(page.getByRole('main').locator('g path')).toHaveAttribute(
    'fill',
    'transparent',
  )
})

test('should hide the regency boundary when disabled', async ({ page }) => {
  // Select a regency
  await page.getByRole('button', { name: 'Regency' }).click()
  await page.getByPlaceholder('Search Regency').fill('jakarta')
  await page.getByRole('option').first().click()
  await expect(page.getByRole('main').locator('g path')).toBeVisible({
    timeout: 10_000,
  })

  // Disable the regency boundary setting
  await page.getByLabel('Regency').click()
  await expect(page.getByRole('main').locator('g path')).toHaveAttribute(
    'fill',
    'transparent',
  )
})

test('should hide the district boundary when disabled', async ({ page }) => {
  // Select a district
  await page.getByRole('button', { name: 'District' }).click()
  await page.getByPlaceholder('Search District').fill('gambir')
  await page.getByRole('option').first().click()
  await expect(page.getByRole('main').locator('g path')).toBeVisible({
    timeout: 10_000,
  })

  // Disable the district boundary setting
  await page.getByLabel('District').click()
  await expect(page.getByRole('main').locator('g path')).toHaveAttribute(
    'fill',
    'transparent',
  )
})

test('should hide the village boundary when disabled', async ({ page }) => {
  // Select a village
  await page.getByRole('button', { name: 'Village' }).click()
  await page.getByPlaceholder('Search Village').fill('gambir')
  await page.getByRole('option').first().click()
  await expect(page.getByRole('main').locator('g path')).toBeVisible({
    timeout: 10_000,
  })

  // Disable the village boundary setting
  await page.getByLabel('Village').click()
  await expect(page.getByRole('main').locator('g path')).toHaveAttribute(
    'fill',
    'transparent',
  )
})
