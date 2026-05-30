'use client'

import { useMemo, useState } from 'react'

import { deleteCoffeeShopAction, type CoffeeShopRow } from '@/actions/coffee-shops'
import EditDrawer from '@/components/admin/EditDrawer'

type CafeRow = CoffeeShopRow & {
  status: 'Đang mở' | 'Sửa chữa'
}

type CafeManagementClientProps = {
  initialCoffeeShops: CoffeeShopRow[]
}

function StatusBadge({ status }: { status: CafeRow['status'] }) {
  const className =
    status === 'Đang mở'
      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      : 'bg-amber-50 text-amber-700 ring-amber-200'

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${className}`}>{status}</span>
}

function toCafeRow(row: CoffeeShopRow): CafeRow {
  return {
    ...row,
    status: row.image_url ? 'Đang mở' : 'Sửa chữa',
  }
}

export default function CafeManagementClient({ initialCoffeeShops }: CafeManagementClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCafe, setSelectedCafe] = useState<CafeRow | null>(
    initialCoffeeShops[0] ? toCafeRow(initialCoffeeShops[0]) : null
  )

  const cafeRows = useMemo(() => initialCoffeeShops.map(toCafeRow), [initialCoffeeShops])

  const drawerData = useMemo(
    () =>
      selectedCafe
        ? {
            id: selectedCafe.id,
            name: selectedCafe.name,
            address: selectedCafe.address ?? '',
            description: selectedCafe.description ?? '',
            vibeTags: selectedCafe.ai_mood_tags,
          }
        : undefined,
    [selectedCafe]
  )

  const handleDeleteAction = async (formData: FormData) => {
    await deleteCoffeeShopAction(formData)
  }

  return (
    <main className="space-y-6">
      <section className="rounded-4xl bg-white p-6 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Cafe Management</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý quán</h1>
            <p className="mt-2 text-sm text-slate-600">
              Theo dõi trạng thái mở cửa, đồng bộ AI và chỉnh sửa nội dung nhanh chóng.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCafe(null)
              setDrawerOpen(true)
            }}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-pine-dark px-5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(10,47,29,0.18)] transition hover:bg-pine-dark/95"
          >
            + Thêm địa điểm mới
          </button>
        </div>
      </section>

      <section className="rounded-4xl bg-white p-6 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
        <h3 className="text-sm font-semibold text-slate-800">Import CSV (bulk)</h3>
        <p className="mt-1 text-sm text-slate-600">Tải file CSV chứa các trường: name,address,description,latitude,longitude,ai_mood_tags,image_url. Dùng '|' để phân tách nhiều tags.</p>

        <form
          action="/admin/cafe-management/import"
          method="post"
          encType="multipart/form-data"
          className="mt-4 flex items-center gap-3"
        >
          <input name="file" type="file" accept=".csv" />
          <button
            type="submit"
            className="rounded-2xl bg-pine-dark px-4 py-2 text-sm font-semibold text-white"
          >
            Import
          </button>

          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              const sample = 'name,address,description,latitude,longitude,ai_mood_tags,image_url\nCheo Veooo,7/20 Ng Van Cu,View rừng thông,11.9412,108.4488,Chill|Acoustic,https://example.com/image.jpg'
              const blob = new Blob([sample], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'sample_shops.csv'
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="ml-3 text-sm text-pine-dark underline"
          >
            Tải mẫu CSV
          </a>
        </form>
      </section>

      <section className="overflow-hidden rounded-4xl bg-white shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <th className="px-5 py-4">Tên quán</th>
                <th className="px-5 py-4">Địa chỉ</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Vibe Tags</th>
                <th className="px-5 py-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {cafeRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{row.name}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-500">{row.address ?? 'Chưa cập nhật'}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      {row.ai_mood_tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-pine-light px-3 py-1 text-xs font-semibold text-pine-dark"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCafe(row)
                          setDrawerOpen(true)
                        }}
                        className="rounded-full bg-pine-dark px-4 py-2 text-sm font-semibold text-white transition hover:bg-pine-dark/95"
                      >
                        Sửa
                      </button>

                      <form action={handleDeleteAction}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                        >
                          Xóa
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <EditDrawer
        open={drawerOpen}
        mode={selectedCafe ? 'edit' : 'create'}
        initialData={drawerData}
        onClose={() => setDrawerOpen(false)}
      />
    </main>
  )
}