'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export type AuthActionResult = {
  success: boolean
  message: string
}

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function signUpAction(formData: FormData): Promise<AuthActionResult | never> {
  try {
    const supabase = await createClient()
    const email = getFormValue(formData, 'email')
    const password = getFormValue(formData, 'password')
    const name = getFormValue(formData, 'name')

    if (!email || !password) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ email và mật khẩu.',
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || undefined,
        },
      },
    })

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    redirect('/login?message=Check email to continue')
  } catch {
    return {
      success: false,
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

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

    redirect('/login')
  } catch {
    return {
      success: false,
      message: 'Không thể đăng xuất lúc này. Vui lòng thử lại sau.',
    }
  }
}