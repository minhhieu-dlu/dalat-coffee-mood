import { test, expect } from '@playwright/test'

test('User flow: navigate to first shop detail from homepage', async ({ page }) => {
  await page.goto('/')
  const firstShopLink = page.locator('a[href^="/shops/"]').first()
  await expect(firstShopLink).toBeVisible({ timeout: 5000 })
  await firstShopLink.click()
  await page.waitForLoadState('networkidle')
  // expect a shop title or name on detail page
  const header = page.locator('h1').first()
  await expect(header).toBeVisible({ timeout: 5000 })
})
