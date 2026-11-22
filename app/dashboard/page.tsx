import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getSession } from "@/lib/auth";
import { SignOutButton } from "./sign-out-button";

export const instant = false;

type DashboardPageProps = {
  searchParams: Promise<{
    notice?: string | string[];
  }>;
};

const NOTICES: Record<string, string> = {
  registered: "Account created successfully. Welcome to SetReady.",
  "signed-in": "Signed in successfully.",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  await connection();
  const session = await getSession();

  if (!session) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }

  const params = await searchParams;
  const notice = firstValue(params.notice);
  const noticeMessage = notice ? NOTICES[notice] : undefined;
  const { user } = session;
  const role = user.role ?? "customer";
  const initials = user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="border-b border-black/[.08] bg-white dark:border-white/[.145] dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
          >
            SetReady
          </Link>
          <SignOutButton />
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        {noticeMessage && (
          <p
            role="status"
            className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          >
            {noticeMessage}
          </p>
        )}

        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Welcome, {user.name}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Your email session is active. Refresh this page and you will stay
          signed in.
        </p>

        <section className="mt-8 rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.145] dark:bg-zinc-950">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={`${user.name}'s profile`}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-xl font-semibold text-white dark:bg-zinc-100 dark:text-zinc-950"
              >
                {initials || "SR"}
              </div>
            )}

            <dl className="grid flex-1 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                  Name
                </dt>
                <dd className="mt-1 break-words text-zinc-950 dark:text-zinc-50">
                  {user.name}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                  Email
                </dt>
                <dd className="mt-1 break-all text-zinc-950 dark:text-zinc-50">
                  {user.email}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                  Role
                </dt>
                <dd className="mt-1 capitalize text-zinc-950 dark:text-zinc-50">
                  {role}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </main>
  );
}
