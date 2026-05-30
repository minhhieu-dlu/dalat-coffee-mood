import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function UserAnalysisPage() {
  let shopsCount = 0
  let usersCount = 0
  let reviewsCount = 0
  let topMoods: Array<[string, number]> = []

  try {
    const supabase = await createClient()

    const [{ count: fetchedShopsCount }, { count: fetchedUsersCount }, { count: fetchedReviewsCount }] =
      await Promise.all([
        supabase.from('coffee_shops').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
      ])

    shopsCount = fetchedShopsCount ?? 0
    usersCount = fetchedUsersCount ?? 0
    reviewsCount = fetchedReviewsCount ?? 0

    const { data: moodsData } = await supabase.from('coffee_shops').select('ai_mood_tags')

    const flat: string[] = (moodsData ?? []).flatMap((row: { ai_mood_tags?: string[] | null }) =>
      Array.isArray(row.ai_mood_tags) ? row.ai_mood_tags : []
    )

    const tally = flat.reduce((acc: Record<string, number>, mood: string) => {
      acc[mood] = (acc[mood] || 0) + 1
      return acc
    }, {})

    topMoods = Object.entries(tally)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  } catch (error) {
    console.error('User analysis failed to load:', error)
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Phân tích người dùng</h1>
      <p className="text-sm text-slate-600">Thống kê nhanh hệ thống và dữ liệu người dùng.</p>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
          <p className="text-sm text-slate-500">Tổng số quán</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{shopsCount ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
          <p className="text-sm text-slate-500">Tổng người dùng</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{usersCount ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
          <p className="text-sm text-slate-500">Tổng review</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{reviewsCount ?? 0}</p>
        </div>
      </section>

      <section className="mt-6 rounded-2xl bg-white p-4 shadow ring-1 ring-black/5">
        <h2 className="text-lg font-semibold">Mood phổ biến</h2>
        <div className="mt-3 space-y-2">
          {topMoods.length === 0 ? (
            <p className="text-sm text-slate-600">Không có dữ liệu mood.</p>
          ) : (
            topMoods.map(([mood, count]) => (
              <div key={mood} className="flex items-center justify-between">
                <div className="text-sm text-slate-700">{mood}</div>
                <div className="text-sm font-semibold text-slate-900">{count}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  )
}
