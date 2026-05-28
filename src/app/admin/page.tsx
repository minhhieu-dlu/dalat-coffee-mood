const systemServices = [
  { name: 'Weather API', status: 'Hoạt động', tone: 'bg-emerald-500' },
  { name: 'Spotify API', status: 'Hoạt động', tone: 'bg-emerald-500' },
] as const

const stats = [
  { label: 'Tổng số quán', value: '124', note: 'Đang đồng bộ 8 nguồn dữ liệu' },
  { label: 'Người dùng hoạt động', value: '8,432', note: '+18% trong 7 ngày qua' },
  { label: 'Mood được tìm kiếm nhiều nhất', value: 'Sương mù buổi sáng', note: 'Xu hướng nổi bật hôm nay' },
] as const

export default function AdminDashboardPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Admin Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-sm text-slate-600">
            Giám sát dữ liệu, kiểm tra tín hiệu tích hợp và chạy thử luồng AI RAG cho hệ thống Dalat Mood.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {stats.map((item) => (
          <article
            key={item.label}
            className="rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(232,240,236,0.95))] p-6 shadow-[0_18px_40px_rgba(10,47,29,0.08)] ring-1 ring-white/70"
          >
            <p className="text-sm font-semibold text-slate-600">{item.label}</p>
            <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{item.value}</p>
            <p className="mt-2 text-sm text-slate-600">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-[2rem] bg-white p-6 shadow-[0_18px_40px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Giám sát hệ thống</h2>
              <p className="mt-1 text-sm text-slate-600">Theo dõi tình trạng dịch vụ thời gian thực</p>
            </div>
            <div className="rounded-full bg-pine-light px-3 py-2 text-xs font-semibold text-slate-800">
              Uptime 99.98%
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {systemServices.map((service) => (
              <div key={service.name} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-4">
                <div>
                  <p className="font-bold text-slate-900">{service.name}</p>
                  <p className="text-sm text-slate-600">Đồng bộ mới nhất: 2 phút trước</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${service.tone}`} />
                  {service.status}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] bg-pine-dark p-6 text-white shadow-[0_18px_40px_rgba(10,47,29,0.16)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">RAG Playground</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Trải nghiệm AI RAG</h2>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Kiểm thử truy vấn nhanh để tìm quán phù hợp với mood, thời tiết và ngữ cảnh người dùng.
          </p>

          <div className="mt-5 rounded-[1.75rem] bg-white/10 p-4 backdrop-blur-xl">
            <label className="space-y-2 text-sm font-medium text-white/90">
              <span>Nhập câu lệnh AI</span>
              <textarea
                rows={5}
                defaultValue="Tìm không gian yên tĩnh gần rừng thông, có ánh sáng tự nhiên và phù hợp cho làm việc buổi sáng."
                className="w-full rounded-3xl border border-white/10 bg-white/95 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-pine-light"
              />
            </label>

            <button
              type="button"
              className="mt-4 h-12 w-full rounded-2xl bg-white text-sm font-semibold text-pine-dark transition hover:bg-pine-light"
            >
              Chạy thử truy vấn
            </button>
          </div>
        </article>
      </section>
    </main>
  )
}
