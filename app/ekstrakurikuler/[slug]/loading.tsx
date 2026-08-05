export default function EkstrakurikulerLoading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse">
      {/* Header skeleton */}
      <header className="relative overflow-hidden">
        <div className="h-64 md:h-80 gradient-brand" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="h-5 w-40 rounded-full bg-white/30" />
          <div className="mt-8 h-9 w-72 rounded-lg bg-white/40 md:h-10" />
          <div className="mt-3 h-4 w-48 rounded-lg bg-white/25" />
          <div className="mt-4 h-8 w-80 rounded-full bg-white/20" />
        </div>
      </header>

      {/* Tabs skeleton */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex gap-2 border-b border-slate-200">
          <div className="h-10 w-40 rounded-t-lg bg-slate-200" />
          <div className="h-10 w-32 rounded-t-lg bg-slate-100" />
          <div className="h-10 w-32 rounded-t-lg bg-slate-100" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-4">
          <div className="h-36 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-5 w-24 rounded-full bg-slate-200" />
            <div className="mt-4 h-4 w-48 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-64 rounded bg-slate-100" />
          </div>
          <div className="h-36 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-5 w-24 rounded-full bg-slate-200" />
            <div className="mt-4 h-4 w-48 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-64 rounded bg-slate-100" />
          </div>
          <div className="h-36 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-5 w-24 rounded-full bg-slate-200" />
            <div className="mt-4 h-4 w-48 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-64 rounded bg-slate-100" />
          </div>
        </div>
      </main>
    </div>
  )
}
