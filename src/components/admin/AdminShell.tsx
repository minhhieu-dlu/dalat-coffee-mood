'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type AdminShellProps = {
  children: React.ReactNode
}

const menuItems = [
  { href: '/admin', label: 'Tổng quan', caption: 'Dashboard' },
  { href: '/admin/knowledge-base', label: 'Cơ sở dữ liệu', caption: 'Knowledge Base' },
  { href: '/admin/cafe-management', label: 'Quản lý quán', caption: 'Cafe Management' },
  { href: '/admin/user-analysis', label: 'Phân tích người dùng', caption: 'User Insights' },
] as const

function LogoMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pine-dark text-sm font-bold text-white shadow-lg">
      DM
    </div>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('admin-dark-mode')
    setDarkMode(stored === 'true')
  }, [])

  useEffect(() => {
    window.localStorage.setItem('admin-dark-mode', String(darkMode))
  }, [darkMode])

  const themeClasses = useMemo(
    () =>
      darkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-[#eef3ef] text-slate-900',
    [darkMode]
  )

  return (
    <div className={`min-h-screen ${themeClasses}`}>
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className={darkMode ? 'border-slate-800 bg-slate-900/95' : 'border-white/70 bg-white/90'}>
          <div className="flex items-center gap-3 border-b border-black/5 px-5 py-5 lg:h-screen lg:w-80 lg:flex-col lg:items-stretch lg:justify-between lg:border-b-0 lg:border-r">
            <div className="space-y-6 lg:w-full">
              <div className="flex items-center gap-3">
                <LogoMark />
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">Dalat Mood</h1>
                  <p className="text-xs font-medium text-slate-500">Admin Control Center</p>
                </div>
              </div>

              <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                {menuItems.map((item) => {
                  const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        'group flex min-w-60 items-center justify-between rounded-3xl px-4 py-4 text-left transition-all duration-200 lg:min-w-0',
                        active
                          ? 'bg-pine-dark text-white shadow-[0_16px_30px_rgba(10,47,29,0.18)]'
                          : darkMode
                            ? 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'
                            : 'bg-slate-50 text-slate-700 hover:bg-pine-light',
                      ].join(' ')}
                    >
                      <span>
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className={active ? 'text-xs text-white/70' : 'text-xs text-slate-500'}>
                          {item.caption}
                        </span>
                      </span>
                      <span className={active ? 'text-white/80' : 'text-slate-400'}>→</span>
                    </Link>
                  )
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={() => setDarkMode((current) => !current)}
              className={[
                'mt-4 flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-medium transition lg:mt-0',
                darkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-700',
              ].join(' ')}
              aria-pressed={darkMode}
            >
              <span
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-2xl',
                  darkMode ? 'bg-pine-dark text-white' : 'bg-white text-pine-dark shadow-sm',
                ].join(' ')}
              >
                {darkMode ? <MoonIcon /> : <SunIcon />}
              </span>
              <span className="flex-1 text-left">Chế độ tối</span>
              <span
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition',
                  darkMode ? 'bg-pine-dark' : 'bg-slate-300',
                ].join(' ')}
              >
                <span
                  className={[
                    'inline-block h-4 w-4 rounded-full bg-white transition',
                    darkMode ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </span>
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-5 lg:px-8 lg:py-8">{children}</div>
        </div>
      </div>
    </div>
  )
}
