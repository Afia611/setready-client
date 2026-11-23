import Image from "next/image";
import Link from "next/link";
import PublicFooter from "./components/public-footer";
import PublicHeader from "./components/public-header";

const steps = [
  {
    title: "Browse",
    description:
      "Find cameras, lighting, and audio gear that fit your production.",
  },
  {
    title: "Book",
    description:
      "Choose your dates and quantity, then pay securely through Stripe Checkout.",
  },
  {
    title: "Pick up",
    description:
      "Coordinate pickup with the owner and get ready to shoot.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-zinc-950">
      <PublicHeader />

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
              Production gear rentals
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Cameras, lighting, and audio gear for your next shoot.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-600 sm:text-lg">
              Book trusted equipment from local owners and pick it up when you
              are ready.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/equipment"
                className="rounded-lg bg-amber-300 px-5 py-3 font-semibold text-zinc-950 hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
              >
                Browse equipment
              </Link>
              <a
                href="#how-it-works"
                className="font-medium text-amber-800 hover:underline"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <Image
              src="/images/sony-a7iv.jpg.jpg"
              alt="Sony A7 IV camera kit"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-6 sm:p-10"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </section>

        <section
          id="how-it-works"
          aria-labelledby="how-it-works-heading"
          className="border-y border-stone-200 bg-white"
        >
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
            <h2
              id="how-it-works-heading"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              How it works
            </h2>
            <p className="mt-2 max-w-2xl text-stone-600">
              Three steps from finding the right gear to shooting.
            </p>

            <ol className="mt-8 grid gap-5 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-6"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300 font-semibold text-zinc-950"
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-stone-200 bg-white px-6 py-8 sm:flex-row sm:items-center sm:px-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Ready to find your gear?
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                Browse available equipment and book your next rental.
              </p>
            </div>
            <Link
              href="/equipment"
              className="rounded-lg bg-amber-300 px-5 py-3 font-semibold text-zinc-950 hover:bg-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
            >
              Browse equipment
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
