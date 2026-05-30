'use client'

import dynamic from 'next/dynamic'

import type { CoffeeShopRow } from '@/actions/coffee-shops'

const InteractiveDalatMap = dynamic(() => import('@/components/map/InteractiveDalatMap'), {
  ssr: false,
  loading: () => (
    <div className="rounded-4xl bg-white p-6 text-sm text-slate-600 shadow-sm ring-1 ring-black/5">
      Đang tải bản đồ...
    </div>
  ),
})

export default function InteractiveDalatMapShell({ shops }: { shops: CoffeeShopRow[] }) {
  return <InteractiveDalatMap shops={shops} />
}
