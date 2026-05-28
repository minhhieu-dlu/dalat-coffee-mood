import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { getUserRole } from '@/lib/auth/role'

function createErrorUrl(request: NextRequest, pathname: string, message: string) {
	const url = request.nextUrl.clone()
	url.pathname = pathname
	url.search = ''
	url.searchParams.set('error', message)
	return url
}

function createLoginUrl(request: NextRequest, message: string) {
	const url = request.nextUrl.clone()
	url.pathname = '/login'
	url.search = ''
	url.searchParams.set('message', message)
	return url
}

export async function proxy(request: NextRequest) {
	let response = NextResponse.next({ request })

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
					}>,
					headers: Record<string, string>
				) {
					// In Edge (Vercel) `request.cookies` is immutable / not writable.
					// Do not attempt to write into the incoming request; instead set cookies
					// on the response which will be returned to the client.
					response = NextResponse.next({ request })

					cookiesToSet.forEach(({ name, value, options }) => {
						response.cookies.set(name, value, options)
					})

					Object.entries(headers).forEach(([key, value]) => {
						response.headers.set(key, value)
					})
				},
			},
		}
	)

	const {
		data: { user },
	} = await supabase.auth.getUser()

	const pathname = request.nextUrl.pathname
	const isAdminRoute = pathname.startsWith('/admin')
	const isProtectedFeatureRoute = pathname === '/mood-mate' || pathname.startsWith('/shops/')

	if (isAdminRoute) {
		if (!user) {
			return NextResponse.redirect(createLoginUrl(request, 'Vui lòng đăng nhập để tiếp tục.'))
		}

		if (getUserRole(user) !== 'admin') {
			return NextResponse.redirect(createErrorUrl(request, '/', 'Bạn không có quyền truy cập khu vực quản trị.'))
		}
	}

	if (isProtectedFeatureRoute && !user) {
		return NextResponse.redirect(createLoginUrl(request, 'Vui lòng đăng nhập để dùng tính năng này.'))
	}

	return response
}