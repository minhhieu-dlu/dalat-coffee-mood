import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Route test signup & signin
 * POST /api/test/auth/multi-user-test
 */

export async function POST(request: NextRequest) {
  const logs: string[] = []
  const timestamp = new Date().toISOString()

  function log(msg: string, type: string = 'INFO') {
    const logLine = `[${type}] ${msg}`
    logs.push(logLine)
    console.log(logLine)
  }

  try {
    log('=== BẮT ĐẦU TEST MULTI-USER SIGNUP ===', 'START')

    const supabase = await createClient()

    // Test tạo 3 users
    const testUsers = [
      { email: `user1-${Date.now()}@test.com`, password: 'Test@12345', name: 'User 1' },
      { email: `user2-${Date.now()}@test.com`, password: 'Test@12345', name: 'User 2' },
      { email: `user3-${Date.now()}@test.com`, password: 'Test@12345', name: 'User 3' },
    ]

    const results = []

    for (let i = 0; i < testUsers.length; i++) {
      const user = testUsers[i]
      log(`User ${i + 1}: Signup...`, 'TEST')

      // Signup
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            role: 'user',
          },
        },
      })

      if (signUpError) {
        log(`  ❌ Signup failed: ${signUpError.message}`, 'ERROR')
        results.push({
          email: user.email,
          signup: false,
          profile: false,
          signin: false,
          error: signUpError.message,
        })
        continue
      }

      log(`  ✓ Signup success`, 'SUCCESS')

      // Check profile created
      await new Promise(r => setTimeout(r, 300))
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user?.id)
        .single()

      const profileExists = !profileError && profile

      if (profileExists) {
        log(`  ✓ Profile created: ${profile.name}`, 'SUCCESS')
      } else {
        log(`  ❌ Profile not found`, 'ERROR')
      }

      // Test signin
      log(`User ${i + 1}: Signin...`, 'TEST')
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      })

      const signInSuccess = !signInError

      if (signInSuccess) {
        log(`  ✓ Signin success`, 'SUCCESS')
      } else {
        log(`  ❌ Signin failed: ${signInError?.message}`, 'ERROR')
      }

      results.push({
        email: user.email,
        signup: true,
        profile: profileExists,
        signin: signInSuccess,
      })
    }

    // Check total profiles
    log('Checking total profiles...', 'TEST')
    const { data: allProfiles, error: profilesError, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })

    if (!profilesError) {
      log(`✓ Total profiles: ${count}`, 'SUCCESS')
    } else {
      log(`❌ Error checking profiles: ${profilesError.message}`, 'ERROR')
    }

    const allSignupSuccess = results.every(r => r.signup)
    const allProfilesCreated = results.every(r => r.profile)
    const allSigninSuccess = results.every(r => r.signin)

    log('=== KẾT THÚC TEST ===', 'END')

    if (allSignupSuccess && allProfilesCreated && allSigninSuccess) {
      log('✅ ALL TESTS PASSED - BUG FIXED!', 'SUCCESS')
    } else {
      log('❌ SOME TESTS FAILED', 'ERROR')
    }

    return NextResponse.json(
      {
        success: allSignupSuccess && allProfilesCreated && allSigninSuccess,
        summary: {
          allSignupSuccess,
          allProfilesCreated,
          allSigninSuccess,
          totalProfiles: count,
        },
        results,
        logs,
      },
      { status: 200 }
    )
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    log(`❌ Error: ${errorMsg}`, 'ERROR')

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
        logs,
      },
      { status: 500 }
    )
  }
}
