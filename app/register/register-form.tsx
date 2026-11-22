"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { readAuthError } from "@/lib/auth-errors";
import { withNotice } from "@/lib/redirects";

function validateForm({
  name,
  email,
  password,
  photoUrl,
}: {
  name: string;
  email: string;
  password: string;
  photoUrl: string;
}): string | null {
  if (!name) {
    return "Please enter your name.";
  }

  if (!email) {
    return "Please enter your email address.";
  }

  if (
    password.length < 6 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password)
  ) {
    return "Password must be at least 6 characters and include uppercase and lowercase letters.";
  }

  if (!photoUrl) {
    return "Please enter a photo URL.";
  }

  try {
    const url = new URL(photoUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "Photo URL must be a valid http(s) URL.";
    }
  } catch {
    return "Photo URL must be a valid http(s) URL.";
  }

  return null;
}

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const photoUrl = String(formData.get("photoUrl") ?? "").trim();

    const validationError = validateForm({ name, email, password, photoUrl });

    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          image: photoUrl,
          rememberMe: true,
        }),
      });

      if (!response.ok) {
        setError(await readAuthError(response));
        setPending(false);
        return;
      }

      const sessionResponse = await fetch("/api/auth/get-session", {
        cache: "no-store",
      });
      const session = sessionResponse.ok
        ? ((await sessionResponse.json()) as { user?: unknown } | null)
        : null;

      if (!session?.user) {
        router.replace(
          `/login?notice=registered&next=${encodeURIComponent(next)}`,
        );
        router.refresh();
        return;
      }

      router.replace(withNotice(next, "registered"));
      router.refresh();
    } catch {
      setError("Unable to create your account right now. Please try again.");
      setPending(false);
    }
  }

  return (
    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
      <div>
        <label
          htmlFor="register-name"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Name
        </label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
          placeholder="Your name"
        />
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="register-password"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
          placeholder="At least 6 characters"
        />
        <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          Use at least 6 characters with an uppercase and a lowercase letter.
        </p>
      </div>

      <div>
        <label
          htmlFor="register-photo"
          className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
        >
          Photo URL
        </label>
        <input
          id="register-photo"
          name="photoUrl"
          type="url"
          autoComplete="url"
          required
          className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
          placeholder="https://example.com/photo.jpg"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
