"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/equipment", label: "Browse Equipment" },
  { href: "/dashboard", label: "Dashboard" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PublicHeader() {
  const pathname = usePathname();
  const homeActive = pathname === "/";

  return (
    <header className="border-b border-stone-200 bg-white">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5 py-4 sm:px-6"
      >
        <Link
          href="/"
          aria-current={homeActive ? "page" : undefined}
          className={`text-xl font-bold tracking-tight ${
            homeActive
              ? "underline decoration-amber-600 decoration-2 underline-offset-4"
              : ""
          }`}
        >
          Set<span className="text-amber-700">Ready</span>
        </Link>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm font-medium">
          {links.map((link) => {
            const active = isActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-amber-800 underline decoration-2 underline-offset-4"
                    : "text-stone-600 hover:text-zinc-950 hover:underline"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
