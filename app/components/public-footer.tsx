import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/equipment", label: "Browse Equipment" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function PublicFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold tracking-tight">
            Set<span className="text-amber-700">Ready</span>
          </p>
          <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
            Rent cameras, lighting, and audio gear from local owners for your
            next production.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-stone-600 hover:text-zinc-950 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
