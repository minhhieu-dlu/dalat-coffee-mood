#!/usr/bin/env node

/**
 * Auto test script - Kiểm tra fix bug "chỉ một tài khoản" 
 * Chạy: node scripts/auto-test-auth.js
 */

const http = require('http')
const fs = require('fs')
const path = require('path')

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const OUTPUT_FILE = path.join(__dirname, '../auth-test-result.json')

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL)
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = http.request(url, options, (res) => {
      let data = ''
      res.on('data', chunk => (data += chunk))
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          })
        } catch {
          resolve({
            status: res.statusCode,
            data: data,
          })
        }
      })
    })

    req.on('error', reject)

    if (body) {
      req.write(JSON.stringify(body))
    }

    req.end()
  })
}

async function runTests() {
  console.log('🧪 Bắt đầu kiểm tra xác thực...')
  console.log(`Base URL: ${BASE_URL}\n`)

  try {
    // Test 1: Check server running
    console.log('1️⃣  Kiểm tra server...')
    try {
      const healthCheck = await makeRequest('GET', '/')
      console.log('   ✓ Server đang chạy\n')
    } catch {
      console.error('   ❌ Server không chạy. Hãy chạy: npm run dev')
      process.exit(1)
    }

    // Test 2: Run multi-user test
    console.log('2️⃣  Chạy test multi-user signup...')
    const testResult = await makeRequest('POST', '/api/test/auth/multi-user-test', {})

    if (testResult.status !== 200) {
      console.error(`   ❌ API error: ${testResult.status}`)
      console.error(testResult.data)
      process.exit(1)
    }

    const { success, summary, results, logs } = testResult.data

    // Print logs
    console.log('\n📋 Chi tiết kiểm tra:')
    logs.forEach(log => console.log(`   ${log}`))

    // Print summary
    console.log('\n📊 Kết quả:')
    console.log(`   Tất cả signup: ${summary.allSignupSuccess ? '✓' : '✗'}`)
    console.log(`   Tất cả profiles: ${summary.allProfilesCreated ? '✓' : '✗'}`)
    console.log(`   Tất cả signin: ${summary.allSigninSuccess ? '✓' : '✗'}`)
    console.log(`   Tổng profiles: ${summary.totalProfiles}`)

    // Print per-user results
    console.log('\n👥 Từng user:')
    results.forEach((r, i) => {
      console.log(`   User ${i + 1}: ${r.email}`)
      console.log(`      Signup: ${r.signup ? '✓' : '✗'} | Profile: ${r.profile ? '✓' : '✗'} | Signin: ${r.signin ? '✓' : '✗'}`)
    })

    // Save result
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(testResult.data, null, 2))
    console.log(`\n💾 Kết quả lưu tại: ${OUTPUT_FILE}`)

    // Final status
    console.log('\n' + '='.repeat(50))
    if (success) {
      console.log('✅ FIX SUCCESSFUL - BUG ĐÃ ĐƯỢC KHẮC PHỤC!')
      console.log('✅ Có thể tạo nhiều tài khoản')
      console.log('✅ Tất cả users đều có thể đăng nhập')
      process.exit(0)
    } else {
      console.log('❌ FIX INCOMPLETE - Còn vấn đề')
      console.log('❌ Kiểm tra logs ở trên')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

runTests()
