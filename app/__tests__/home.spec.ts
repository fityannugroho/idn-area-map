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

test.describe('area selector', () => {
  test('province selector should load all provinces', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Province' })).toBeVisible()
    await page.getByRole('button', { name: 'Province' }).click()
    await expect(page.getByPlaceholder('Search Province')).toBeVisible()

    // Ensure that all provinces are displayed
    await expect(page.getByRole('option')).toHaveCount(38)
  })

  test('regency selector should load some regencies', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Regency' })).toBeVisible()
    await page.getByRole('button', { name: 'Regency' }).click()
    await expect(page.getByPlaceholder('Search Regency')).toBeVisible()

    // Ensure that the number of options available matches the expected count
    await expect(page.getByRole('option')).toHaveCount(
      config.dataSource.area.pagination.defaultPageSize,
    )
  })

  test('district selector should load some districts', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'District' })).toBeVisible()
    await page.getByRole('button', { name: 'District' }).click()
    await expect(page.getByPlaceholder('Search District')).toBeVisible()

    // Ensure that the number of options available matches the expected count
    await expect(page.getByRole('option')).toHaveCount(
      config.dataSource.area.pagination.defaultPageSize,
    )
  })

  test('village selector should load some villages', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Village' })).toBeVisible()
    await page.getByRole('button', { name: 'Village' }).click()
    await expect(page.getByPlaceholder('Search Village')).toBeVisible()

    // Ensure that the number of options available matches the expected count
    await expect(page.getByRole('option')).toHaveCount(
      config.dataSource.area.pagination.defaultPageSize,
    )
  })

  test('search province should show the correct provinces', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Province' }).click()
    await page.getByPlaceholder('Search Province').fill('jawa')

    // Ensure all options contains 'jawa' word (non case-sensitive)
    const options = page.getByRole('option')

    for (const option of await options.all()) {
      const text = await option.textContent()
      expect(text).toMatch(/jawa/i)
    }
  })

  test('search regency should show the correct regencies', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Regency' }).click()
    await page.getByPlaceholder('Search Regency').fill('bandung')

    // Ensure all options contains 'bandung' word (non case-sensitive)
    const options = page.getByRole('option')

    for (const option of await options.all()) {
      const text = await option.textContent()
      expect(text).toMatch(/bandung/i)
    }
  })

  test('search district should show the correct districts', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'District' }).click()
    await page.getByPlaceholder('Search District').fill('cirebon')

    // Ensure all options contains 'cirebon' word (non case-sensitive)
    const options = page.getByRole('option')

    for (const option of await options.all()) {
      const text = await option.textContent()
      expect(text).toMatch(/cirebon/i)
    }
  })

  test('search village should show the correct villages', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Village' }).click()
    await page.getByPlaceholder('Search Village').fill('pabean')

    // Ensure all options contains 'pabean' word (non case-sensitive)
    const options = page.getByRole('option')

    for (const option of await options.all()) {
      const text = await option.textContent()
      expect(text).toMatch(/pabean/i)
    }
  })

  test.fixme(
    'select a province should load the regencies of the selected province',
    async ({ page }) => {
      // TODO: Add tests for selecting a province
    },
  )

  test.fixme(
    'select a regency should load the districts of the selected regency',
    async ({ page }) => {
      // TODO: Add tests for selecting a regency
    },
  )

  test.fixme(
    'select a district should load the villages of the selected district',
    async ({ page }) => {
      // TODO: Add tests for selecting a district
    },
  )
})

test.describe.fixme('boundary settings', () => {
  // TODO: Add tests for the boundary settings
})
