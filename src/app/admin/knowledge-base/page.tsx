export default function KnowledgeBasePage() {
  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_rgba(10,47,29,0.08)] ring-1 ring-black/5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Knowledge Base</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Cơ sở dữ liệu</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Khu vực này dùng để quản trị tài nguyên tri thức cho hệ thống RAG: bài viết, mood tags, kiến thức không gian và các nguồn dữ liệu tham chiếu.
        </p>
      </section>
    </main>
  )
}
