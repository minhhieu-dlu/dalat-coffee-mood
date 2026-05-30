'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import type { CoffeeShopRow } from '@/actions/coffee-shops'
import { getDalatWeather } from '@/actions/weather'

type ShopMood = 'Chill' | 'Cổ điển - Vintage' | 'Acoustic' | 'Sân vườn'
type MoodFilter = ShopMood | 'Tất cả'

type HomeClientProps = {
  coffeeShops: CoffeeShopRow[]
  dataNotice: string | null
}

const moodTags = ['Tất cả', 'Chill', 'Cổ điển - Vintage', 'Acoustic', 'Sân vườn'] as const satisfies readonly MoodFilter[]

const fallbackImageUrl =
  'https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?auto=format&fit=crop&w=1200&q=80'

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

export default function HomeClient({ coffeeShops, dataNotice }: HomeClientProps) {
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
  const weatherLabel =
    typeof weather?.temperature === 'number' ? `Phù hợp thời tiết: ${weather.temperature}°C` : 'Phù hợp thời tiết: ...'

  const sortedCoffeeShops = useMemo(() => {
    const availableShops = coffeeShops ?? []

    if (selectedMood === 'Tất cả') {
      return availableShops
    }

    const activeMood = selectedMood as ShopMood

    return [...availableShops].sort((first, second) => {
      const firstScore = first.ai_mood_tags.includes(activeMood) ? 1 : 0
      const secondScore = second.ai_mood_tags.includes(activeMood) ? 1 : 0

      return secondScore - firstScore
    })
  }, [coffeeShops, selectedMood])

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-6 pt-4 sm:px-6 lg:px-8">
      {dataNotice ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-sm">
          {dataNotice}
        </div>
      ) : null}

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

        {sortedCoffeeShops.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-pine-light bg-white px-6 py-10 text-center shadow-sm">
            <p className="text-base font-semibold text-slate-900">Chưa có địa điểm nào để hiển thị</p>
            <p className="mt-2 text-sm text-slate-600">
              Hãy kiểm tra kết nối Supabase hoặc thêm dữ liệu quán để bản đồ và danh sách hoạt động đầy đủ.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href="/map" className="rounded-full bg-pine-dark px-4 py-2 text-sm font-semibold text-white">
                Mở bản đồ
              </Link>
              <Link href="/admin/cafe-management" className="rounded-full bg-pine-light px-4 py-2 text-sm font-semibold text-pine-dark">
                Quản lý dữ liệu
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedCoffeeShops.map((shop) => {
              const imageUrl = shop.image_url ?? fallbackImageUrl

              return (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.id}`}
                  className="group relative overflow-hidden rounded-4xl bg-white shadow-[0_24px_60px_rgba(10,47,29,0.16)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(10,47,29,0.2)]"
                >
                  <div
                    className="h-72 bg-cover bg-center transition duration-500 group-hover:scale-[1.02]"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,47,29,0.12),rgba(10,47,29,0.38)_70%,rgba(10,47,29,0.82))]" />

                  <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <div className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-pine-dark shadow-sm backdrop-blur-md">
                      #{shop.id}
                    </div>
                    <div className="rounded-full bg-pine-dark/80 px-3 py-2 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                      {shop.latitude !== null && shop.longitude !== null ? 'Có tọa độ' : 'Thiếu tọa độ'}
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="rounded-3xl border border-white/10 bg-black/30 p-4 backdrop-blur-md">
                      <h3 className="text-xl font-semibold text-white">{shop.name}</h3>
                      <p className="mt-1 text-sm text-white/80">{shop.address ?? 'Chưa cập nhật địa chỉ'}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {shop.ai_mood_tags.length > 0 ? (
                          shop.ai_mood_tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/15 bg-white/12 px-3 py-2 text-xs font-medium text-white"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full border border-white/15 bg-white/12 px-3 py-2 text-xs font-medium text-white">
                            Chưa có mood tags
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                        <p className="text-xs text-white/70">Chạm vào thẻ để xem đầy đủ thông tin.</p>
                        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-pine-dark shadow-sm transition group-hover:translate-x-0.5 group-hover:bg-pine-light">
                          Xem chi tiết
                          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                            <path
                              d="M5 12h12m0 0-4-4m4 4-4 4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}