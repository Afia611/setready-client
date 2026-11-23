import BookingForm from "./booking-form";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import PublicFooter from "../../components/public-footer";
import PublicHeader from "../../components/public-header";

type Listing = {
  name: string;
  description: string;
  category: string;
  location: string;
  condition: string;
  brand: string;
  model: string;
  price: number;
  rentalType: "daily" | "weekly" | "monthly";
  quantity: number;
  rentalTerms: string;
};

const periods = { daily: "day", weekly: "week", monthly: "month" };

export default function EquipmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-zinc-950">
      <PublicHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <Link href="/equipment" className="font-medium text-blue-700">
            Back to equipment
          </Link>

          <Suspense fallback={<p className="mt-6" role="status">Loading equipmentâ€¦</p>}>
              <EquipmentDetails params={params} />
          </Suspense>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

async function EquipmentDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^[a-f0-9]{24}$/i.test(id)) {
    notFound();
  }

  const apiUrl = (process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000")
    .replace(/\/+$/, "");
  const loginUrl = `/login?next=${encodeURIComponent(`/equipment/${id}`)}`;
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    redirect(loginUrl);
  }

  let listing: Listing | undefined;
  let status = 0;

  try {
    const session = await fetch(`${apiUrl}/api/auth/token`, {
      headers: { cookie },
      cache: "no-store",
    });

    status = session.status;

    if (session.ok) {
      const { token } = (await session.json()) as { token: string };
      const response = await fetch(`${apiUrl}/api/equipment/${id}`, {
        headers: { authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      status = response.status;
      if (response.ok) {
        const result: { data: Listing } = await response.json();
        listing = result.data;
      }
    }
  } catch {
    return <p className="mt-6" role="alert">Could not reach the equipment API. Try again.</p>;
  }

  if (status === 401) {
    redirect(loginUrl);
  }

  if (status === 404) {
    notFound();
  }

  if (!listing) {
    return <p className="mt-6" role="alert">Could not load this listing. Try again.</p>;
  }

  const price = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
  }).format(listing.price);

  return (
    <article className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
      <p className="text-sm font-medium text-blue-700">{listing.category}</p>
      <h1 className="mt-2 text-3xl font-bold">{listing.name}</h1>
      <p className="mt-1 text-zinc-600">{listing.location}</p>
      <p className="mt-4 font-semibold">{price} / {periods[listing.rentalType]}</p>
      <p className="mt-1 text-sm text-zinc-600">{listing.quantity} units listed</p>
      <p className="mt-5">{listing.description}</p>
      <p className="mt-3 text-sm text-zinc-600">
        {listing.brand} {listing.model} Â· {listing.condition}
      </p>
      <h2 className="mt-6 text-lg font-semibold">Rental terms</h2>
      <p className="mt-2 whitespace-pre-line">{listing.rentalTerms}</p>
      <BookingForm equipmentId={id} />
    </article>
  );
}