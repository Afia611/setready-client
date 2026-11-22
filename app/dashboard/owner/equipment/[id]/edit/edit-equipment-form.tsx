"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type Listing = {
  name: string;
  description: string;
  price: number;
  quantity: number;
};

const equipmentUrl = "/dashboard/owner/equipment";
const fieldClass = "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2";

async function requestListing(path: string, changes?: Listing) {
  const session = await fetch("/api/auth/token", { cache: "no-store" });
  const auth = session.ok
    ? ((await session.json()) as { token?: string })
    : null;

  if (!auth?.token) {
    throw new Error("Could not verify your session. Sign in again.");
  }

  const response = await fetch(path, {
    method: changes ? "PATCH" : "GET",
    headers: {
      authorization: `Bearer ${auth.token}`,
      "content-type": "application/json",
    },
    body: changes ? JSON.stringify(changes) : undefined,
    cache: "no-store",
  });

  const result = (await response.json().catch(() => null)) as {
    data?: Listing;
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(
      response.status === 403
        ? "This page is available to Owner accounts."
        : result?.message ?? "Could not complete the request.",
    );
  }

  return result;
}

export default function EditEquipmentPage() {
  const { id } = useParams<{ id: string }>();
  const apiPath = `/api/owner/equipment/${encodeURIComponent(id)}`;
  const [listing, setListing] = useState<Listing | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const result = await requestListing(apiPath);
        if (!result?.data) {
          throw new Error("The server returned no equipment details.");
        }
        if (active) setListing(result.data);
      } catch (failure) {
        if (active) {
          setError(failure instanceof Error ? failure.message : "Could not load the listing.");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [apiPath]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await requestListing(apiPath, {
        name: String(form.get("name") ?? ""),
        description: String(form.get("description") ?? ""),
        price: Number(form.get("price")),
        quantity: Number(form.get("quantity")),
      });
      setNotice(result?.message ?? "Listing saved.");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save the listing.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-xl">
        <Link href={equipmentUrl} className="font-medium text-blue-700 hover:underline">
          Back to My Equipment
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Edit Equipment</h1>

        {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-4 text-green-700">{notice}</p>}
        {!listing && !error && <p role="status" className="mt-4">Loading listing…</p>}

        {listing && (
          <form onChange={() => setNotice("")} onSubmit={save} className="mt-6">
            <fieldset disabled={saving} className="space-y-4 rounded-xl border bg-white p-5">
              <label className="block">
                Equipment name
                <input name="name" defaultValue={listing.name} required className={fieldClass} />
              </label>
              <label className="block">
                Description
                <textarea name="description" defaultValue={listing.description} required rows={4} className={fieldClass} />
              </label>
              <label className="block">
                Rental price (BDT)
                <input name="price" type="number" min="0.01" step="0.01" defaultValue={listing.price} required className={fieldClass} />
              </label>
              <label className="block">
                Quantity
                <input name="quantity" type="number" min="1" step="1" defaultValue={listing.quantity} required className={fieldClass} />
              </label>
              <p className="text-sm text-zinc-600">
                Saving sends this listing back for Admin review.
              </p>
              <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60">
                {saving ? "Saving…" : "Save changes"}
              </button>
            </fieldset>
          </form>
        )}
      </div>
    </main>
  );
}