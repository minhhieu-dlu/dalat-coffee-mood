import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'

test('Supabase connection via direct admin client', async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) test.skip(true, 'Missing SUPABASE envs')

  const supabase = createClient(supabaseUrl!, serviceKey!)
  const { data, error } = await supabase.from('profiles').select('id').limit(1)
  expect(error).toBeNull()
  expect(data).not.toBeNull()
})
