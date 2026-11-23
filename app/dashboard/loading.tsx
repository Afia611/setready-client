export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-5xl" role="status">
        <p className="font-semibold">Loading dashboard…</p>
        <div aria-hidden="true" className="mt-5 h-32 rounded-xl bg-stone-200 motion-safe:animate-pulse" />
      </div>
    </main>
  );
}
