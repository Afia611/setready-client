import { Suspense } from "react";
import { connection } from "next/server";
import PublicFooter from "../components/public-footer";
import PublicHeader from "../components/public-header";
import EquipmentCatalog, { type Equipment } from "./equipment-catalog";

async function getEquipment(): Promise<Equipment[]> {
  const apiUrl = (
    process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");

  const response = await fetch(`${apiUrl}/api/equipment`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Equipment API returned ${response.status}`);
  }

  const result: { data: Equipment[] } = await response.json();
  return result.data;
}

function CatalogLoading() {
  return (
    <div role="status" className="mt-8">
      <span className="sr-only">Loading equipment</span>
      <div aria-hidden="true" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white motion-safe:animate-pulse"
          >
            <div className="aspect-[16/10] bg-stone-200" />
            <div className="space-y-3 p-5">
              <div className="h-3 w-1/3 rounded bg-stone-200" />
              <div className="h-5 w-3/4 rounded bg-stone-200" />
              <div className="h-4 w-1/2 rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function CatalogContent() {
  await connection();
  const equipment = await getEquipment().catch(() => null);

  if (equipment === null) {
    return (
      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        <p role="alert">Equipment is unavailable right now.</p>
        <form action="/equipment" method="get" className="mt-4">
          <button
            type="submit"
            className="rounded-lg bg-amber-300 px-4 py-2 font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Try again
          </button>
        </form>
      </div>
    );
  }

  return <EquipmentCatalog equipment={equipment} />;
}

export default function EquipmentPage() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-zinc-950">
      <PublicHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-6 sm:py-14">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Browse equipment
        </h1>
        <p className="mt-3 text-base text-stone-600 sm:text-lg">
          Find cameras, lighting, and production gear for your next shoot.
        </p>

        <Suspense fallback={<CatalogLoading />}>
          <CatalogContent />
        </Suspense>
      </main>

      <PublicFooter />
    </div>
  );
}