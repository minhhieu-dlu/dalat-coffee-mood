import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const nextPath = url.searchParams.get('next') ?? '/'
  const redirectTo = request.cookies.get('redirectTo')?.value ?? '/'

  if (!code) {
    return NextResponse.redirect(new URL('/login?message=Thi%E1%BA%BFu%20m%C3%A3%20x%C3%A1c%20th%E1%BB%B1c', request.url))
  }

  let response = NextResponse.redirect(new URL(redirectTo === '/' ? nextPath : redirectTo, request.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: Array<{
            name: string
            value: string
            options: Partial<CookieOptions>
          }>
        ) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(error.message)}`, request.url))
  }

  response.cookies.delete('redirectTo')

  return response
}