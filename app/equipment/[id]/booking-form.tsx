"use client";

import { useRef, useState, type FormEvent } from "react";

type Quote = {
  days: number;
  quantity: number;
  currency: string;
  total: number;
};

type BookingResponse = {
  data?: Quote;
  url?: string;
  message?: string;
};

const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950";
const buttonClass =
  "rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60";

export default function BookingForm({ equipmentId }: { equipmentId: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const checkoutKey = useRef<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (busy) return;

    const form = new FormData(event.currentTarget);
    const startDate = String(form.get("startDate") ?? "");
    const endDate = String(form.get("endDate") ?? "");
    const quantity = Number(form.get("quantity"));
    const contactNumber = String(form.get("contactNumber") ?? "").trim();
    const deliveryAddress = String(form.get("deliveryAddress") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const wantsCheckout = submitter?.getAttribute("value") === "checkout";

    setError("");

    if (!startDate || !endDate || endDate < startDate) {
      setError("Choose an end date on or after the start date.");
      return;
    }

    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      setError("Enter a positive whole number for quantity.");
      return;
    }

    if (!wantsCheckout) setQuote(null);
    setBusy(true);

    try {
      const session = await fetch("/api/auth/token", { cache: "no-store" });

      if (session.status === 401) {
        throw new Error("Your session expired. Sign in and try again.");
      }

      if (!session.ok) {
        throw new Error("Could not verify your session. Try again.");
      }

      const { token } = (await session.json()) as { token?: string };

      if (!token) {
        throw new Error("Sign in and try again.");
      }

      const rental = { equipmentId, startDate, endDate, quantity };

      if (wantsCheckout) {
        checkoutKey.current ??= crypto.randomUUID();
      }

      const response = await fetch(
        wantsCheckout ? "/api/bookings/checkout" : "/api/bookings/quote",
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "content-type": "application/json",
          },
          body: JSON.stringify(
            wantsCheckout ? { ...rental, contactNumber, deliveryAddress, notes, checkoutKey: checkoutKey.current } : rental,
          ),
        },
      );

      const result = (await response.json().catch(() => null)) as
        | BookingResponse
        | null;

      if (response.status === 403) {
        throw new Error("Sign in with a Customer account to book equipment.");
      }

      if (!response.ok) {
        throw new Error(result?.message ?? "Could not process the rental. Try again.");
      }

      if (wantsCheckout) {
        if (!result?.url) {
          throw new Error("Checkout did not return a payment link.");
        }

        window.location.assign(result.url);
        return;
      }

      if (!result?.data) {
        throw new Error("The booking API did not return a quote.");
      }

      setQuote(result.data);
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not process the rental.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" className={buttonClass} onClick={() => dialog.current?.showModal()}>
        Book Now
      </button>

      <dialog
        ref={dialog}
        aria-labelledby="booking-heading"
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl p-6 backdrop:bg-black/60"
        onCancel={(event) => { if (busy) event.preventDefault(); }}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="booking-heading" className="text-xl font-bold">Book equipment</h2>
          <button type="button" disabled={busy} onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
        <form
          onSubmit={submit}
          onChange={() => {
            setQuote(null);
            setError("");
            checkoutKey.current = null;
          }}
          className="mt-4"
        >
          <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium">
              Rental start date
              <input name="startDate" type="date" required className={inputClass} />
            </label>

            <label className="text-sm font-medium">
              Rental end date
              <input name="endDate" type="date" required className={inputClass} />
            </label>

            <label className="text-sm font-medium">
              Required quantity
              <input
                name="quantity"
                type="number"
                min="1"
                step="1"
                defaultValue="1"
                required
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium sm:col-span-3">
              Contact number
              <input name="contactNumber" type="tel" required maxLength={25} className={inputClass} />
            </label>
            <label className="text-sm font-medium sm:col-span-3">
              Delivery address
              <textarea name="deliveryAddress" required maxLength={500} className={inputClass} />
            </label>
            <label className="text-sm font-medium sm:col-span-3">
              Additional notes (optional)
              <textarea name="notes" maxLength={1000} className={inputClass} />
            </label>

            <div className="flex flex-wrap gap-3 sm:col-span-3">
              <button type="submit" value="quote" className={buttonClass}>
                {busy ? "Please wait…" : "Get rental quote"}
              </button>

              {quote && (
                <button type="submit" value="checkout" className={buttonClass}>
                  Pay with Stripe
                </button>
              )}
            </div>
          </fieldset>

          {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}

          {quote && (
            <div role="status" className="mt-4 rounded-lg bg-blue-50 p-4">
              <p className="font-semibold">
                Estimated total{" "}
                {new Intl.NumberFormat("en-BD", {
                  style: "currency",
                  currency: quote.currency,
                }).format(quote.total)}
              </p>
              <p className="mt-1 text-sm text-zinc-700">
                {quote.days} {quote.days === 1 ? "rental day" : "rental days"} ·{" "}
                {quote.quantity} {quote.quantity === 1 ? "unit" : "units"}
              </p>
            </div>
          )}
        </form>
      </dialog>
    </div>
  );
}