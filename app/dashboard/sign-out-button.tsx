"use client";

import { useState } from "react";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });

      if (!response.ok) {
        throw new Error("Sign-out failed");
      }

      window.location.replace("/login");
    } catch {
      setError("Could not sign out. Try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-600 disabled:opacity-60"
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

export default SignOutButton;