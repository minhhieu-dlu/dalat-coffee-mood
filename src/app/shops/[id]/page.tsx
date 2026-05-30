import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import DistanceFromUser from '@/components/shop/DistanceFromUser'
import { createClient } from '@/lib/supabase/server'
import { getCoffeeShops } from '@/actions/coffee-shops'

const fallbackShops = {
  'cheo-veooo': {
    name: 'Cheo Veooo',
    description:
      'View rừng thông thoáng đãng, nhiều góc ngồi tĩnh lặng và ánh sáng tự nhiên dịu mắt.',
    address: '7/20 Nguyễn Văn Cừ, Phường 1, Đà Lạt',
    latitude: 11.9412,
    longitude: 108.4488,
    imageUrl:
      'https://images.unsplash.com/photo-1505275350441-83dcda8eeef5?auto=format&fit=crop&w=1800&q=80',
  },
  'tui-mo-to': {
    name: 'Tiệm Cà Phê Túi Mơ To',
    description: 'Không gian sân vườn mềm mại, phù hợp ngồi lâu, trò chuyện và chụp ảnh.',
    address: '31 Đặng Thái Thân, Phường 3, Đà Lạt',
    latitude: 11.9498,
    longitude: 108.4461,
    imageUrl:
      'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1800&q=80',
  },
  'hoang-hon': {
    name: 'Tiệm Cà Phê Hoàng Hôn',
    description: 'Chất vintage ấm áp, tone gỗ đậm và góc nhìn mây trời đẹp vào cuối ngày.',
    address: 'Khu vực Trại Mát, Đà Lạt',
    latitude: 11.9416,
    longitude: 108.4714,
    imageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1800&q=80',
  },
} as const

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

function MenuCard({
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

  const supabase = await createClient()
  const numericId = Number(id)

  let shopRow: any = null

  if (Number.isInteger(numericId)) {
    try {
      const res = await supabase
        .from('coffee_shops')
        .select('id, name, description, address, latitude, longitude, image_url, ai_mood_tags')
        .eq('id', numericId)
        .maybeSingle()

      shopRow = res.data
    } catch (err) {
      const msg = String((err as any)?.message ?? err)

      if (/column .*latitude.* does not exist|column .*longitude.* does not exist|does not exist/.test(msg)) {
        // Retry without latitude/longitude
        const res2 = await supabase
          .from('coffee_shops')
          .select('id, name, description, address, image_url, ai_mood_tags')
          .eq('id', numericId)
          .maybeSingle()

        shopRow = res2.data
      } else {
        console.error('shop detail query error:', err)
        shopRow = null
      }
    }
  }

  let fallbackShop: { name: string; description: string; address: string; latitude?: number | null; longitude?: number | null; imageUrl?: string } | null =
    fallbackShops[decodeURIComponent(id) as keyof typeof fallbackShops] ??
    (shopRow
      ? {
          name: shopRow.name,
          description: shopRow.description ?? '',
          address: shopRow.address ?? '',
          latitude: shopRow.latitude,
          longitude: shopRow.longitude,
          imageUrl: shopRow.image_url ?? '',
        }
      : null)

  // If no fallback found by slug, and the id is numeric, try to find the fallback by numeric id
  if (!fallbackShop && Number.isInteger(numericId)) {
    const allShops = await getCoffeeShops()
    const found = allShops.find((s) => s.id === numericId)

    if (found) {
      // map CoffeeShopRow shape to fallback shape
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ai_mood_tags, image_url, ...rest } = found as any
      fallbackShop = {
        name: found.name,
        description: found.description ?? '',
        address: found.address ?? '',
        latitude: found.latitude,
        longitude: found.longitude,
        imageUrl: found.image_url ?? '',
      }
    }
  }

  if (!fallbackShop) {
    notFound()
  }

  const currentShopSlug = decodeURIComponent(id)

  const shop = {
    ...fallbackShop,
    name: shopRow?.name ?? fallbackShop.name,
    description: shopRow?.description ?? fallbackShop.description,
    address: shopRow?.address ?? fallbackShop.address,
    latitude: shopRow?.latitude ?? fallbackShop.latitude,
    longitude: shopRow?.longitude ?? fallbackShop.longitude,
    imageUrl: shopRow?.image_url ?? fallbackShop.imageUrl,
    tags: (shopRow?.ai_mood_tags ?? []) as string[],
  }

  const hasCoordinates = typeof shop.latitude === 'number' && typeof shop.longitude === 'number'
  const moodCount = shop.tags.length

  let likesCount = 0

  // Only query reviews when we have a valid numeric id from the database
  if (typeof shopRow?.id === 'number' && Number.isInteger(shopRow.id)) {
    const { count } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopRow.id)

    likesCount = count ?? 0
  } else if (Number.isInteger(numericId)) {
    const { count } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', numericId)

    likesCount = count ?? 0
  } else {
    likesCount = 0
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-4 pb-32 pt-4 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] shadow-[0_24px_60px_rgba(10,47,29,0.18)] sm:rounded-4xl">
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/map"
            className="inline-flex h-11 items-center justify-center rounded-full bg-white/90 px-4 text-sm font-semibold text-pine-dark shadow-lg backdrop-blur-md transition hover:bg-white"
          >
            Quay lại bản đồ
          </Link>
          <Link
            href={`/shops/${currentShopSlug}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-pine-dark/90 px-4 text-sm font-semibold text-white shadow-lg backdrop-blur-md transition hover:bg-pine-dark"
          >
            Đường dẫn chi tiết
          </Link>
        </div>

        <div
          className="h-[26rem] bg-cover bg-center sm:h-128"
          style={{
            backgroundImage: `url(${shop.imageUrl})`,
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

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <div className="rounded-[1.75rem] border border-white/15 bg-black/38 p-4 text-white backdrop-blur-md sm:rounded-3xl sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 sm:text-xs">
              <span className="rounded-full bg-white/15 px-2.5 py-1">Quán nổi bật</span>
              <span className="rounded-full bg-white/15 px-2.5 py-1">Menu theo mood</span>
              {shop.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-white/15 px-2.5 py-1 normal-case tracking-normal">
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{shop.name}</h1>
            <p className="mt-1 text-sm leading-6 text-white/80 sm:text-base">{shop.address}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">Likes</p>
                <p className="mt-1 text-sm font-semibold text-white sm:text-base">{likesCount ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">Mood</p>
                <p className="mt-1 text-sm font-semibold text-white sm:text-base">{moodCount}</p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">Tọa độ</p>
                <p className="mt-1 text-sm font-semibold text-white sm:text-base">{hasCoordinates ? 'Có' : 'Chưa'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-3">
        <article className="rounded-[1.75rem] bg-white p-5 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5 lg:col-span-2 sm:rounded-3xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">Mô tả</h2>
              <p className="mt-2 text-sm leading-7 text-slate-700 sm:text-[15px]">{shop.description}</p>
            </div>

            <div className="rounded-3xl bg-pine-light px-4 py-3 text-center shadow-sm sm:min-w-28">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Likes</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{likesCount ?? 0}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(15,23,42,0.04),rgba(10,47,29,0.04))] p-4 text-sm font-medium text-slate-700 ring-1 ring-black/5">
              <span className="font-semibold text-slate-900">Cách bạn </span>
              <DistanceFromUser latitude={shop.latitude} longitude={shop.longitude} />
            </div>
            <div className="rounded-3xl bg-[linear-gradient(135deg,rgba(15,23,42,0.04),rgba(10,47,29,0.04))] p-4 text-sm text-slate-700 ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Gợi ý trải nghiệm</p>
              <p className="mt-2 leading-6">
                Phù hợp để ngồi lâu, chụp ảnh và trò chuyện chậm rãi theo đúng nhịp Đà Lạt.
              </p>
            </div>
          </div>
        </article>

        <aside className="rounded-[1.75rem] bg-pine-light p-5 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-white/60 sm:rounded-3xl sm:p-6">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Thông tin nhanh</h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-700">
            <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Địa chỉ</p>
              <p className="mt-1 leading-6">{shop.address}</p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tọa độ</p>
              <p className="mt-1 leading-6">
                {typeof shop.latitude === 'number' && typeof shop.longitude === 'number'
                  ? `${shop.latitude.toFixed(5)}, ${shop.longitude.toFixed(5)}`
                  : 'Chưa cập nhật'}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Mood tags</p>
                <p className="mt-1 leading-6">
                  {shop.tags.length > 0 ? shop.tags.join(' · ') : 'Chưa có mood tags'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Tình trạng</p>
              <p className="mt-1 leading-6">Phù hợp để thư giãn, chụp ảnh và ngồi lâu.</p>
            </div>
          </div>
        </aside>
      </section>

        <section className="mt-6 space-y-4">
          <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Khu vực Menu</h2>
            <p className="text-sm text-slate-600">Những món uống gợi ý hợp với không gian Đà Lạt.</p>
          </div>
        </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {menuItems.map((item) => (
            <MenuCard key={item.name} {...item} />
          ))}
        </div>
      </section>

        <section className="mt-6 rounded-[1.75rem] bg-white p-5 shadow-[0_18px_40px_rgba(10,47,29,0.08)] ring-1 ring-black/5 sm:rounded-3xl sm:p-6">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
          <CompassIcon />
          <span>Cần chỉ đường nhanh?</span>
        </div>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Bật định vị trên thiết bị để xem khoảng cách đường chim bay từ vị trí của bạn đến quán.
        </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/map"
              className="inline-flex h-11 items-center justify-center rounded-full bg-pine-dark px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-pine-dark/90"
            >
              Xem trên bản đồ
            </Link>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-pine-light px-4 text-sm font-semibold text-pine-dark shadow-sm transition hover:bg-pine-light/80"
            >
              Khám phá thêm quán khác
            </Link>
          </div>
      </section>
    </main>
  )
}