import Link from "next/link";
import { EquipmentCard, type Equipment } from "./equipment-card";

export type CatalogQuery = Partial<Record<
  "search" | "category" | "rentalType" | "minPrice" | "maxPrice" | "availability" | "sort",
  string
>>;

const control = "mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5";

export default function EquipmentCatalog({
  equipment,
  categories,
  query,
}: {
  equipment: Equipment[];
  categories: string[];
  query: CatalogQuery;
}) {
  return (
    <>
      <form action="/equipment" method="get" aria-label="Equipment filters"
        className="mt-8 rounded-2xl border border-stone-200 bg-white p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-semibold">
            Search by equipment name or location
            <input name="search" type="search" defaultValue={query.search} maxLength={120} className={control} />
          </label>
          <label className="text-sm font-semibold">
            Category
            <select name="category" defaultValue={query.category ?? ""} className={control}>
              <option value="">All categories</option>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Rental type
            <select name="rentalType" defaultValue={query.rentalType ?? ""} className={control}>
              <option value="">All rental types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Availability
            <select name="availability" defaultValue={query.availability ?? ""} className={control}>
              <option value="">All listings</option>
              <option value="available">Available</option>
              <option value="out-of-stock">Out of stock</option>
            </select>
          </label>
          <label className="text-sm font-semibold">
            Minimum price (৳)
            <input name="minPrice" type="number" min="0" step="0.01" defaultValue={query.minPrice} className={control} />
          </label>
          <label className="text-sm font-semibold">
            Maximum price (৳)
            <input name="maxPrice" type="number" min="0" step="0.01" defaultValue={query.maxPrice} className={control} />
          </label>
          <label className="text-sm font-semibold">
            Sort by
            <select name="sort" defaultValue={query.sort ?? "recent"} className={control}>
              <option value="recent">Recently added</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
            </select>
          </label>
          <div className="flex flex-wrap items-end gap-3">
            <button type="submit" className="rounded-lg bg-amber-300 px-4 py-2 font-semibold hover:bg-amber-400">
              Apply
            </button>
            <Link href="/equipment" className="px-2 py-2 text-sm font-semibold text-amber-800 hover:underline">
              Clear filters
            </Link>
          </div>
        </div>
      </form>
      <p role="status" className="mt-7 text-sm font-medium text-stone-600">
        {equipment.length} {equipment.length === 1 ? "listing" : "listings"}
      </p>
      {equipment.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-stone-200 bg-white p-6">
          No approved equipment matches your search.
        </p>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.map((item) => (
            <li key={item.id} className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white">
              <EquipmentCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
