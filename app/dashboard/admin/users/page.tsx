"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "Asia/Dhaka" });

const roles = ["customer", "owner", "admin"] as const;

type Role = (typeof roles)[number];

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string | null;
};

async function requestUsers(path: string, options: RequestInit = {}) {
  const session = await fetch("/api/auth/token", { cache: "no-store" });

  if (!session.ok) {
    throw new Error("Could not verify your session. Sign in again.");
  }

  const { token } = (await session.json()) as { token?: string };

  if (!token) {
    throw new Error("Please sign in again.");
  }

  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
  });

  if (response.status === 403) {
    throw new Error("This page is available to Admin accounts.");
  }

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(result?.message ?? "Could not complete the request.");
  }

  return response;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const response = await requestUsers("/api/admin/users");
        const { data } = (await response.json()) as { data: User[] };

        if (active) setUsers(data);
      } catch (failure) {
        if (active) {
          setError(failure instanceof Error ? failure.message : "Could not load users.");
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, []);

  async function saveRole(event: FormEvent<HTMLFormElement>, user: User) {
    event.preventDefault();

    const role = new FormData(event.currentTarget).get("role");
    if (typeof role !== "string" || !roles.some((value) => value === role)) {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await requestUsers(`/api/admin/users?id=${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      const updated = (await response.json()) as { id: string; role: Role };

      setUsers((current) =>
        current?.map((item) =>
          item.id === updated.id ? { ...item, role: updated.role } : item,
        ) ?? null,
      );
      setNotice(`${user.name} now has the ${updated.role} role.`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not update the role.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="font-medium text-blue-700 hover:underline">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Manage Users</h1>

        {error && <p role="alert" className="mt-4 text-red-700">{error}</p>}
        {notice && <p role="status" className="mt-4 text-green-700">{notice}</p>}
        {!users && !error && <p role="status" className="mt-4">Loading users…</p>}
        {users?.length === 0 && <p className="mt-4">No users found.</p>}

        {users && users.length > 0 && (
          <div className="mt-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-100">
                <tr>
                  <th scope="col" className="p-4">Name</th>
                  <th scope="col" className="p-4">Email</th>
                  <th scope="col" className="p-4">Current role</th>
                  <th scope="col" className="p-4">Registration Date</th>
                  <th scope="col" className="p-4">Change role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-zinc-200">
                    <td className="p-4 font-medium">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4 capitalize">{user.role}</td>
                    <td className="p-4">{user.createdAt ? dateFormat.format(new Date(user.createdAt)) : "Unavailable"}</td>
                    <td className="p-4">
                      <form
                        onSubmit={(event) => void saveRole(event, user)}
                        className="flex min-w-48 gap-2"
                      >
                        <select
                          key={user.role}
                          name="role"
                          defaultValue={user.role}
                          aria-label={`Role for ${user.name}`}
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
                          disabled={saving}
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-lg bg-blue-700 px-3 py-2 font-semibold text-white disabled:opacity-60"
                        >
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}