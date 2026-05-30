'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

import { createClient } from '@/lib/supabase/server'
import { getUserRole, isAdminEmail } from '@/lib/auth/role'

export type AuthActionResult = {
  success: boolean
  message: string
  code?: string
  redirectTo?: string
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeAuthError(error: { code?: string; message?: string }) {
  const code = (error.code ?? '').toLowerCase()
  const message = (error.message ?? '').toLowerCase()

  if (
    code.includes('user_already_exists') ||
    code.includes('email_exists') ||
    message.includes('already') ||
    message.includes('registered')
  ) {
    return {
      code: 'user_exists',
      message: 'Tài khoản đã tồn tại',
    }
  }

  if (
    code.includes('invalid_login') ||
    code.includes('invalid_credentials') ||
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials')
  ) {
    return {
      code: 'invalid_login',
      message: 'Sai thông tin đăng nhập',
    }
  }

  return {
    code: error.code ?? 'auth_error',
    message: error.message ?? 'Không thể xử lý yêu cầu xác thực lúc này.',
  }
}

async function getRedirectTarget(defaultTarget: string) {
  const cookieStore = await cookies()
  const savedTarget = cookieStore.get('redirectTo')?.value

  if (savedTarget) {
    cookieStore.delete('redirectTo')
    return savedTarget
  }

  return defaultTarget
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult | never> {
  try {
    const supabase = await createClient()
    const email = getFormValue(formData, 'email')
    const password = getFormValue(formData, 'password')
    const name = getFormValue(formData, 'name')
    const role = isAdminEmail(email) ? 'admin' : 'user'

    if (!email || !password) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ email và mật khẩu.',
      }
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || undefined,
          role,
        },
      },
    })

    if (error) {
      console.error('signUp error raw:', error)
      const normalizedError = normalizeAuthError(error)

      return {
        success: false,
        code: normalizedError.code,
        message: normalizedError.message,
      }
    }

    // Tạo profile ngay lập tức (không chỉ phụ thuộc trigger)
    if (signUpData.user) {
      const profileName = name || email.split('@')[0] || 'Người dùng'
      const { error: profileError } = await supabase.from('profiles').upsert(
        {
          id: signUpData.user.id,
          name: profileName,
          role,
        },
        {
          onConflict: 'id',
        }
      )

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Log error nhưng không fail signup
      }
    }

    const redirectTo = await getRedirectTarget('/login')

    return {
      success: true,
      code: 'register_success',
      message: 'Đăng ký thành công',
      redirectTo,
    }
  } catch {
    return {
      success: false,
      code: 'auth_error',
      message: 'Không thể đăng ký tài khoản lúc này. Vui lòng thử lại sau.',
    }
  }
}

export async function signInAction(formData: FormData): Promise<AuthActionResult | never> {
  try {
    const supabase = await createClient()
    const email = getFormValue(formData, 'email')
    const password = getFormValue(formData, 'password')

    if (!email || !password) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ email và mật khẩu.',
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const normalizedError = normalizeAuthError(error)

      return {
        success: false,
        code: normalizedError.code,
        message: normalizedError.message,
      }
    }

    const role = getUserRole(data.user)
    const profileName =
      (data.user.user_metadata as Record<string, unknown> | null | undefined)?.name?.toString() ??
      data.user.email?.split('@')[0] ??
      'Người dùng'

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: data.user.id,
        name: profileName,
        role,
      },
      {
        onConflict: 'id',
      }
    )

    if (!profileError) {
      await supabase.auth.updateUser({
        data: {
          role,
        },
      })
    }

    return {
      success: true,
      code: 'login_success',
      message: 'Đăng nhập thành công',
      redirectTo: await getRedirectTarget(role === 'admin' ? '/admin' : '/'),
    }
  } catch {
    return {
      success: false,
      code: 'auth_error',
      message: 'Không thể đăng nhập lúc này. Vui lòng thử lại sau.',
    }
  }
}

export async function signOutAction(): Promise<AuthActionResult | never> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    redirect('/')
  } catch {
    return {
      success: false,
      message: 'Không thể đăng xuất lúc này. Vui lòng thử lại sau.',
    }
  }
}