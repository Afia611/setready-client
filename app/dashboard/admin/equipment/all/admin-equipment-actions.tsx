"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminEquipmentActions({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!active) {
    return <span className="text-zinc-500">Archived</span>;
  }

  async function archiveListing() {
    if (!window.confirm(`Archive "${name}"? It will be removed from the public catalog.`)) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const session = await fetch("/api/auth/token", { cache: "no-store" });
      const auth: { token?: string } | null = session.ok
        ? await session.json().catch(() => null)
        : null;

      if (!auth?.token) {
        throw new Error("Please sign in as an Admin again.");
      }

      const response = await fetch(
        `/api/admin/equipment/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${auth.token}` },
        },
      );

      if (!response.ok) {
        const result: { message?: string } | null = await response
          .json()
          .catch(() => null);

        throw new Error(result?.message ?? "Could not archive the listing.");
      }

      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not archive the listing.",
      );
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/dashboard/admin/equipment/${encodeURIComponent(id)}/edit`}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-medium hover:bg-zinc-50"
        >
          Edit
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={archiveListing}
          className="rounded-lg border border-red-200 px-3 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {busy ? "Archiving…" : "Archive"}
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
