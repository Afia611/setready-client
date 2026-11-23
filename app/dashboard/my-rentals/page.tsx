import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

type Rental = {
  id: string;
  equipmentId: string;
  equipmentName: string;
  createdAt: string;
  paymentStatus: "paid" | "unpaid";
  startDate: string;
  endDate: string;
  quantity: number;
  amountMinor: number;
  currency: string;
  status: "awaiting_payment" | "paid" | "expired";
};

const statusLabels = {
  awaiting_payment: "Awaiting payment",
  paid: "Confirmed",
  expired: "Expired",
};

const bookingDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });

const loginUrl = "/login?next=%2Fdashboard%2Fmy-rentals";

export default function MyRentalsPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-6xl">
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
    <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
      <table className="w-full whitespace-nowrap text-left text-sm">
        <thead className="bg-stone-100">
          <tr>
            {["Equipment Name", "Rental Start Date", "Rental End Date", "Booking Date", "Total Amount", "Payment Status", "Booking Status"].map((label) => (
              <th key={label} scope="col" className="p-4">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {rentals.map((rental) => (
            <tr key={rental.id}>
              <td className="p-4 font-semibold">{rental.equipmentName}</td>
              <td className="p-4">{rental.startDate}</td>
              <td className="p-4">{rental.endDate}</td>
              <td className="p-4">{bookingDate.format(new Date(rental.createdAt))}</td>
              <td className="p-4">
                {new Intl.NumberFormat("en-BD", {
                  style: "currency",
                  currency: rental.currency.toUpperCase(),
                }).format(rental.amountMinor / 100)}
              </td>
              <td className="p-4">{rental.paymentStatus === "paid" ? "Paid" : "Unpaid"}</td>
              <td className="p-4">{statusLabels[rental.status]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
