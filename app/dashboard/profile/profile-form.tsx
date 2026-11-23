"use client";

import { useState, type FormEvent } from "react";
import type { AuthUser } from "@/lib/auth";

const inputClass = "mt-1 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-normal text-zinc-950";

export default function ProfileForm({ user }: { user: AuthUser }) {
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [image, setImage] = useState(user.image ?? "");
  const [failedImage, setFailedImage] = useState("");
  const [name, setName] = useState(user.name);
  const [error, setError] = useState("");
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

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
      setName(profile.name);
      setFailedImage("");
      setSaved(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="mt-6 w-full rounded-xl border border-zinc-200 bg-white p-5 text-zinc-950 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-zinc-200 pb-6">
        {/^https?:\/\//i.test(image) && image !== failedImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- Users can save an external profile photo URL.
          <img src={image} alt="Profile photo" referrerPolicy="no-referrer" onError={() => setFailedImage(image)}
            className="size-16 rounded-full object-cover" />
        ) : (
          <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-full bg-amber-100 text-xl font-bold text-amber-900">
            {initials || "?"}
          </span>
        )}
        <div className="min-w-0">
          <p className="font-semibold">{name}</p>
          <p className="break-all text-sm text-zinc-600">Sign-in email: {user.email}</p>
        </div>
      </div>
      <fieldset disabled={busy} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Name
          <input name="name" defaultValue={user.name} required maxLength={100} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold">
          Contact email
          <input name="contactEmail" type="email" defaultValue={user.contactEmail ?? user.email} maxLength={254} className={inputClass} />
        </label>
        <label className="block min-w-0 text-sm font-semibold sm:col-span-2">
          Profile image URL
          <input name="image" type="url" defaultValue={user.image ?? ""} maxLength={2048} className={inputClass} />
          <span className="mt-1 block text-xs font-normal text-zinc-600">Use a publicly accessible link to the image itself.</span>
        </label>
        <label className="block text-sm font-semibold">
          Phone number
          <input name="phone" type="tel" defaultValue={user.phone ?? ""} maxLength={30} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold sm:col-span-2">
          Address
          <textarea name="address" defaultValue={user.address ?? ""} maxLength={500} className={inputClass} />
        </label>
        <button type="submit" className="rounded-lg bg-amber-300 px-4 py-2 font-semibold text-zinc-950 hover:bg-amber-400 disabled:opacity-60 sm:justify-self-start">
          {busy ? "Saving…" : "Save profile"}
        </button>
      </fieldset>
      {saved && <p role="status" className="mt-4 text-emerald-800">Profile saved.</p>}
      {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
    </form>
  );
}
