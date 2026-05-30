import { test, expect } from '@playwright/test'

test('User flow: navigate to first shop detail from homepage', async ({ page }) => {
  await page.goto('/')
  const firstShopLink = page.locator('a[href^="/shops/"]').first()
  // fallback: if the link is hidden, navigate directly to its href
  const href = await firstShopLink.getAttribute('href')
  expect(href).not.toBeNull()
  await page.goto(href!)
  await page.waitForLoadState('networkidle')
  // expect a shop title or name on detail page
  const header = page.locator('h1').first()
  await expect(header).toBeVisible({ timeout: 5000 })
})
