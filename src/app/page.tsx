'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

import { getDalatWeather } from '@/actions/weather'

type ShopMood = 'Chill' | 'Cổ điển - Vintage' | 'Acoustic' | 'Sân vườn'
type MoodFilter = ShopMood | 'Tất cả'

type CoffeeShop = {
  id: string
  name: string
  address: string
  rating: number
  compatibility: number
  moods: readonly ShopMood[]
  tags: readonly string[]
  image: string
}

const moodTags = ['Tất cả', 'Chill', 'Cổ điển - Vintage', 'Acoustic', 'Sân vườn'] as const satisfies readonly MoodFilter[]

const coffeeShops: readonly CoffeeShop[] = [
  {
    id: 'cheo-veooo',
    name: 'Cheo Veooo',
    address: '7/20 Nguyễn Văn Cừ, Phường 1, Đà Lạt',
    rating: 4.8,
    compatibility: 95,
    moods: ['Chill', 'Acoustic'],
    tags: ['Ngắm rừng thông', 'Yên tĩnh'],
    image:
      'url(https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?auto=format&fit=crop&w=1200&q=80)',
  },
  {
    id: 'tui-mo-to',
    name: 'Tiệm Cà Phê Túi Mơ To',
    address: '31 Đặng Thái Thân, Phường 3, Đà Lạt',
    rating: 4.7,
    compatibility: 92,
    moods: ['Sân vườn', 'Chill'],
    tags: ['Sân vườn', 'Ánh sáng đẹp'],
    image:
      'url(https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=80)',
  },
  {
    id: 'hoang-hon',
    name: 'Tiệm Cà Phê Hoàng Hôn',
    address: 'Khu vực Trại Mát, Đà Lạt',
    rating: 4.9,
    compatibility: 89,
    moods: ['Cổ điển - Vintage', 'Acoustic'],
    tags: ['Cổ điển - Vintage', 'Ngắm mây'],
    image:
      'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80)',
  },
] as const

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6">
      <path
        d="M7 18a4 4 0 1 1 1.1-7.84A5 5 0 0 1 17.8 10 3.5 3.5 0 1 1 18 18Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Avatar() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pine-dark text-xs font-semibold text-white shadow-lg ring-2 ring-white/70">
      MH
    </div>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Home() {
  const [selectedMood, setSelectedMood] = useState<MoodFilter>('Chill')
  const [weather, setWeather] = useState<{ temperature: number | null; description: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadWeather = async () => {
      const result = await getDalatWeather()

      if (isMounted) {
        setWeather(result)
      }
    }

    void loadWeather()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setErrorMessage(params.get('error'))
  }, [])

  const weatherTemperature = weather?.temperature ?? '--'
  const weatherDescription = weather?.description ?? 'Đang tải thời tiết...'
  const weatherLabel = weather?.temperature
    ? `Phù hợp thời tiết: ${weather.temperature}°C`
    : 'Phù hợp thời tiết: ...'
  const sortedCoffeeShops = useMemo(() => {
    if (selectedMood === 'Tất cả') {
      return coffeeShops
    }

    const activeMood = selectedMood as ShopMood

    return [...coffeeShops].sort((first, second) => {
      const firstScore = first.moods.includes(activeMood) ? 1 : 0
      const secondScore = second.moods.includes(activeMood) ? 1 : 0

      return secondScore - firstScore
    })
  }, [selectedMood])

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
      {errorMessage ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
          {errorMessage}
        </div>
      ) : null}

      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <Image src="/Logo.png" alt="Logo Dalat Coffee Mood" width={46} height={46} priority />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Dalat Coffee Mood</h1>
            <p className="text-xs font-medium text-slate-600">Khám phá quán cà phê theo mood của bạn</p>
          </div>
        </div>

        <Avatar />
      </header>

      <section className="relative overflow-hidden rounded-4xl border border-white/70 bg-[linear-gradient(135deg,rgba(232,240,236,0.95),rgba(249,248,246,0.92))] p-5 shadow-[0_20px_50px_rgba(10,47,29,0.08)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(10,47,29,0.11),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(10,47,29,0.08),transparent_35%)]" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-pine-dark shadow-sm ring-1 ring-pine-light/80">
              <CloudIcon />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">Đà Lạt - {weatherTemperature}°C</p>
              <p className="text-sm text-slate-600">{weatherDescription}</p>
            </div>
          </div>

          <div className="rounded-full bg-white/75 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm ring-1 ring-pine-light/70">
            {weatherLabel}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Gợi ý theo Mood</h2>
            <p className="text-sm text-slate-600">Chạm vào tag để lọc cảm hứng phù hợp nhất.</p>
          </div>
          <div className="hidden rounded-full bg-pine-light px-3 py-2 text-xs font-semibold text-slate-800 sm:inline-flex">
            {weatherLabel}
          </div>
        </div>

        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {moodTags.map((tag) => {
            const active = selectedMood === tag
            return (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedMood(tag)}
                className={[
                  'whitespace-nowrap rounded-full px-4 py-3 text-sm font-semibold transition-all duration-200',
                  active
                    ? 'bg-pine-dark text-white shadow-[0_12px_24px_rgba(10,47,29,0.22)]'
                    : 'bg-white text-pine-dark/75 shadow-sm ring-1 ring-pine-light/70 hover:bg-pine-light',
                ].join(' ')}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-4 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Quán cà phê nổi bật</h2>
            <p className="text-sm text-slate-600">Danh sách được gợi ý theo mood và thời tiết hiện tại.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-pine-dark px-3 py-2 text-xs font-semibold text-white shadow-sm">
            <SearchIcon />
            Tìm kiếm
          </div>
        </div>

        <div className="space-y-4">
          {sortedCoffeeShops.map((shop) => (
            <Link
              key={shop.name}
              href={`/shops/${shop.id}`}
              className="group relative min-h-88 overflow-hidden rounded-4xl bg-cover bg-center shadow-[0_24px_60px_rgba(10,47,29,0.16)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(10,47,29,0.2)]"
              style={{ backgroundImage: shop.image }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,47,29,0.12),rgba(10,47,29,0.38)_70%,rgba(10,47,29,0.82))]" />
              <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-pine-dark shadow-sm backdrop-blur-md">
                ⭐ {shop.rating}
              </div>
              <div className="absolute right-4 top-4 rounded-full bg-pine-dark/80 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                Phù hợp thời tiết: {shop.compatibility}%
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                  <h3 className="text-xl font-semibold text-white">{shop.name}</h3>
                  <p className="mt-1 text-sm text-white/80">{shop.address}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {shop.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/15 bg-white/12 px-3 py-2 text-xs font-medium text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
