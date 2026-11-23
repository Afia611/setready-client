const benefits = [
  ["Clear rental rates", "Compare prices and review your total before paying."],
  ["Reviewed listings", "Equipment listings are approved before they appear in the catalog."],
  ["Flexible rental periods", "Choose from daily, weekly, or monthly rental options."],
  ["Secure checkout", "Complete your payment through Stripe Checkout."],
];

const reviews = [
  { name: "Nadia R.", rating: 5, comment: "I booked a camera and lens for a weekend shoot. The pickup instructions were easy to follow." },
  { name: "Imran H.", rating: 5, comment: "I could compare lighting kits and see the full price before booking." },
  { name: "Tania S.", rating: 4, comment: "The owner confirmed what came with the wireless mic before I picked it up." },
  { name: "Rafi K.", rating: 5, comment: "A weekly rental gave me enough time to finish filming." },
];

export default function HomeBenefitsReviews() {
  return (
    <>
      <section id="why-choose-us" aria-labelledby="benefits-heading" className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
          <h2 id="benefits-heading" className="text-3xl font-bold">
            Why Choose SetReady?
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
          <h2 id="reviews-heading" className="text-3xl font-bold">Customer Reviews</h2>
          <p className="mt-2 text-sm text-stone-600">Fictional reviews for the SetReady demo.</p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map(({ name, rating, comment }) => (
              <li key={name} className="rounded-xl border border-stone-200 bg-white p-5">
                <figure className="flex h-full flex-col">
                  <p className="text-amber-700">
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
    </>
  );
}