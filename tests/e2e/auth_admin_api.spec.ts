import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

test.describe('Admin API tests using service role', () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    test.skip(true, 'Missing SUPABASE envs for admin API tests')
  }

  const supabase = createClient(supabaseUrl!, serviceKey!)
  let createdUserId: string | null = null
  const testEmail = `e2e-admin-${Date.now()}@example.com`
  const testPassword = 'P@ssword1234'

  test('create admin user via service role', async () => {
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { name: 'E2E Admin', role: 'admin' },
    })
    expect(error).toBeNull()
    expect(data).toBeTruthy()
    createdUserId = data.user?.id ?? null
    expect(createdUserId).not.toBeNull()
  })

  test('crud coffee_shops via admin', async () => {
    // insert
    const insertRes = await supabase.from('coffee_shops').insert([
      { slug: `e2e-shop-${Date.now()}`, name: 'E2E Shop', created_by: createdUserId },
    ]).select('id, slug, name')
    expect(insertRes.error).toBeNull()
    const shop = Array.isArray(insertRes.data) ? insertRes.data[0] : insertRes.data
    expect(shop).toBeTruthy()

    // update
    const updateRes = await supabase.from('coffee_shops').update({ name: 'E2E Shop Updated' }).eq('id', shop.id).select('id, name')
    expect(updateRes.error).toBeNull()
    const updated = Array.isArray(updateRes.data) ? updateRes.data[0] : updateRes.data
    expect(updated.name).toContain('Updated')

    // delete
    const delRes = await supabase.from('coffee_shops').delete().eq('id', shop.id)
    expect(delRes.error).toBeNull()
  })
})
