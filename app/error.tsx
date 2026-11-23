"use client";

import Link from "next/link";

export default function RouteError({ retry }: { retry: () => void }) {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-12 text-zinc-950">
      <div className="mx-auto max-w-xl rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-bold">This page could not load</h1>
        <p className="mt-2 text-zinc-600">Try loading the page again.</p>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button type="button" onClick={retry} className="rounded-lg bg-amber-300 px-4 py-2 font-semibold">
            Try again
          </button>
          <Link href="/" className="text-blue-700 hover:underline">Back to home</Link>
        </div>
      </div>
    </main>
  );
}
