import { redirect } from 'next/navigation'

import AdminShell from '@/components/admin/AdminShell'
import { getUserRole } from '@/lib/auth/role'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
}
