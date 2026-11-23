import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FavoriteList, type FavoriteItem } from "../../components/favorites";

const loginUrl = "/login?next=%2Fdashboard%2Ffavorites";

async function readFavorites(cookie: string) {
  const apiUrl = (process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000").replace(/\/+$/, "");
  const auth = await fetch(`${apiUrl}/api/auth/token`, { headers: { cookie }, cache: "no-store" });
  if (!auth.ok) return { status: auth.status };

  const { token } = await auth.json();
  const response = await fetch(`${apiUrl}/api/favorites`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return { status: response.status };

  const { data }: { data: FavoriteItem[] } = await response.json();
  return { status: response.status, data };
}

async function FavoritesContent() {
  const cookie = (await headers()).get("cookie");
  if (!cookie) redirect(loginUrl);
  const result = await readFavorites(cookie).catch(() => null);
  if (result?.status === 401) redirect(loginUrl);
  if (result?.status === 403) redirect("/dashboard");
  if (!result?.data) return <p role="alert">Could not load favorites. Try refreshing the page.</p>;
  return <FavoriteList items={result.data} />;
}

export default function FavoritesPage() {
  return (
    <main className="min-h-screen w-full bg-stone-50 text-zinc-950">
      <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8">
        <Link href="/dashboard" className="font-medium text-blue-700 hover:underline">Back to dashboard</Link>
        <h1 className="mt-4 text-3xl font-bold">Favorite equipment</h1>
        <Suspense fallback={<p role="status">Loading favorites…</p>}>
          <FavoritesContent />
        </Suspense>
      </div>
    </main>
  );
}
