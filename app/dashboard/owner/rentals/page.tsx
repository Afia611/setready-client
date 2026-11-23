import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import Pagination, { pageParam, type PageInfo, type RouteQuery } from "@/app/components/pagination";

type Person = { name: string; email: string };

type Rental = {
  id: string;
  equipmentName: string;
  customer: Person | null;
  paymentStatus: "paid" | "unpaid";
  startDate: string;
  endDate: string;
  quantity: number;
  amountMinor: number;
  currency: string;
  status: "awaiting_payment" | "paid" | "expired" | "completed";
};

const statusLabels: Record<Rental["status"], string> = {
  awaiting_payment: "Awaiting payment",
  paid: "Confirmed",
  expired: "Expired",
  completed: "Completed",
};

const loginUrl = "/login?next=%2Fdashboard%2Fowner%2Frentals";

export default function OwnerRentalsPage({ searchParams }: { searchParams: RouteQuery }) {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="font-medium text-blue-700 hover:underline"
        >
          Back to dashboard
        </Link>

        <h1 className="mt-4 text-3xl font-bold">My Equipment Rentals</h1>

        <Suspense
          fallback={
            <p className="mt-4" role="status">
              Loading rentals…
            </p>
          }
        >
          <OwnerRentalList searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function OwnerRentalList({ searchParams }: { searchParams: RouteQuery }) {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    redirect(loginUrl);
  }

  const apiUrl = (
    process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");

  const session = await fetch(`${apiUrl}/api/auth/token`, {
    headers: { cookie },
    cache: "no-store",
  }).catch(() => null);

  if (session?.status === 401) {
    redirect(loginUrl);
  }

  if (!session?.ok) {
    return (
      <p className="mt-4" role="alert">
        Could not check your session. Refresh to try again.
      </p>
    );
  }

  const sessionData: { token?: string } | null = await session
    .json()
    .catch(() => null);

  if (!sessionData?.token) {
    redirect(loginUrl);
  }

  const page = pageParam((await searchParams).page);
  const response = await fetch(`${apiUrl}/api/owner/rentals?page=${encodeURIComponent(page)}`, {
    headers: { authorization: `Bearer ${sessionData.token}` },
    cache: "no-store",
  }).catch(() => null);

  if (response?.status === 401) {
    redirect(loginUrl);
  }

  if (response?.status === 403) {
    return (
      <p className="mt-4">This page is available to Owner accounts.</p>
    );
  }

  const result: { data?: Rental[]; pagination?: PageInfo } | null = response?.ok
    ? await response.json().catch(() => null)
    : null;

  if (!Array.isArray(result?.data)) {
    return (
      <p className="mt-4" role="alert">
        Could not load rentals. Refresh to try again.
      </p>
    );
  }

  const rentals = result.data;

  if (rentals.length === 0) {
    return (
      <p className="mt-4">There are no rentals for your equipment yet.</p>
    );
  }

  return (
    <>
      <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-100">
            <tr>
              <th scope="col" className="p-4">Customer</th>
            <th scope="col" className="p-4">Equipment</th>
              <th scope="col" className="p-4">Rental duration</th>
              <th scope="col" className="p-4">Quantity</th>
              <th scope="col" className="p-4">Booking amount</th>
              <th scope="col" className="p-4">Booking status</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr key={rental.id} className="border-t border-zinc-200">
                <td className="p-4">
                <p className="font-medium">{rental.customer?.name ?? "Unavailable"}</p>
                {rental.customer?.email && <p className="text-zinc-600">{rental.customer.email}</p>}
              </td>
              <td className="p-4 font-medium">{rental.equipmentName}</td>
                <td className="whitespace-nowrap p-4">
                  {rental.startDate} to {rental.endDate}
                  <p className="text-zinc-600">
                    {Math.round((Date.parse(rental.endDate) - Date.parse(rental.startDate)) / 86_400_000) + 1} days
                  </p>
                </td>
                <td className="p-4">{rental.quantity}</td>
                <td className="whitespace-nowrap p-4">
                  {new Intl.NumberFormat("en-BD", {
                    style: "currency",
                    currency: rental.currency.toUpperCase(),
                  }).format(rental.amountMinor / 100)}
                </td>
                <td className="whitespace-nowrap p-4">{rental.paymentStatus === "paid" ? "Paid" : "Unpaid"}</td>
              <td className="whitespace-nowrap p-4">{statusLabels[rental.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination path="/dashboard/owner/rentals" pagination={result.pagination} />
    </>
  );
}