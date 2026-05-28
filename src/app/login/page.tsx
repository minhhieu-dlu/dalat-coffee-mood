'use client'

import { useActionState, useMemo, useState } from 'react'
import Link from 'next/link'
import { signInAction } from '@/actions/auth'

type AuthState = {
  success: boolean
  message: string
}

const initialState: AuthState = {
  success: false,
  message: '',
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M4 6h16v12H4zM4 7l8 6 8-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M3 3l18 18M10.7 10.7A3 3 0 0 0 13.3 13.3M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a19.1 19.1 0 0 1-3.7 4.7M6.4 6.4C3.7 8.3 2 12 2 12s3.5 7 10 7c1 0 1.9-.1 2.7-.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M21.35 11.1H12v2.95h5.33C16.84 16.82 14.67 18 12 18a6 6 0 1 1 0-12c1.56 0 2.96.53 4.07 1.57l2.2-2.2A9.48 9.48 0 0 0 12 3a9 9 0 1 0 0 18c5 0 9.1-3.32 9.1-9 0-.62-.07-1.23-.17-1.9Z"
        fill="currentColor"
      />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M14 9h2V6.5c0-1.4.5-2.5 2.6-2.5H21V8h-2.2c-.7 0-.8.3-.8.9V9H21l-1 4h-2v8h-4v-8h-2V9h2V7.2C14 4.9 15.4 3 18.5 3H21v3.6h-2c-.8 0-1 .3-1 1V9Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(
    async (_previousState: AuthState, formData: FormData) => signInAction(formData),
    initialState
  )
  const [showPassword, setShowPassword] = useState(false)

  const bgStyle = useMemo(
    () => ({
      backgroundImage:
        'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80)',
    }),
    []
  )

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden px-4 py-6 md:py-10">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,47,29,0.55),rgba(10,47,29,0.25))]" />
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-md saturate-75"
          style={bgStyle}
        />
      </div>

      <section className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-md items-center">
        <div className="w-full rounded-4xl border border-white/20 bg-white/16 p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-6">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-bold tracking-tight">Dalat Coffee Mood</p>
              <p className="mt-2 max-w-xs text-sm leading-6 text-white/85">
                Không gian số ấm áp đang chờ đón bạn.
              </p>
            </div>
            <div className="shrink-0 rounded-full border border-white/20 bg-white/15 px-3 py-2 text-right text-xs font-medium text-white shadow-lg backdrop-blur-xl">
              <p className="leading-none">Đà Lạt</p>
              <p className="mt-1 text-base font-semibold">16°C</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/15 bg-pine-dark/20 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:p-5">
            <div className="mb-5">
              <h1 className="text-2xl font-bold tracking-tight text-white">Đăng nhập</h1>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Quay lại để tiếp tục khám phá những quán cà phê phù hợp với mood của bạn.
              </p>
            </div>

            <form action={formAction} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90" htmlFor="email">
                  Email
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-pine-dark shadow-sm transition focus-within:border-pine-light focus-within:ring-2 focus-within:ring-pine-light/80">
                  <EmailIcon />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Nhập email của bạn"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-pine-dark/45"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-pine-dark shadow-sm transition focus-within:border-pine-light focus-within:ring-2 focus-within:ring-pine-light/80">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-pine-dark/45"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="rounded-full p-1 text-pine-dark/60 transition hover:text-pine-dark"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              {state.message ? (
                <p className={`rounded-2xl px-4 py-3 text-sm ${state.success ? 'bg-emerald-500/15 text-emerald-50' : 'bg-rose-500/15 text-rose-50'}`}>
                  {state.message}
                </p>
              ) : null}

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-pine-dark px-5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(10,47,29,0.28)] transition hover:scale-[1.01] hover:bg-pine-dark/95 active:scale-[0.99]"
              >
                Đăng nhập
              </button>
            </form>

            <div className="my-5 flex items-center gap-3 text-white/60">
              <span className="h-px flex-1 bg-white/15" />
              <span className="text-xs uppercase tracking-[0.2em]">Hoặc tiếp tục với</span>
              <span className="h-px flex-1 bg-white/15" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/92 text-sm font-semibold text-pine-dark shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/92 text-sm font-semibold text-pine-dark shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                <FacebookIcon />
                Facebook
              </button>
            </div>

            <p className="mt-5 text-center text-sm text-white/80">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:text-pine-light">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
