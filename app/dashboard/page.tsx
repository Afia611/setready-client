import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "./sign-out-button";

type DashboardProps = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

type DashboardSession = {
  user?: {
    name?: string;
    email?: string;
    role?: string;
  };
};

type Role = "customer" | "owner" | "admin";

const sections: Record<Role, { label: string; href: string }[]> = {
  customer: [
    { label: "My Rentals", href: "/dashboard/my-rentals" },
  ],
  owner: [
    { label: "My Equipment", href: "/dashboard/owner/equipment" },
    { label: "Add Equipment", href: "/dashboard/owner/equipment/new" },
    { label: "My Equipment Rentals", href: "/dashboard/owner/rentals" },
  ],
  admin: [
    { label: "Manage Users", href: "/dashboard/admin/users" },
    { label: "Pending Equipment", href: "/dashboard/admin/equipment" },
    { label: "All Equipment", href: "/dashboard/admin/equipment/all" },
  ],
};

const loginUrl = "/login?next=%2Fdashboard";

export default function DashboardPage({ searchParams }: DashboardProps) {
  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="text-xl font-bold">
            SetReady
          </Link>
          <Link
            href="/equipment"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            Browse equipment
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Suspense fallback={<p role="status">Loading your dashboard…</p>}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function DashboardContent({ searchParams }: DashboardProps) {
  const cookie = (await headers()).get("cookie");

  if (!cookie) {
    redirect(loginUrl);
  }

  const apiUrl = (
    process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");

  const response = await fetch(`${apiUrl}/api/auth/get-session`, {
    headers: { cookie },
    cache: "no-store",
  }).catch(() => null);

  if (response?.status === 401) {
    redirect(loginUrl);
  }

  if (!response?.ok) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">
        Could not load your session. Check that Express is running and refresh.
      </p>
    );
  }

  let session: DashboardSession | null;

  try {
    session = (await response.json()) as DashboardSession | null;
  } catch {
    return <p role="alert">Could not read your session. Refresh to try again.</p>;
  }

  if (!session?.user) {
    redirect(loginUrl);
  }

  const { name, email, role } = session.user;
  const { notice } = await searchParams;
  const links =
    role === "customer" || role === "owner" || role === "admin"
      ? sections[role]
      : [];

  return (
    <>
      {notice === "signed-in" && (
        <p role="status" className="mb-6 rounded-lg bg-green-50 p-4 text-green-800">
          Signed in successfully.
        </p>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome, {name || "there"}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">{email}</p>
          {role && (
            <p className="mt-1 text-sm font-semibold capitalize text-blue-700">
              {role}
            </p>
          )}
        </div>

        <SignOutButton />
      </div>

      {links.length > 0 ? (
        <nav aria-label="Dashboard sections" className="mt-8">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map(({ label, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block h-full rounded-xl border border-zinc-200 bg-white p-5 font-semibold text-blue-700 hover:border-blue-600 hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <p className="mt-6 text-zinc-600">
          No dashboard sections are available for this account.
        </p>
      )}
    </>
  );
}