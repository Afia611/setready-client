import Image from "next/image";
import Link from "next/link";
import PublicFooter from "./components/public-footer";
import PublicHeader from "./components/public-header";
import HomeBenefitsReviews from "./components/home-benefits-reviews";

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

const benefits = [
  ["Clear rental rates", "Compare listed prices and review the total before paying."],
  ["Reviewed listings", "Equipment listings go through approval before they appear in the catalog."],
  ["Flexible rental periods", "Choose dates and browse daily, weekly, or monthly rates."],
  ["Secure checkout", "Complete your payment through Stripe Checkout."],
];

const sampleReviews = [
  { name: "Nadia R.", rating: 5, comment: "I booked a camera and lens for a weekend shoot. The pickup instructions made it easy to plan." },
  { name: "Imran H.", rating: 5, comment: "The lighting kit was easy to compare with other listings, and I could see the full price before booking." },
  { name: "Tania S.", rating: 4, comment: "I rented a wireless mic for an interview. The owner confirmed what was included before pickup." },
  { name: "Rafi K.", rating: 5, comment: "A weekly rental gave me enough time to finish filming without rushing to return the gear." },
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
              <HomeBenefitsReviews />
              <a
                href="#how-it-works"
                className="font-medium text-amber-800 hover:underline"
              >
                How it works
              </a>
            </div>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <Image
              src="/images/Hero.jpg"
              alt="" 
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </section>

        <section id="why-choose-us" aria-labelledby="benefits-heading" className="bg-zinc-950 text-white">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
            <h2 id="benefits-heading" className="text-3xl font-bold tracking-tight">
              Why choose SetReady?
            </h2>
            <dl className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map(([title, description]) => (
                <div key={title} className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                  <dt className="font-semibold text-amber-300">{title}</dt>
                  <dd className="mt-2 text-sm leading-6 text-zinc-300">{description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="customer-reviews" aria-labelledby="reviews-heading" className="bg-stone-100">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
            <h2 id="reviews-heading" className="text-3xl font-bold tracking-tight">
              Customer reviews
            </h2>
            <p className="mt-2 text-sm text-stone-600">Fictional reviews for the SetReady demo.</p>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {sampleReviews.map(({ name, rating, comment }) => (
                <li key={name} className="rounded-xl border border-stone-200 bg-white p-5">
                  <figure className="flex h-full flex-col">
                    <p className="text-lg leading-none text-amber-700">
                      <span aria-hidden="true">{"★".repeat(rating)}{"☆".repeat(5 - rating)}</span>
                      <span className="sr-only">{rating} out of 5 stars</span>
                    </p>
                    <blockquote className="mt-3 flex-1 text-sm leading-6 text-stone-700">
                      “{comment}”
                    </blockquote>
                    <figcaption className="mt-4 border-t border-stone-200 pt-3 text-sm font-semibold">
                      {name}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
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
