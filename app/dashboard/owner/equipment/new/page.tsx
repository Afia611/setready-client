"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const categories = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
];

const inputClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950";

const fields = [
  { name: "name", label: "Equipment name" },
  { name: "location", label: "Location" },
  { name: "brand", label: "Brand" },
  { name: "model", label: "Model" },
  { name: "condition", label: "Condition" },
  { name: "imageUrl", label: "Equipment photo URL", type: "url" },
];

type Feedback = { type: "error" | "success"; message: string };

export default function AddEquipmentPage() {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setBusy(true);
    setFeedback(null);

    try {
      const tokenResponse = await fetch("/api/auth/token", {
        cache: "no-store",
      });

      if (!tokenResponse.ok) {
        setFeedback({
          type: "error",
          message: "Could not get your session token. Sign in again and retry.",
        });
        return;
      }

      const { token } = (await tokenResponse.json()) as { token?: string };
      if (!token) {
        throw new Error("Missing session token");
      }

      const response = await fetch("/api/owner/equipment", {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          price: Number(values.price),
          quantity: Number(values.quantity),
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as {
          message?: string;
        };

        setFeedback({
          type: "error",
          message:
            response.status === 403
              ? "Use an Owner account to submit equipment."
              : result.message ?? "Could not submit the listing. Try again.",
        });
        return;
      }

      form.reset();
      setFeedback({
        type: "success",
        message: "Listing submitted. It is pending admin approval.",
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Could not submit the listing. Check that both servers are running.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-3xl">
        <Link href="/dashboard" className="text-sm font-medium text-blue-700">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Add Equipment</h1>

        <form
          onSubmit={submit}
          className="mt-6 grid gap-4 rounded-xl border border-zinc-200 bg-white p-6 sm:grid-cols-2"
        >
          {fields.map(({ name, label, type }) => (
            <label key={name} className="text-sm font-medium">
              {label}
              <input name={name} type={type ?? "text"} required className={inputClass} />
            </label>
          ))}

          <label className="text-sm font-medium">
            Category
            <select name="category" defaultValue="" required className={inputClass}>
              <option value="" disabled>Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium">
            Rental type
            <select name="rentalType" className={inputClass}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>

          <label className="text-sm font-medium">
            Rental price (BDT)
            <input name="price" type="number" min="0.01" step="0.01" required className={inputClass} />
          </label>

          <label className="text-sm font-medium">
            Available quantity
            <input name="quantity" type="number" min="1" step="1" required className={inputClass} />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            Description
            <textarea name="description" rows={3} required className={inputClass} />
          </label>

          <label className="text-sm font-medium sm:col-span-2">
            Rental terms
            <textarea name="rentalTerms" rows={3} required className={inputClass} />
          </label>

          {feedback && (
            <p
              role={feedback.type === "error" ? "alert" : "status"}
              className={
                feedback.type === "error"
                  ? "text-sm text-red-700 sm:col-span-2"
                  : "text-sm text-green-700 sm:col-span-2"
              }
            >
              {feedback.message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="justify-self-start rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit for approval"}
          </button>
        </form>
      </div>
    </main>
  );
}