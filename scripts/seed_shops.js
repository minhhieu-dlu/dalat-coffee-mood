/**
 * Seed coffee shop rows into Supabase using the service role key.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 * Usage: node scripts/seed_shops.js
 */
const { createClient } = require('@supabase/supabase-js')

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment')
  process.exit(1)
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const shops = [
  {
    name: 'Cheo Veooo',
    description: 'View rừng thông thoáng đãng, nhiều góc ngồi tĩnh lặng và ánh sáng tự nhiên dịu mắt.',
    address: '7/20 Nguyễn Văn Cừ, Phường 1, Đà Lạt',
    latitude: 11.9412,
    longitude: 108.4488,
    ai_mood_tags: ['Chill', 'Acoustic'],
    image_url: 'https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?auto=format&fit=crop&w=1800&q=80',
  },
  {
    name: 'Tiệm Cà Phê Túi Mơ To',
    description: 'Không gian sân vườn mềm mại, phù hợp ngồi lâu, trò chuyện và chụp ảnh.',
    address: '31 Đặng Thái Thân, Phường 3, Đà Lạt',
    latitude: 11.9498,
    longitude: 108.4461,
    ai_mood_tags: ['Sân vườn', 'Chill'],
    image_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1800&q=80',
  },
  {
    name: 'Tiệm Cà Phê Hoàng Hôn',
    description: 'Chất vintage ấm áp, tone gỗ đậm và góc nhìn mây trời đẹp vào cuối ngày.',
    address: 'Khu vực Trại Mát, Đà Lạt',
    latitude: 11.9416,
    longitude: 108.4714,
    ai_mood_tags: ['Cổ điển - Vintage', 'Acoustic'],
    image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=80',
  },
  {
    name: 'Misty Pine',
    description: 'Quán nhỏ ấm, góc đọc sách, phù hợp làm việc nhẹ.',
    address: 'Hẻm nhỏ gần Hồ Xuân Hương, Đà Lạt',
    latitude: 11.9409,
    longitude: 108.4582,
    ai_mood_tags: ['Chill', 'Yên tĩnh'],
    image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1800&q=80',
  },
]

async function run() {
  for (const s of shops) {
    const { data, error } = await supabase.from('coffee_shops').insert(s)
    if (error) {
      console.error('Failed to insert', s.name, error.message)
    } else {
      console.log('Inserted', s.name)
    }
  }
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
