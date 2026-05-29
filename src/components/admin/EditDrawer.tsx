'use client'

import { useEffect, useMemo, useState } from 'react'

import { createCoffeeShopAction, updateCoffeeShopAction } from '@/actions/coffee-shops'

type EditDrawerProps = {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  initialData?: {
    id?: number
    name?: string
    address?: string
    description?: string
    latitude?: number | null
    longitude?: number | null
    vibeTags?: string[]
  }
}

const vibeChoices = ['Chill', 'Vintage', 'Tập trung', 'Sân vườn', 'Ấm cúng', 'Ngắm mây']

export default function EditDrawer({ open, onClose, mode, initialData }: EditDrawerProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.vibeTags ?? [])

  const defaultValues = useMemo(
    () => ({
      id: initialData?.id,
      name: initialData?.name ?? '',
      address: initialData?.address ?? '',
      description: initialData?.description ?? '',
      latitude: initialData?.latitude ?? '',
      longitude: initialData?.longitude ?? '',
    }),
    [initialData]
  )

  useEffect(() => {
    setSelectedTags(initialData?.vibeTags ?? [])
  }, [initialData, open])

  if (!open) {
    return null
  }

  const formAction = async (formData: FormData) => {
    if (mode === 'create') {
      await createCoffeeShopAction(formData)
      return
    }

    await updateCoffeeShopAction(formData)
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-slate-950/45 backdrop-blur-sm"
        aria-label="Đóng bảng chỉnh sửa"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-[#f7f8f6] shadow-[0_24px_80px_rgba(15,23,42,0.25)] transition-transform">
        <form action={formAction} className="flex h-full flex-col">
          <div className="border-b border-black/5 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Cafe Management</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {mode === 'create' ? 'Thêm địa điểm mới' : 'Chỉnh sửa địa điểm'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cập nhật ảnh, vibe tags và nội dung mô tả cho quán cà phê.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            {defaultValues.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}

            <div className="rounded-3xl border border-dashed border-pine-dark/20 bg-white p-5 shadow-sm">
              <label className="block space-y-2 text-sm font-semibold text-slate-800">
                <span>Ảnh đại diện quán</span>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-pine-light file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pine-dark focus:border-pine-dark"
                />
              </label>
              <p className="mt-3 text-xs text-slate-500">Ảnh sẽ được tải thẳng lên Supabase Storage.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-800">
                <span>Tên quán</span>
                <input
                  name="name"
                  defaultValue={defaultValues.name}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-pine-dark"
                  placeholder="Nhập tên quán"
                  required
                />
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-800">
                <span>Địa chỉ</span>
                <input
                  name="address"
                  defaultValue={defaultValues.address}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-pine-dark"
                  placeholder="Nhập địa chỉ quán"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-800">
                <span>Latitude</span>
                <input
                  name="latitude"
                  type="number"
                  step="any"
                  defaultValue={defaultValues.latitude}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-pine-dark"
                  placeholder="Ví dụ: 11.9404"
                />
              </label>

              <label className="space-y-2 text-sm font-semibold text-slate-800">
                <span>Longitude</span>
                <input
                  name="longitude"
                  type="number"
                  step="any"
                  defaultValue={defaultValues.longitude}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-pine-dark"
                  placeholder="Ví dụ: 108.4583"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm font-semibold text-slate-800">
              <span>Mô tả không gian</span>
              <textarea
                name="description"
                defaultValue={defaultValues.description}
                rows={5}
                className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-pine-dark"
                placeholder="Mô tả phong cách, view, âm thanh..."
              />
            </label>

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-800">Vibe Tags</h3>
                <p className="text-xs text-slate-500">Chọn hoặc xoá bằng nút x</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTags((current) => current.filter((item) => item !== tag))}
                    className="inline-flex items-center gap-2 rounded-full bg-pine-dark px-4 py-2 text-sm font-medium text-white shadow-sm"
                  >
                    {tag}
                    <span className="text-base leading-none">×</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {vibeChoices
                  .filter((choice) => !selectedTags.includes(choice))
                  .map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setSelectedTags((current) => [...current, choice])}
                      className="rounded-full border border-pine-dark/15 bg-white px-4 py-2 text-sm font-medium text-pine-dark transition hover:bg-pine-light"
                    >
                      + {choice}
                    </button>
                  ))}
              </div>

              {selectedTags.map((tag) => (
                <input key={tag} type="hidden" name="ai_mood_tags" value={tag} />
              ))}
            </section>
          </div>

          <div className="sticky bottom-0 border-t border-black/5 bg-[#f7f8f6]/95 px-6 py-4 backdrop-blur-xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="h-12 flex-1 rounded-2xl bg-pine-dark text-sm font-semibold text-white shadow-[0_14px_26px_rgba(10,47,29,0.18)] transition hover:bg-pine-dark/95"
              >
                {mode === 'create' ? 'Tạo quán' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </div>
  )
}
