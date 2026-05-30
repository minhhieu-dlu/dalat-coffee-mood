import { createGoogleGenerativeAI } from '@ai-sdk/google'
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
} from 'ai'
import { type NextRequest } from 'next/server'

import { getCoffeeShopsWithStatus } from '@/actions/coffee-shops'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const systemPrompt =
  'Bạn là Mood-mate, trợ lý ảo chuyên tư vấn quán cà phê tại Đà Lạt. Hãy nói chuyện thân thiện, ngắn gọn. Nếu khách hỏi quán, hãy gợi ý dựa trên database. Nếu hỏi ngoài lề, khéo léo quay về chủ đề cà phê.'

function extractLatestUserText(messages: Array<{ role?: string; parts?: Array<{ type?: string; text?: string }> }>) {
  const latestUserMessage = [...messages].reverse().find((message) => message.role === 'user')

  if (!latestUserMessage?.parts) {
    return ''
  }

  return latestUserMessage.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text ?? '')
    .join(' ')
    .trim()
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
}

function buildRuleBasedResponse(queryText: string, shops: Awaited<ReturnType<typeof getCoffeeShopsWithStatus>>['shops']) {
  const normalizedQuery = normalizeText(queryText)

  if (/^(xin chao|chao|hello|hi)$/.test(normalizedQuery)) {
    return 'Tôi có thể giúp gì được cho bạn?'
  }

  const moodKeywords = [
    { keyword: 'chill', mood: 'Chill' },
    { keyword: 'acoustic', mood: 'Acoustic' },
    { keyword: 'vintage', mood: 'Cổ điển - Vintage' },
    { keyword: 'san vuon', mood: 'Sân vườn' },
    { keyword: 'lam viec', mood: 'Chill' },
    { keyword: 'yên tĩnh', mood: 'Chill' },
    { keyword: 'yen tinh', mood: 'Chill' },
  ] as const

  const matchedMood = moodKeywords.find((item) => normalizedQuery.includes(item.keyword))?.mood

  if (matchedMood) {
    const matchedShops = shops.filter((shop) => shop.ai_mood_tags.includes(matchedMood)).slice(0, 3)

    if (matchedShops.length > 0) {
      const intro =
        matchedMood === 'Chill'
          ? 'Mình gợi ý vài quán cà phê Chill phù hợp ở Đà Lạt:'
          : `Mình gợi ý vài quán theo mood ${matchedMood}:`

      const details = matchedShops
        .map((shop) => {
          const address = shop.address ?? 'Chưa cập nhật địa chỉ'
          const description = shop.description ?? 'Không có mô tả chi tiết.'

          return `- ${shop.name}: ${description} (${address})`
        })
        .join('\n')

      return `${intro}\n${details}\n\nBạn có thể bấm vào quán để xem trang chi tiết.`
    }

    return `Mình chưa tìm thấy quán nào có mood ${matchedMood} trong dữ liệu hiện tại. Bạn muốn mình gợi ý theo mood khác không?`
  }

  if (normalizedQuery.includes('quan ca phe') || normalizedQuery.includes('quán cà phê')) {
    const topShops = shops.slice(0, 3)

    if (topShops.length > 0) {
      return [
        'Mình có một vài gợi ý quán cà phê nổi bật ở Đà Lạt:',
        ...topShops.map((shop) => `- ${shop.name}: ${shop.description ?? 'Không có mô tả chi tiết.'}`),
        'Nếu bạn muốn, mình có thể lọc tiếp theo Chill, Acoustic, Vintage hoặc Sân vườn.',
      ].join('\n')
    }
  }

  return ''
}

async function persistChatHistory({
  request,
  transcript,
  assistantText,
}: {
  request: NextRequest
  transcript: unknown
  assistantText: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return
  }

  const serializedTranscript = JSON.stringify(transcript)
  const commonPayloads = [
    { user_id: user.id, content: serializedTranscript },
    { user_id: user.id, message: serializedTranscript },
    { user_id: user.id, messages: transcript },
    { user_id: user.id, prompt: serializedTranscript, response: assistantText },
    { user_id: user.id, chat: serializedTranscript },
  ] as const

  for (const payload of commonPayloads) {
    const { error } = await supabase.from('chat_history').insert(payload as never)

    if (!error) {
      return
    }
  }

  console.error('Unable to persist chat history for request:', request.nextUrl.pathname)
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: 'Google Generative AI API key is missing',
        hint: 'Set GOOGLE_GENERATIVE_AI_API_KEY in environment variables.',
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' },
      }
    )
  }

  const body = await request.json()
  const messages = body.messages ?? []
  const latestUserText = extractLatestUserText(messages)
  const { shops } = await getCoffeeShopsWithStatus()
  const ruleBasedResponse = latestUserText ? buildRuleBasedResponse(latestUserText, shops) : ''

  if (ruleBasedResponse) {
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const textId = 'rule-based-response'

        writer.write({ type: 'text-start', id: textId })
        writer.write({ type: 'text-delta', id: textId, delta: ruleBasedResponse })
        writer.write({ type: 'text-end', id: textId })
      },
    })

    void persistChatHistory({
      request,
      transcript: messages,
      assistantText: ruleBasedResponse,
    })

    return createUIMessageStreamResponse({ stream })
  }

  const coreMessages = await convertToModelMessages(messages)
  const google = createGoogleGenerativeAI({ apiKey })

  const dataHint = shops
    .map((shop) => `${shop.name} | ${shop.ai_mood_tags.join(', ') || 'không có mood tag'} | ${shop.address ?? 'chưa cập nhật'}`)
    .join('\n')

  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: `${systemPrompt}\n\nDữ liệu quán hiện có:\n${dataHint}`,
    messages: coreMessages,
    onFinish: async ({ text }) => {
      await persistChatHistory({
        request,
        transcript: messages,
        assistantText: text,
      })
    },
  })

  return result.toUIMessageStreamResponse()
}