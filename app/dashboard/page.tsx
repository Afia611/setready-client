import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
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
type AnalyticsRole = "admin" | "owner";

type MoneyTotal = {
  currency: string;
  amountMinor: number;
};

type AdminAnalytics = {
  totalUsers: number;
  totalEquipment: number;
  totalBookings: number;
  pendingApprovals: number;
  completedRentals: number;
  totalRevenue: MoneyTotal[];
  monthlyBookings: { month: string; count: number }[];
};

type OwnerAnalytics = {
  totalListedEquipment: number;
  completedRentals: number;
  totalEarnings: MoneyTotal[];
  monthlyEarnings: (MoneyTotal & { month: string })[];
};

type ChartBar = {
  month: string;
  value: number;
  label: string;
};

const sections: Record<Role, { label: string; href: string }[]> = {
  customer: [
    { label: "My Rentals", href: "/dashboard/my-rentals" },
    { label: "Favorites", href: "/dashboard/favorites" },
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
const countFormat = new Intl.NumberFormat("en-BD");

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

      {(role === "admin" || role === "owner") && (
        <Suspense
          fallback={<p role="status" className="mt-8">Loading analytics…</p>}
        >
          <DashboardAnalytics apiUrl={apiUrl} cookie={cookie} role={role} />
        </Suspense>
      )}
    </>
  );
}

function formatMoney({ currency, amountMinor }: MoneyTotal) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: currency.toUpperCase(),
    currencyDisplay: "code",
  }).format(amountMinor / 100);
}

function formatTotals(totals: MoneyTotal[]) {
  return totals.length ? totals.map(formatMoney).join(" · ") : "BDT 0";
}

function MonthlyChart({ title, bars }: { title: string; bars: ChartBar[] }) {
  const max = bars.reduce((largest, { value }) => Math.max(largest, value), 1);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="font-semibold">{title}</h3>

      {bars.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-600">No monthly data yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {bars.map(({ month, value, label }) => (
            <li key={month}>
              <div className="mb-1 flex justify-between gap-3 text-sm">
                <span>{month}</span>
                <span className="font-medium tabular-nums">{label}</span>
              </div>
              <div aria-hidden="true" className="h-2 rounded-full bg-blue-100">
                <div
                  className="h-full rounded-full bg-blue-700"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function DashboardAnalytics({
  apiUrl,
  cookie,
  role,
}: {
  apiUrl: string;
  cookie: string;
  role: AnalyticsRole;
}) {
  try {
    const tokenResponse = await fetch(`${apiUrl}/api/auth/token`, {
      headers: { cookie },
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      throw new Error("Could not obtain an analytics token.");
    }

    const { token } = (await tokenResponse.json()) as { token?: string };

    if (typeof token !== "string" || !token) {
      throw new Error("Missing analytics token.");
    }

    const response = await fetch(`${apiUrl}/api/${role}/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Analytics request returned ${response.status}.`);
    }

    const payload = (await response.json()) as {
      success: boolean;
      data?: AdminAnalytics | OwnerAnalytics;
    };

    if (!payload.success || !payload.data) {
      throw new Error("Analytics response is missing data.");
    }

    let metrics: [string, string][];
    let charts: ReactNode;

    if (role === "admin") {
      const data = payload.data as AdminAnalytics;

      metrics = [
        ["Total users", countFormat.format(data.totalUsers)],
        ["Total equipment", countFormat.format(data.totalEquipment)],
        ["Total bookings", countFormat.format(data.totalBookings)],
        ["Pending approvals", countFormat.format(data.pendingApprovals)],
        ["Completed rentals", countFormat.format(data.completedRentals)],
        ["Total revenue", formatTotals(data.totalRevenue)],
      ];

      charts = (
        <MonthlyChart
          title="Monthly bookings"
          bars={data.monthlyBookings.map(({ month, count }) => ({
            month,
            value: count,
            label: countFormat.format(count),
          }))}
        />
      );
    } else {
      const data = payload.data as OwnerAnalytics;

      metrics = [
        ["Listed equipment", countFormat.format(data.totalListedEquipment)],
        ["Completed rentals", countFormat.format(data.completedRentals)],
        ["Total earnings", formatTotals(data.totalEarnings)],
      ];

      const currencies = [
        ...new Set(data.monthlyEarnings.map(({ currency }) => currency)),
      ];

      charts = currencies.length ? (
        currencies.map((currency) => (
          <MonthlyChart
            key={currency}
            title={`Monthly earnings (${currency.toUpperCase()})`}
            bars={data.monthlyEarnings
              .filter((entry) => entry.currency === currency)
              .map((entry) => ({
                month: entry.month,
                value: entry.amountMinor,
                label: formatMoney(entry),
              }))}
          />
        ))
      ) : (
        <MonthlyChart title="Monthly earnings" bars={[]} />
      );
    }

    return (
      <section aria-labelledby="analytics-heading" className="mt-10">
        <h2 id="analytics-heading" className="text-2xl font-bold">
          {role === "admin" ? "Platform analytics" : "Rental analytics"}
        </h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-zinc-200 bg-white p-5"
            >
              <dt className="text-sm text-zinc-600">{label}</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 grid gap-4">{charts}</div>
      </section>
    );
  } catch {
    return (
      <p role="alert" className="mt-8 rounded-lg bg-red-50 p-4 text-red-800">
        Could not load analytics. Refresh to try again.
      </p>
    );
  }
}