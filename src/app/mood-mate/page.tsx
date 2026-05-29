'use client'

import { useEffect, useRef, useState } from 'react'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'

function OnlineDot() {
  return <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(74,222,128,0.12)]" />
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function MoodMatePage() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })
  const [input, setInput] = useState('')
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      <header className="sticky top-0 z-20 -mx-4 mb-4 border-b border-white/60 bg-cream-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-600">Trợ lý ảo</p>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Mood-mate</h1>
              <OnlineDot />
            </div>
          </div>

          <div className="rounded-full bg-white/80 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm ring-1 ring-black/5">
            Gemini 1.5 Flash
          </div>
        </div>
      </header>

      <section className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.length === 0 ? (
          <div className="rounded-4xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Mood-mate AI</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Bạn muốn tìm quán cà phê như thế nào?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Hãy thử hỏi theo mood, view, giá, hoặc khu vực. Mình sẽ gợi ý quán phù hợp ở Đà Lạt.
            </p>
          </div>
        ) : null}

        {messages.map((message) => {
          const isUser = message.role === 'user'
          const textContent = message.parts
            .filter((part) => part.type === 'text')
            .map((part) => part.text)
            .join('')

          return (
            <div key={message.id} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={[
                  'max-w-[88%] rounded-3xl px-4 py-3 shadow-sm sm:max-w-[80%]',
                  isUser ? 'bg-pine-dark text-white' : 'bg-white text-slate-800 ring-1 ring-black/5',
                ].join(' ')}
              >
                {!isUser ? (
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Mood-mate AI
                  </p>
                ) : null}

                <p className="whitespace-pre-wrap text-sm leading-6">{textContent}</p>
              </div>
            </div>
          )
        })}

        {status !== 'ready' ? (
          <div className="flex justify-start">
            <div className="rounded-3xl bg-white px-4 py-3 text-sm text-slate-500 ring-1 ring-black/5">
              Mood-mate đang suy nghĩ...
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="flex justify-start">
            <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-200">
              {error.message}
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </section>

      <footer className="sticky bottom-0 z-20 -mx-4 border-t border-white/70 bg-cream-bg/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <form
          onSubmit={async (event) => {
            event.preventDefault()

            const trimmedInput = input.trim()

            if (!trimmedInput || status !== 'ready') {
              return
            }

            await sendMessage({ text: trimmedInput })
            setInput('')
          }}
          className="flex items-end gap-2 rounded-[1.75rem] border border-pine-light bg-white px-3 py-3 shadow-[0_12px_30px_rgba(10,47,29,0.06)]"
        >
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
            <textarea
              id="message"
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Hỏi Mood-mate..."
              className="max-h-32 min-h-11 w-full resize-none bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pine-dark text-white shadow-[0_12px_24px_rgba(10,47,29,0.2)] transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Gửi"
            disabled={status !== 'ready' || !input.trim()}
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </main>
  )
}