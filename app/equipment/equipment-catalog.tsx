"use client";

import Link from "next/link";
import { useState } from "react";

export type Equipment = {
  id: string;
  name: string;
  category: string;
  location: string;
  brand?: string | null;
  imageUrl?: string | null;
  price: number;
  rentalType: "daily" | "weekly" | "monthly";
  quantity: number;
};

const priceFormatter = new Intl.NumberFormat("en-BD", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const rentalPeriods = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

const filterControlClass =
  "mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700";

function EquipmentPhoto({ item }: { item: Equipment }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageUrl = item.imageUrl?.trim();
  const showImage =
    imageUrl && /^https?:\/\//i.test(imageUrl) && imageUrl !== failedUrl;

  return (
    <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-stone-200">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- Listings use owner-provided photo URLs.
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover"
          onError={() => setFailedUrl(imageUrl)}
        />
      ) : (
        <span className="text-sm font-medium text-stone-600">
          No photo available
        </span>
      )}
    </div>
  );
}

export default function EquipmentCatalog({
  equipment,
}: {
  equipment: Equipment[];
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  if (equipment.length === 0) {
    return (
      <p className="mt-8 rounded-2xl border border-stone-200 bg-white p-6">
        No approved equipment is available yet.
      </p>
    );
  }

  const categories = [...new Set(equipment.map((item) => item.category))]
    .filter(Boolean)
    .sort((first, second) => first.localeCompare(second, "en"));

  const query = search.trim().toLowerCase();
  const hasFilters = search.length > 0 || category !== "";
  const results = equipment.filter((item) => {
    const matchesCategory = category === "" || item.category === category;
    const matchesSearch = [item.name, item.brand, item.location].some(
      (value) => value?.toLowerCase().includes(query),
    );

    return matchesCategory && matchesSearch;
  });

  function clearFilters() {
    setSearch("");
    setCategory("");
  }

  return (
    <>
      <section
        aria-label="Equipment filters"
        className="mt-8 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <label className="text-sm font-semibold">
            Search equipment
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Try Sony or Dhaka"
              className={filterControlClass}
            />
          </label>

          <label className="text-sm font-semibold">
            Category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={filterControlClass}
            >
              <option value="">All categories</option>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm font-medium text-stone-600">
          {results.length} {results.length === 1 ? "listing" : "listings"}
        </p>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-amber-800 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-8 text-center">
          <h2 className="font-semibold">No equipment matches your filters</h2>
          <p className="mt-2 text-sm text-stone-600">
            Try a different search or choose another category.
          </p>
        </div>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <li
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white"
            >
              <EquipmentPhoto item={item} />

              <div className="flex flex-1 flex-col p-5">
                <p className="text-sm font-semibold text-amber-800">
                  {item.category}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-stone-600">{item.location}</p>

                <div className="mt-auto pt-5">
                  <p className="text-lg font-bold">
                    ৳{priceFormatter.format(item.price)}{" "}
                    <span className="text-sm font-normal text-stone-600">
                      / {rentalPeriods[item.rentalType]}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {item.quantity > 0
                      ? `${item.quantity} ${item.quantity === 1 ? "unit" : "units"} listed`
                      : "Out of stock"}
                  </p>
                </div>

                <Link
                  href={`/equipment/${item.id}`}
                  aria-label={`View details for ${item.name}`}
                  className="mt-4 self-start rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
                >
                  View details <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}