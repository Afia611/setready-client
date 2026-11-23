"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

type EquipmentScope = "owner" | "admin";

type Listing = {
  name: string;
  description: string;
  price: number;
  quantity: number;
};

type ListingResponse = {
  data?: Listing;
  message?: string;
};

const fieldClass =
  "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2";

async function requestListing(
  apiPath: string,
  options: { changes?: Listing; signal?: AbortSignal } = {},
): Promise<ListingResponse | null> {
  const { changes, signal } = options;

  const session = await fetch("/api/auth/token", {
    cache: "no-store",
    signal,
  });

  const auth: { token?: string } | null = session.ok
    ? await session.json().catch(() => null)
    : null;

  if (!auth?.token) {
    throw new Error("Could not verify your session. Sign in again.");
  }

  const response = await fetch(apiPath, {
    method: changes ? "PATCH" : "GET",
    headers: {
      authorization: `Bearer ${auth.token}`,
      ...(changes ? { "content-type": "application/json" } : {}),
    },
    body: changes ? JSON.stringify(changes) : undefined,
    cache: "no-store",
    signal,
  });

  const result: ListingResponse | null = await response.json().catch(() => null);

  if (response.status === 403) {
    throw new Error("Your account cannot edit this listing.");
  }

  if (!response.ok) {
    throw new Error(result?.message ?? "Could not complete the request.");
  }

  return result;
}

export default function EditEquipmentForm({
  scope = "owner",
}: {
  scope?: EquipmentScope;
}) {
  const { id } = useParams<{ id: string }>();

  return <EquipmentEditor key={`${scope}:${id}`} id={id} scope={scope} />;
}

function EquipmentEditor({ id, scope }: { id: string; scope: EquipmentScope }) {
  const isAdmin = scope === "admin";
  const backHref = isAdmin
    ? "/dashboard/admin/equipment/all"
    : "/dashboard/owner/equipment";
  const apiPath = `/api/${scope}/equipment/${encodeURIComponent(id)}`;

  const [listing, setListing] = useState<Listing | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadListing() {
      try {
        const result = await requestListing(apiPath, {
          signal: controller.signal,
        });

        if (!result?.data) {
          throw new Error("The server returned no equipment details.");
        }

        if (!controller.signal.aborted) {
          setListing(result.data);
        }
      } catch (failure) {
        if (!controller.signal.aborted) {
          setError(
            failure instanceof Error
              ? failure.message
              : "Could not load the listing.",
          );
        }
      }
    }

    void loadListing();

    return () => controller.abort();
  }, [apiPath]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const form = new FormData(event.currentTarget);
    const changes: Listing = {
      name: String(form.get("name") ?? "").trim(),
      description: String(form.get("description") ?? "").trim(),
      price: Number(form.get("price")),
      quantity: Number(form.get("quantity")),
    };

    setError("");
    setNotice("");

    if (!changes.name || !changes.description) {
      setError("Enter an equipment name and description.");
      return;
    }

    setSaving(true);

    try {
      const result = await requestListing(apiPath, { changes });
      setNotice(result?.message ?? "Listing saved.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not save the listing.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-xl">
        <Link href={backHref} className="font-medium text-blue-700 hover:underline">
          {isAdmin ? "Back to All Equipment" : "Back to My Equipment"}
        </Link>

        <h1 className="mt-4 text-3xl font-bold">Edit Equipment</h1>

        {error && (
          <p role="alert" className="mt-4 text-red-700">
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className="mt-4 text-green-700">
            {notice}
          </p>
        )}

        {!listing && !error && (
          <p role="status" className="mt-4">
            Loading listing…
          </p>
        )}

        {listing && (
          <form
            onSubmit={save}
            onChange={() => {
              setNotice("");
              setError("");
            }}
            className="mt-6"
          >
            <fieldset
              disabled={saving}
              className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5"
            >
              <label className="block">
                Equipment name
                <input
                  name="name"
                  defaultValue={listing.name}
                  required
                  className={fieldClass}
                />
              </label>

              <label className="block">
                Description
                <textarea
                  name="description"
                  defaultValue={listing.description}
                  rows={4}
                  required
                  className={fieldClass}
                />
              </label>

              <label className="block">
                Rental price (BDT)
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  defaultValue={listing.price}
                  required
                  className={fieldClass}
                />
              </label>

              <label className="block">
                Quantity
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={listing.quantity}
                  required
                  className={fieldClass}
                />
              </label>

              {!isAdmin && (
                <p className="text-sm text-zinc-600">
                  Saving sends this listing back for Admin review.
                </p>
              )}

              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </fieldset>
          </form>
        )}
      </div>
    </main>
  );
}