import { test, expect, request } from '@playwright/test'

test('Supabase connection via test API (multi-user-test)', async ({ request, baseURL }) => {
  const url = `${baseURL}/api/test/auth/multi-user-test`
  const resp = await request.post(url, { data: {} })
  expect(resp.status()).toBeGreaterThanOrEqual(200)
  expect(resp.status()).toBeLessThan(500)
  const body = await resp.json().catch(() => null)
  expect(body).not.toBeNull()
  expect(body).toHaveProperty('logs')
})
