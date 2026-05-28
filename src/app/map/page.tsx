const nearbyShops = [
  { name: 'Cheo Veooo', vibe: 'Rừng thông', distance: '1.2 km' },
  { name: 'Túi Mơ To', vibe: 'Sân vườn', distance: '1.8 km' },
  { name: 'Misty Pine', vibe: 'Yên tĩnh', distance: '2.1 km' },
  { name: 'Hoàng Hôn', vibe: 'Vintage', distance: '2.6 km' },
] as const

function MapIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 text-slate-500">
      <path
        d="M9 18l-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Zm0 0V3m6 18V6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function MapPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bản đồ Đà Lạt</h1>
        <p className="mt-2 text-sm text-slate-600">Khám phá vị trí các quán cà phê nổi bật quanh khu vực của bạn.</p>
      </header>

      <section className="rounded-[2rem] bg-white p-4 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
        <div className="flex h-64 items-center justify-center rounded-[1.5rem] bg-gray-200 px-6 text-center">
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
              <MapIcon />
            </div>
            <p className="text-sm font-semibold text-slate-700">Bản đồ các quán cà phê sẽ hiển thị tại đây</p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Các quán gần bạn</h2>
          <p className="text-sm text-slate-500">Gợi ý nhanh</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {nearbyShops.map((shop) => (
            <article key={shop.name} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <p className="text-sm font-bold text-slate-900">{shop.name}</p>
              <p className="mt-1 text-xs text-slate-600">{shop.vibe}</p>
              <p className="mt-3 inline-flex rounded-full bg-pine-light px-3 py-1 text-xs font-semibold text-slate-800">
                {shop.distance}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}