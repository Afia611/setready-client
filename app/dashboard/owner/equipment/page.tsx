import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import DeleteEquipmentButton from "./delete-equipment-button";
import { connection } from "next/server";

type Listing = {
  id: string;
  name: string;
  category: string;
  price: number;
  rentalType: "daily" | "weekly" | "monthly";
  quantity: number;
  status: "pending" | "approved" | "rejected";
};

const loginUrl = "/login?next=%2Fdashboard%2Fowner%2Fequipment";

const priceFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
});

const rentalPeriods = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

export default function MyEquipmentPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="font-medium text-blue-700 hover:underline">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">My Equipment</h1>

        <Suspense fallback={<p className="mt-4" role="status">Loading equipment…</p>}>
          <OwnerEquipmentList />
        </Suspense>
      </div>
    </main>
  );
}

async function OwnerEquipmentList() {
  await connection();
  const cookie = (await headers()).get("cookie");
  if (!cookie) redirect(loginUrl);

  const apiUrl = (
    process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");

  const session = await fetch(`${apiUrl}/api/auth/token`, {
    headers: { cookie },
    cache: "no-store",
  }).catch(() => null);

  if (session?.status === 401) redirect(loginUrl);

  const sessionData: { token?: string } | null = session?.ok
    ? await session.json().catch(() => null)
    : null;

  if (!sessionData?.token) {
    return <p className="mt-4" role="alert">Could not verify your session.</p>;
  }

  const response = await fetch(`${apiUrl}/api/owner/equipment`, {
    headers: { authorization: `Bearer ${sessionData.token}` },
    cache: "no-store",
  }).catch(() => null);

  if (response?.status === 401) redirect(loginUrl);

  if (response?.status === 403) {
    return <p className="mt-4">My Equipment is available to Owner accounts.</p>;
  }

  const result: { data?: Listing[] } | null = response?.ok
    ? await response.json().catch(() => null)
    : null;

  if (!Array.isArray(result?.data)) {
    return (
      <p className="mt-4" role="alert">
        Could not load your equipment. Refresh to try again.
      </p>
    );
  }

  return (
    <>
      <Link
        href="/dashboard/owner/equipment/new"
        className="mt-5 inline-block rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white"
      >
        Add Equipment
      </Link>

      {result.data.length === 0 ? (
        <p className="mt-5">You haven’t listed any equipment yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100">
              <tr>
                <th scope="col" className="p-4">Equipment</th>
                <th scope="col" className="p-4">Category</th>
                <th scope="col" className="p-4">Rental price</th>
                <th scope="col" className="p-4">Quantity</th>
                <th scope="col" className="p-4">Status</th>
                <th scope="col" className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
  {result.data.map((listing) => (
    <tr key={listing.id} className="border-t border-zinc-200">
      <th scope="row" className="p-4 font-medium">
        <Link
          href={`/dashboard/owner/equipment/${listing.id}/edit`}
          className="text-blue-700 hover:underline"
        >
          {listing.name}
          <span className="sr-only"> (edit listing)</span>
        </Link>
      </th>
      <td className="p-4">{listing.category}</td>
      <td className="whitespace-nowrap p-4">
        {priceFormatter.format(listing.price)} /{" "}
        {rentalPeriods[listing.rentalType]}
      </td>
      <td className="p-4">{listing.quantity}</td>
      <td className="p-4 capitalize">{listing.status}</td>
      <td className="p-4">
        <DeleteEquipmentButton id={listing.id} name={listing.name} />
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      )}
    </>
  );
}