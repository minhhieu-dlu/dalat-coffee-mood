import Link from 'next/link'

import { signOutAction } from '@/actions/auth'
import { createClient } from '@/lib/supabase/server'

function AvatarMark({ email }: { email: string }) {
  const initial = email.trim().charAt(0).toUpperCase() || '?'

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pine-dark text-xl font-bold text-white shadow-lg">
      {initial}
    </div>
  )
}

async function handleSignOut() {
  'use server'

  await signOutAction()
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <section className="w-full rounded-[2rem] bg-white p-6 text-center shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
          <p className="text-2xl font-bold tracking-tight text-slate-900">Bạn chưa đăng nhập</p>
          <p className="mt-2 text-sm text-slate-600">Hãy đăng nhập để xem hồ sơ, quán yêu thích và cài đặt tài khoản.</p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-pine-dark px-6 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(10,47,29,0.18)]"
          >
            Đi tới trang đăng nhập
          </Link>
        </section>
      </main>
    )
  }

  const email = user.email ?? 'no-email@example.com'
  const role = (user.user_metadata as any)?.role === 'admin' ? 'admin' : 'user'

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cá nhân</h1>
        <p className="mt-2 text-sm text-slate-600">Quản lý hồ sơ và các thiết lập tài khoản của bạn.</p>
      </header>

      <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          <AvatarMark email={email} />
          <div>
            <p className="text-xl font-bold text-slate-900">{email}</p>
            <p className="mt-1 text-sm text-slate-600">Vai trò: {role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <article className="rounded-3xl bg-pine-light p-4">
            <p className="text-sm font-bold text-slate-900">Quán yêu thích</p>
            <p className="mt-1 text-sm text-slate-600">Lưu lại những quán bạn muốn ghé lại.</p>
          </article>
          <article className="rounded-3xl bg-pine-light p-4">
            <p className="text-sm font-bold text-slate-900">Cài đặt tài khoản</p>
            <p className="mt-1 text-sm text-slate-600">Cập nhật thông tin hồ sơ và tuỳ chọn cá nhân.</p>
          </article>
        </div>

        <form action={handleSignOut} className="mt-6">
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-rose-600 px-6 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(190,18,60,0.2)] transition hover:bg-rose-700"
          >
            Đăng xuất
          </button>
        </form>
      </section>
    </main>
  )
}
