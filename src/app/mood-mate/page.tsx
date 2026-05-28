'use client'

import Image from 'next/image'
import Link from 'next/link'

const conversation = [
  {
    role: 'ai',
    type: 'text',
    message:
      'Chào buổi sáng! Trời Đà Lạt hôm nay đang mưa lất phất và khá lạnh (16°C). Bạn đang muốn tìm một không gian như thế nào để thư giãn?',
  },
  {
    role: 'user',
    type: 'text',
    message: 'Mình muốn một nơi yên tĩnh, có view rừng thông và phù hợp để đọc sách.',
  },
  {
    role: 'ai',
    type: 'suggestion',
    message: 'Mình gợi ý một nơi rất hợp vibe của bạn:',
    shop: {
      name: 'Cheo Veooo',
      address: '7/20 Nguyễn Văn Cừ, Phường 1, Đà Lạt',
      image:
        'https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?auto=format&fit=crop&w=400&q=80',
      href: '/coffee-shops/cheo-veooo',
    },
  },
  {
    role: 'user',
    type: 'text',
    message: 'Nghe ổn đó, cho mình thêm một lựa chọn có không gian ấm hơn nhé.',
  },
  {
    role: 'ai',
    type: 'text',
    message:
      'Nếu bạn thích không gian ấm hơn, mình có thể lọc theo mood “Chill” hoặc “Vintage” để tìm thêm vài quán phù hợp ngay.',
  },
] as const

function OnlineDot() {
  return <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.12)]" />
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M21 3L10.5 13.5M21 3l-6.5 18-4-8-8-4L21 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WeatherMini() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md">
      <span className="h-2 w-2 rounded-full bg-sky-300" />
      16°C
    </div>
  )
}

export default function MoodMatePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-white/60 bg-cream-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-600">Trợ lý ảo</p>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-900">
                  Dalat Coffee Mood
                </h1>
                <OnlineDot />
              </div>
            </div>
          </div>

          <WeatherMini />
        </div>
      </header>

      <section className="flex-1 space-y-4 overflow-y-auto pb-4">
        {conversation.map((item, index) => {
          const isUser = item.role === 'user'
          const isSuggestion = item.type === 'suggestion'

          return (
            <div key={index} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={[
                  'max-w-[88%] rounded-3xl px-4 py-3 shadow-sm sm:max-w-[80%]',
                  isUser
                    ? 'bg-pine-dark text-white'
                    : 'bg-white text-slate-800 ring-1 ring-black/5',
                ].join(' ')}
              >
                {!isUser ? (
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Mood-mate AI
                  </p>
                ) : null}

                <p className="text-sm leading-6">{item.message}</p>

                {isSuggestion && 'shop' in item ? (
                  <div className="mt-4 overflow-hidden rounded-3xl bg-cream-bg ring-1 ring-pine-light/70">
                    <div className="flex gap-3 p-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl">
                        <Image
                          src={item.shop.image}
                          alt={item.shop.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900">{item.shop.name}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{item.shop.address}</p>
                        <Link
                          href={item.shop.href}
                          className="mt-3 inline-flex items-center gap-2 rounded-full bg-pine-dark px-3 py-2 text-xs font-semibold text-white transition hover:bg-pine-dark/95"
                        >
                          Xem chi tiết
                          <span className="text-base leading-none">→</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </section>

      <footer className="sticky bottom-0 z-20 -mx-4 border-t border-white/70 bg-cream-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-end gap-2 rounded-[1.75rem] border border-pine-light bg-white px-3 py-3 shadow-[0_12px_30px_rgba(10,47,29,0.06)]">
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine-light text-pine-dark transition hover:bg-pine-dark hover:text-white"
            aria-label="Đính kèm"
          >
            <PlusIcon />
          </button>

          <div className="flex-1">
            <label htmlFor="message" className="sr-only">
              Hỏi Mood-mate
            </label>
            <input
              id="message"
              type="text"
              placeholder="Hỏi Mood-mate..."
              className="h-11 w-full bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine-dark text-white shadow-[0_12px_24px_rgba(10,47,29,0.2)] transition hover:scale-105"
            aria-label="Gửi"
          >
            <SendIcon />
          </button>
        </div>
      </footer>
    </main>
  )
}
