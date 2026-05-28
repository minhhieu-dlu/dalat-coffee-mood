export default function UserAnalysisPage() {
  return (
    <main className="space-y-6">
      <section className="rounded-4xl bg-white p-6 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">User Analytics</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Phân tích người dùng</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Trang này hiển thị các biểu đồ hành vi, cụm mood phổ biến và xu hướng tìm kiếm theo khung giờ để tối ưu đề xuất quán.
        </p>
      </section>
    </main>
  )
}
