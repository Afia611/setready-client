"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminEquipmentActions({
  id,
  name,
  status,
}: {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected" | "archived";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (status === "archived") {
    return <span className="text-zinc-500">Archived</span>;
  }

  async function changeListing(action: "approved" | "rejected" | "archive") {
    if (action === "archive" && !window.confirm(`Archive "${name}"? It will be removed from the public catalog.`)) {
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

      const encodedId = encodeURIComponent(id);
      const response = await fetch(
        action === "archive" ? `/api/admin/equipment/${encodedId}` : `/api/admin/equipment?id=${encodedId}`,
        {
          method: action === "archive" ? "DELETE" : "PATCH",
          headers: {
            authorization: `Bearer ${auth.token}`,
            "content-type": "application/json",
          },
          body: action === "archive" ? undefined : JSON.stringify({ status: action }),
        },
      );

      if (!response.ok) {
        const result: { message?: string } | null = await response
          .json()
          .catch(() => null);

        throw new Error(result?.message ?? "Could not update the listing.");
      }

      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not update the listing.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {status === "pending" && (
          <>
            <button type="button" disabled={busy} onClick={() => changeListing("approved")}
              className="rounded-lg border border-emerald-300 px-3 py-2 font-medium text-emerald-800 disabled:opacity-60">
              Approve
            </button>
            <button type="button" disabled={busy} onClick={() => changeListing("rejected")}
              className="rounded-lg border border-red-200 px-3 py-2 font-medium text-red-800 disabled:opacity-60">
              Reject
            </button>
          </>
        )}
        <Link
          href={`/dashboard/admin/equipment/${encodeURIComponent(id)}/edit`}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-medium hover:bg-zinc-50"
        >
          Update
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={() => changeListing("archive")}
          className="rounded-lg border border-red-200 px-3 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Delete
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}
