import { google } from '@ai-sdk/google'
import { convertToModelMessages, streamText } from 'ai'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const systemPrompt =
  'Bạn là Mood-mate, trợ lý ảo chuyên tư vấn quán cà phê tại Đà Lạt. Hãy nói chuyện thân thiện, ngắn gọn. Nếu khách hỏi quán, hãy gợi ý dựa trên database. Nếu hỏi ngoài lề, khéo léo quay về chủ đề cà phê.'

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
  const body = await request.json()
  const messages = body.messages ?? []
  const coreMessages = await convertToModelMessages(messages)

  const result = streamText({
    model: google('gemini-1.5-flash'),
    system: systemPrompt,
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