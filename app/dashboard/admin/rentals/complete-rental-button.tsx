"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CompleteRentalButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");

  async function complete() {
    setPending(true);
    setError("");
    try {
      const session = await fetch("/api/auth/token", { cache: "no-store" });
      if (!session.ok) throw new Error("Sign in again to complete the rental.");
      const { token } = await session.json();
      if (!token) throw new Error("Sign in again to complete the rental.");
      const response = await fetch(`/api/admin/rentals/${encodeURIComponent(id)}/complete`, {
        method: "PATCH",
        headers: { authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? "Could not complete the rental.");
      }
      setCompleted(true);
      router.refresh();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not complete the rental.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" disabled={pending || completed} onClick={complete}
        className="rounded-lg border border-zinc-300 px-3 py-2 font-medium hover:bg-stone-100 disabled:opacity-60">
        {completed ? "Completed" : pending ? "Completing…" : "Mark complete"}
      </button>
      {error && <p role="alert" className="mt-1 text-red-700">{error}</p>}
    </>
  );
}
