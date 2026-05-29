import InteractiveDalatMap from '@/components/map/InteractiveDalatMap'
import { getCoffeeShops } from '@/actions/coffee-shops'

export default async function MapPage() {
  const coffeeShops = await getCoffeeShops()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bản đồ Đà Lạt</h1>
        <p className="mt-2 text-sm text-slate-600">
          Khám phá vị trí các quán cà phê nổi bật quanh khu vực của bạn.
        </p>
      </header>

      <InteractiveDalatMap shops={coffeeShops} />

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Danh sách quán hiện có</h2>
          <p className="text-sm text-slate-500">Click vào marker để xem nhanh</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {coffeeShops.map((shop) => (
            <article key={shop.id} className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <p className="text-sm font-bold text-slate-900">{shop.name}</p>
              <p className="mt-1 text-xs text-slate-600">{shop.address ?? 'Chưa cập nhật địa chỉ'}</p>
              <p className="mt-3 text-xs font-semibold text-slate-700">
                {typeof shop.latitude === 'number' && typeof shop.longitude === 'number'
                  ? `${shop.latitude.toFixed(4)}, ${shop.longitude.toFixed(4)}`
                  : 'Chưa có tọa độ'}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}