"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Listing = {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
};

async function adminRequest(path: string, options: RequestInit = {}) {
  const session = await fetch("/api/auth/token", { cache: "no-store" });

  if (!session.ok) {
    throw new Error("Could not verify your session. Sign in again.");
  }

  const { token } = (await session.json()) as { token?: string };

  if (!token) {
    throw new Error("Sign in as an Admin to review listings.");
  }

  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });

  if (response.status === 403) {
    throw new Error("Only Admin accounts can review listings.");
  }

  if (!response.ok) {
    throw new Error("Could not complete the request. Try again.");
  }

  return response;
}

export default function AdminEquipmentPage() {
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const response = await adminRequest("/api/admin/equipment");
        const { data } = (await response.json()) as { data: Listing[] };

        if (active) setListings(data);
      } catch (failure) {
        if (active) {
          setError(failure instanceof Error ? failure.message : "Could not load listings.");
        }
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  async function review(id: string, status: "approved" | "rejected") {
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await adminRequest(`/api/admin/equipment?id=${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setListings((current) => current?.filter((item) => item.id !== id) ?? []);
      setNotice(`Listing ${status}.`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not update the listing.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm font-medium text-blue-700">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Pending Equipment</h1>

        {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-4 text-green-700">{notice}</p>}
        {listings === null && !error && (
          <p role="status" className="mt-4">Loading listings…</p>
        )}
        {listings?.length === 0 && <p className="mt-4">No listings are waiting for review.</p>}

        <ul className="mt-6 space-y-4">
          {listings?.map((item) => (
            <li key={item.id} className="rounded-xl border border-zinc-200 bg-white p-5">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="mt-1 text-sm text-zinc-600">{item.category} · {item.location}</p>
              <p className="mt-3">{item.description}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => review(item.id, "approved")}
                  className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => review(item.id, "rejected")}
                  className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold disabled:opacity-60"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}