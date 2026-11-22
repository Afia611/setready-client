"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteEquipmentButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function removeListing() {
    if (!window.confirm(`Remove "${name}" from your equipment listings?`)) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const session = await fetch("/api/auth/token", { cache: "no-store" });
      const auth: { token?: string } | null = session.ok
        ? await session.json()
        : null;

      if (!auth?.token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch(
        `/api/owner/equipment/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: { authorization: `Bearer ${auth.token}` },
        },
      );

      if (!response.ok) {
        const result: { message?: string } | null = await response
          .json()
          .catch(() => null);

        throw new Error(result?.message ?? "Could not remove the listing.");
      }

      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not remove the listing.",
      );
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={removeListing}
        className="rounded-lg border border-red-200 px-3 py-2 font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        {busy ? "Removing…" : "Delete"}
      </button>
      {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
  );
}