import { test, expect } from '@playwright/test'

test('Homepage renders and basic UI elements visible', async ({ page, baseURL }) => {
  await page.goto('/')
  await expect(page.locator('main')).toBeVisible()
  // site title in layout
  const title = page.locator('text=Dalat Coffee Mood')
  const alt = page.locator('text=Đà Lạt')
  await expect(Promise.race([title.isVisible(), alt.isVisible()]).then(Boolean)).resolves.toBeTruthy()
})
