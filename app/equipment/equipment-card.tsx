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

export function EquipmentPhoto({ item }: { item: Pick<Equipment, "name" | "imageUrl"> }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const imageUrl = item.imageUrl?.trim();
  const isLocalPhoto = /^\/images\/[a-z0-9][a-z0-9._-]*\.(?:avif|gif|jpe?g|png|webp)$/i;
  const showImage =
    imageUrl &&
    imageUrl !== failedUrl &&
    (/^https?:\/\//i.test(imageUrl) || isLocalPhoto.test(imageUrl));

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

export function EquipmentCard({
  item,
  heading: Heading = "h2",
}: {
  item: Equipment;
  heading?: "h2" | "h3";
}) {
  return (
    <>
      <EquipmentPhoto item={item} />

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-semibold text-amber-800">
          {item.category}
        </p>
        <Heading className="mt-2 text-xl font-semibold">{item.name}</Heading>
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
              ? `${item.quantity} ${item.quantity === 1 ? "unit" : "units"} available`
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
    </>
  );
}
