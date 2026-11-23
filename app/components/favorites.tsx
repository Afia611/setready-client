"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export type FavoriteItem = {
  id: string;
  name: string;
  category: string;
  available: boolean;
};

export function FavoriteButton({
  equipmentId,
  initialSaved,
  refreshOnRemove = false,
}: {
  equipmentId: string;
  initialSaved: boolean;
  refreshOnRemove?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    setBusy(true);
    setError("");
    try {
      const auth = await fetch("/api/auth/token", { cache: "no-store" });
      if (!auth.ok) throw new Error("Sign in again to change your favorites.");
      const { token } = await auth.json();
      const response = await fetch(`/api/favorites/${encodeURIComponent(equipmentId)}`, {
        method: saved ? "DELETE" : "PUT",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Could not update your favorites. Try again.");
      if (saved && refreshOnRemove) {
        router.refresh();
        return;
      }
      setSaved(!saved);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not update your favorites.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy || (refreshOnRemove && !saved)}
        onClick={toggle}
        className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {busy ? "Saving…" : saved ? "Remove from favorites" : "Add to favorites"}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}

export function FavoriteList({ items }: { items: FavoriteItem[] }) {
  if (!items.length) return <p className="mt-4">You haven’t saved any equipment yet.</p>;

  return (
    <ul className="mt-6 space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
          <div>
            {item.available ? (
              <Link href={`/equipment/${item.id}`} className="font-semibold text-blue-700 hover:underline">{item.name}</Link>
            ) : (
              <span className="font-semibold">{item.name} (unavailable)</span>
            )}
            <p className="mt-1 text-sm text-zinc-600">{item.category}</p>
          </div>
          <FavoriteButton equipmentId={item.id} initialSaved refreshOnRemove />
        </li>
      ))}
    </ul>
  );
}
