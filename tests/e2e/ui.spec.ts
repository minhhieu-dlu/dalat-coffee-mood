import { test, expect } from '@playwright/test'

test('Homepage renders and basic UI elements visible', async ({ page, baseURL }) => {
  await page.goto('/')
  // allow multiple <main> elements; assert at least one is visible
  const mains = page.locator('main')
  const count = await mains.count()
  let visibleFound = false
  for (let i = 0; i < count; i++) {
    if (await mains.nth(i).isVisible()) { visibleFound = true; break }
  }
  expect(visibleFound).toBeTruthy()

  // site title in layout - accept either string being visible
  const title = page.locator('text=Dalat Coffee Mood')
  const alt = page.locator('text=Đà Lạt')
  const titleVisible = await title.isVisible().catch(() => false)
  const altVisible = await alt.isVisible().catch(() => false)
  expect(titleVisible || altVisible).toBeTruthy()
})
