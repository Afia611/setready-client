import Link from "next/link";

type Equipment = {
  id: string;
  name: string;
  category: string;
  location: string;
  price: number;
  rentalType: "daily" | "weekly" | "monthly";
  quantity: number;
};

const priceFormatter = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
});

const rentalPeriods = {
  daily: "day",
  weekly: "week",
  monthly: "month",
};

async function getEquipment(): Promise<Equipment[]> {
  const apiUrl = (
    process.env.SETREADY_API_URL ?? "http://127.0.0.1:5000"
  ).replace(/\/+$/, "");

  const response = await fetch(`${apiUrl}/api/equipment`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Equipment API returned ${response.status}`);
  }

  const result: { data: Equipment[] } = await response.json();
  return result.data;
}

export default async function EquipmentPage() {
  const equipment = await getEquipment().catch(() => null);

  return (
    <main className="min-h-screen bg-stone-50 text-zinc-950">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          All Equipment
        </h1>

        {equipment === null ? (
          <p role="alert" className="mt-6 text-zinc-600">
            Equipment is unavailable right now. Refresh to try again.
          </p>
        ) : equipment.length === 0 ? (
          <p className="mt-6 text-zinc-600">
            No approved equipment is available yet.
          </p>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {equipment.map((item) => (
              <li
                key={item.id}
                className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5"
              >
                <p className="text-sm font-medium text-blue-700">
                  {item.category}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-zinc-600">{item.location}</p>

                <div className="mt-auto pt-4">
                  <p className="font-semibold">
                    {priceFormatter.format(item.price)} /{" "}
                    {rentalPeriods[item.rentalType]}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600">
                    {item.quantity > 0
                      ? `${item.quantity} units listed`
                      : "Out of stock"}
                  </p>
                </div>

                <Link
                  href={`/equipment/${item.id}`}
                  className="mt-4 self-start font-medium text-blue-700 hover:underline"
                >
                  View Details
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}