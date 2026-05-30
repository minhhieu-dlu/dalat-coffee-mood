/**
 * Run this script locally to create multiple test users in Supabase.
 * Requires environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Usage: node scripts/create_users.js 20
 */
const { createClient } = require('@supabase/supabase-js')

const count = Number(process.argv[2] || 10)

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment')
  process.exit(1)
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function run() {
  for (let i = 0; i < count; i++) {
    const email = `testuser+${Date.now()}+${i}@example.com`
    const password = 'P@ssw0rd1234'

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      console.error('Error creating user', error.message)
    } else {
      console.log('Created user', data.user.id, email)
    }
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
