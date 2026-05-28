import Link from 'next/link'

const menuItems = [
  {
    name: 'Cà phê trứng',
    price: '49.000đ',
    flavor: 'Béo mịn, đậm vị, hậu ngọt nhẹ.',
    image:
      'https://images.unsplash.com/photo-1517701550927-30cf4ba1a1d2?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Trà dâu tằm',
    price: '55.000đ',
    flavor: 'Chua ngọt cân bằng, thơm mát.',
    image:
      'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Latte hạt dẻ',
    price: '58.000đ',
    flavor: 'Mượt, ấm, thơm hạt dẻ rang.',
    image:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Soda chanh bạc hà',
    price: '45.000đ',
    flavor: 'Sảng khoái, mát lạnh, dễ uống.',
    image:
      'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=600&q=80',
  },
] as const

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M15 18l-6-6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 21s-7.5-4.7-9.5-9.1C.8 8 2.7 4.8 6 4.2c2-.3 3.5.6 4.4 1.8.9-1.2 2.4-2.1 4.4-1.8 3.3.6 5.2 3.8 3.5 7.7C19.5 16.3 12 21 12 21Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-11.5-1.8 5.3-5.3 1.8 1.8-5.3 5.3-1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M9 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ShopCard({
  name,
  price,
  flavor,
  image,
}: (typeof menuItems)[number]) {
  return (
    <article className="overflow-hidden rounded-3xl bg-white p-3 shadow-[0_12px_28px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
      <div className="aspect-square overflow-hidden rounded-2xl bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-5 text-pine-dark">{name}</h3>
          <span className="shrink-0 rounded-full bg-pine-light px-2.5 py-1 text-[11px] font-semibold text-pine-dark">
            {price}
          </span>
        </div>
        <p className="text-xs leading-5 text-pine-dark/65">{flavor}</p>
      </div>
    </article>
  )
}

export default async function ShopDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>
}>) {
  const { id } = await params

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-4 pb-40 pt-4 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-4xl shadow-[0_24px_60px_rgba(10,47,29,0.18)]">
        <div
          className="h-128 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1504473089979-3f0b3d3ad0f6?auto=format&fit=crop&w=1800&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,47,29,0.08)_20%,rgba(10,47,29,0.18)_45%,rgba(10,47,29,0.8)_100%)]" />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-pine-dark shadow-lg backdrop-blur-md transition hover:bg-white"
            aria-label="Quay lại"
          >
            <BackIcon />
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-rose-500 shadow-lg backdrop-blur-md transition hover:bg-white"
            aria-label="Yêu thích"
          >
            <HeartIcon />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="rounded-3xl border border-white/15 bg-black/30 p-4 text-white backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              <span className="rounded-full bg-white/15 px-2.5 py-1">Quán nổi bật</span>
              <span className="rounded-full bg-white/15 px-2.5 py-1">ID #{id}</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">Misty Pine Roasters</h1>
            <p className="mt-1 text-sm text-white/80">Đường lên Trại Mát, Phường 11, Đà Lạt</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-3xl bg-pine-light p-5 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-white/60">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Độ tương thích âm nhạc</h2>
            <p className="mt-1 text-sm text-slate-600">Đang phát: Indie Việt - Lo-fi</p>
          </div>
          <div className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm">
            88%
          </div>
        </div>

        <div className="mt-4">
          <div className="h-3 rounded-full bg-white/80 p-1 shadow-inner">
            <div className="h-full w-[88%] rounded-full bg-pine-dark shadow-[0_0_18px_rgba(10,47,29,0.28)]" />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Độ tương thích: 88%</span>
            <span>Rất khớp với nhịp của bạn</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-700">
          Cực kỳ phù hợp với hồ sơ Tập trung &amp; Thư giãn của bạn.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Thực đơn theo mùa</h2>
            <p className="text-sm text-slate-600">Những món uống đặc trưng hợp với tiết trời Đà Lạt.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <ShopCard key={item.name} {...item} />
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-3xl bg-white p-5 shadow-[0_18px_40px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
        <h2 className="text-lg font-bold tracking-tight text-slate-900">Không gian &amp; Cảm nhận</h2>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          Misty Pine Roasters mang một vẻ đẹp ấm áp và trầm tĩnh với nội thất gỗ mộc,
          ánh đèn vàng dịu và những khung cửa lớn nhìn thẳng ra rừng thông. Không gian
          bên trong được bố trí thoáng, yên ả, tạo cảm giác như đang ẩn mình giữa một
          căn nhà nhỏ trên đồi. Đây là nơi rất hợp để đọc sách, làm việc nhẹ nhàng hoặc
          chỉ đơn giản là ngồi nghe tiếng mưa Đà Lạt rơi đều bên ngoài.
        </p>
      </section>

      <section className="mt-6 mb-8 rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(232,240,236,0.95))] p-4 shadow-[0_18px_40px_rgba(10,47,29,0.08)] ring-1 ring-white/70">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Đặt bàn ngay</p>
            <p className="text-xs text-slate-600">Giữ cho mình một góc ngồi đẹp nhé.</p>
          </div>
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-pine-dark text-white shadow-[0_12px_24px_rgba(10,47,29,0.22)] transition hover:scale-105"
            aria-label="Mở chỉ đường"
          >
            <CompassIcon />
          </button>
        </div>

        <button
          type="button"
          className="mt-4 flex h-14 w-full items-center justify-center rounded-2xl bg-pine-dark text-base font-semibold text-white shadow-[0_18px_36px_rgba(10,47,29,0.22)] transition hover:bg-pine-dark/95"
        >
          Đặt bàn ngay
        </button>
      </section>
    </main>
  )
}
