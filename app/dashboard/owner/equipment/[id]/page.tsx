import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { EquipmentPhoto, type Equipment } from "@/app/equipment/equipment-card";

type Listing = Omit<Equipment, "id"> & {
  description: string;
  status: string;
  model: string;
  condition: string;
  rentalTerms: string;
};

async function Details({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{24}$/i.test(id)) notFound();
  const login = `/login?next=%2Fdashboard%2Fowner%2Fequipment%2F${id}`;
  const cookie = (await headers()).get("cookie");
  if (!cookie) redirect(login);

  const api = (process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000").replace(/\/+$/, "");
  const session = await fetch(`${api}/api/auth/token`, { headers: { cookie }, cache: "no-store" });
  if (session.status === 401) redirect(login);
  if (!session.ok) throw new Error("Could not verify your session.");
  const { token } = await session.json();
  if (!token) redirect(login);

  const response = await fetch(`${api}/api/owner/equipment/${id}`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (response.status === 401) redirect(login);
  if (response.status === 403 || response.status === 404) notFound();
  if (!response.ok) throw new Error("Could not load your listing.");

  const { data: listing }: { data: Listing } = await response.json();
  const price = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(listing.price);
  return (
    <article className="mt-5 overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <EquipmentPhoto item={listing} />
      <div className="p-6">
        <p className="font-semibold capitalize text-amber-900">{listing.status}</p>
        <h1 className="mt-2 text-3xl font-bold">{listing.name}</h1>
        <p className="mt-3">{listing.category} · {listing.location}</p>
        <p>{listing.brand} {listing.model} · {listing.condition}</p>
        <p>{price} ({listing.rentalType}) · {listing.quantity} available</p>
        <p className="mt-4 whitespace-pre-wrap">{listing.description}</p>
        <h2 className="mt-5 font-semibold">Rental terms</h2>
        <p className="whitespace-pre-wrap">{listing.rentalTerms}</p>
        <Link href={`/dashboard/owner/equipment/${id}/edit`} className="mt-5 inline-block text-blue-700 hover:underline">Update listing</Link>
      </div>
    </article>
  );
}

export default function OwnerEquipmentDetails({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="min-h-screen bg-stone-50 p-6 text-zinc-950">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard/owner/equipment" className="text-blue-700 hover:underline">Back to My Equipment</Link>
        <Suspense fallback={<p role="status" className="mt-4">Loading equipment…</p>}>
          <Details params={params} />
        </Suspense>
      </div>
    </main>
  );
}
