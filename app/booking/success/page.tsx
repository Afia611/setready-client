import Link from "next/link";

export default function BookingSuccessPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-3xl font-bold">Returned from Stripe Checkout</h1>
      <p className="mt-4">
        SetReady confirms your booking after verifying the payment with Stripe.
      </p>
      <Link
        href="/dashboard/my-rentals"
        className="mt-6 inline-block font-medium text-blue-700 hover:underline"
      >
        View my rentals
      </Link>
    </main>
  );
}
