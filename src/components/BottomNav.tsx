'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  {
    href: '/',
    label: 'Tìm kiếm',
    icon: SearchIcon,
  },
  {
    href: '/mood-mate',
    label: 'Mood-mate AI',
    icon: MessageSquareIcon,
  },
  {
    href: '/map',
    label: 'Bản đồ',
    icon: MapIcon,
  },
  {
    href: '/profile',
    label: 'Cá nhân',
    icon: UserIcon,
  },
] as const

function SearchIcon({ active }: { active?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={active ? 'drop-shadow-sm' : ''}
      />
    </svg>
  )
}

function MessageSquareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        d="M20 21a8 8 0 0 0-16 0M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function BottomNav() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <nav
      aria-label="Điều hướng dưới cùng"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-pine-light/80 bg-white/90 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-5xl grid-cols-4 px-3 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
        {navItems.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={[
                'group relative flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold transition-all duration-200',
                active
                  ? 'bg-pine-dark/10 text-slate-900 shadow-[0_8px_24px_rgba(10,47,29,0.10)]'
                  : 'text-slate-600 hover:bg-pine-light hover:text-slate-900',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200',
                  active ? 'bg-pine-dark text-cream-bg shadow-md' : 'bg-transparent',
                ].join(' ')}
              >
                <Icon />
              </span>
              <span className="leading-none">{item.label}</span>
              {active ? (
                <span className="pointer-events-none absolute h-12 w-16 rounded-3xl bg-pine-dark/10 blur-xl" aria-hidden="true" />
              ) : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
