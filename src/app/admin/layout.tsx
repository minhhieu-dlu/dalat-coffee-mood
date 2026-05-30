import { redirect } from 'next/navigation'

import AdminShell from '@/components/admin/AdminShell'
import { getUserRole } from '@/lib/auth/role'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    if (getUserRole(user) !== 'admin') {
      redirect(`/?error=${encodeURIComponent('Bạn không có quyền truy cập khu vực quản trị.')}`)
    }

    return <AdminShell>{children}</AdminShell>
  } catch (error) {
    console.error('Admin layout failed to load:', error)

    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center px-4 py-12">
        <section className="rounded-4xl bg-white p-6 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
          <h1 className="text-2xl font-bold text-slate-900">Không thể tải khu vực quản trị</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Kiểm tra lại biến môi trường Supabase trên Vercel và quyền đăng nhập admin.
          </p>
        </section>
      </main>
    )
  }
}
