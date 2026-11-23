"use client";

import { useState, type FormEvent } from "react";
import type { AuthUser } from "@/lib/auth";

const inputClass = "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 font-normal";

export default function ProfileForm({ user }: { user: AuthUser }) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [image, setImage] = useState(user.image ?? "");
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    const profile = {
      name: field("name"),
      image: field("image") || null,
      contactEmail: field("contactEmail"),
      phone: field("phone"),
      address: field("address"),
    };
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const response = await fetch("/api/auth/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message ?? "Could not save your profile.");
      }
      setImage(profile.image ?? "");
      setSaved(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
      {/^https?:\/\//i.test(image) && (
        // eslint-disable-next-line @next/next/no-img-element -- Users can save an external profile photo URL.
        <img src={image} alt="Profile photo" referrerPolicy="no-referrer" className="mb-5 size-20 rounded-full object-cover" />
      )}
      <p className="mb-4 text-sm text-zinc-600">Sign-in email: {user.email}</p>
      <fieldset disabled={busy} className="space-y-4">
        <label className="block text-sm font-semibold">
          Name
          <input name="name" defaultValue={user.name} required maxLength={100} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold">
          Contact email
          <input name="contactEmail" type="email" defaultValue={user.contactEmail ?? user.email} maxLength={254} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold">
          Profile image URL
          <input name="image" type="url" defaultValue={user.image ?? ""} maxLength={2048} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold">
          Phone number
          <input name="phone" type="tel" defaultValue={user.phone ?? ""} maxLength={30} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold">
          Address
          <textarea name="address" defaultValue={user.address ?? ""} maxLength={500} className={inputClass} />
        </label>
        <button type="submit" className="rounded-lg bg-amber-300 px-4 py-2 font-semibold disabled:opacity-60">
          {busy ? "Saving…" : "Save profile"}
        </button>
      </fieldset>
      {saved && <p role="status" className="mt-4 text-emerald-800">Profile saved.</p>}
      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    </form>
  );
}
