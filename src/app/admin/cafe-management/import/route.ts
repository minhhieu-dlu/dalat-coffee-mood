import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy file.' }, { status: 400 })
    }

    const text = await file.text()

    // Simple CSV parser (header + rows). Expected headers: name,address,description,latitude,longitude,ai_mood_tags,image_url
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) {
      return NextResponse.json({ success: false, message: 'File CSV rỗng hoặc thiếu dữ liệu.' }, { status: 400 })
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase())

    const rows = lines.slice(1).map((line) => {
      const cols = line.split(',')
      const obj: any = {}
      header.forEach((h, i) => {
        obj[h] = cols[i] ? cols[i].trim() : ''
      })
      return obj
    })

    const supabase = await createClient()

    const inserts = rows.map((r) => ({
      name: r.name || 'Không tên',
      address: r.address || null,
      description: r.description || null,
      latitude: r.latitude ? Number(r.latitude) : null,
      longitude: r.longitude ? Number(r.longitude) : null,
      ai_mood_tags: r.ai_mood_tags ? r.ai_mood_tags.split('|').map((t: string) => t.trim()) : [],
      image_url: r.image_url || null,
    }))

    // Insert in a batch
    const { error } = await supabase.from('coffee_shops').insert(inserts)

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, inserted: inserts.length })
  } catch (err) {
    return NextResponse.json({ success: false, message: (err as Error).message }, { status: 500 })
  }
}
