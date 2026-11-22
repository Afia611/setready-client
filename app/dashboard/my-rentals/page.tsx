import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type Rental = {
  id: string;
  equipmentId: string;
  startDate: string;
  endDate: string;
  quantity: number;
  amountMinor: number;
  currency: string;
  status: "awaiting_payment" | "paid" | "expired";
};

const statusLabels = {
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  expired: "Expired",
};

const loginUrl = "/login?next=%2Fdashboard%2Fmy-rentals";

export default function MyRentalsPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="font-medium text-blue-700 hover:underline">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">My Rentals</h1>
        <Suspense fallback={<p role="status" className="mt-4">Loading rentals…</p>}>
          <RentalList />
        </Suspense>
      </div>
    </main>
  );
}

async function RentalList() {
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

  if (!session?.ok) {
    return <p role="alert" className="mt-4">Could not check your session. Refresh to try again.</p>;
  }

  const { token } = (await session.json()) as { token?: string };
  if (!token) redirect(loginUrl);

  const response = await fetch(`${apiUrl}/api/bookings/mine`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  }).catch(() => null);

  if (response?.status === 401) redirect(loginUrl);

  if (response?.status === 403) {
    return <p className="mt-4">My Rentals is available to Customer accounts.</p>;
  }

  if (!response?.ok) {
    return <p role="alert" className="mt-4">Could not load rentals. Refresh to try again.</p>;
  }

  const { data: rentals } = (await response.json()) as { data: Rental[] };

  if (!rentals.length) {
    return (
      <p className="mt-4">
        You haven’t booked any equipment yet.{" "}
        <Link href="/equipment" className="text-blue-700 underline">Browse equipment</Link>
      </p>
    );
  }

  return (
    <ul className="mt-6 grid gap-4 sm:grid-cols-2">
      {rentals.map((rental) => (
        <li key={rental.id} className="rounded-xl border border-zinc-200 bg-white p-5">
          <p className="font-semibold">{statusLabels[rental.status]}</p>
          <p className="mt-2">{rental.startDate} to {rental.endDate}</p>
          <p className="text-sm text-zinc-600">
            {rental.quantity} {rental.quantity === 1 ? "unit" : "units"}
          </p>
          <p className="mt-2 font-medium">
            {new Intl.NumberFormat("en-BD", {
              style: "currency",
              currency: rental.currency.toUpperCase(),
            }).format(rental.amountMinor / 100)}
          </p>
          <Link
            href={`/equipment/${rental.equipmentId}`}
            className="mt-3 inline-block text-sm text-blue-700 underline"
          >
            View equipment
          </Link>
        </li>
      ))}
    </ul>
  );
}