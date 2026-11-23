import { cache } from "react";
import { cookies, headers } from "next/headers";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  emailVerified?: boolean;
  contactEmail?: string;
  phone?: string;
  address?: string;
};

export type AuthSession = {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  };
  user: AuthUser;
};

async function getAppUrl(): Promise<string> {
  const configuredUrl = process.env.APP_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.")
      ? "http"
      : "https");

  return `${protocol}://${host}`;
}

export const getSession = cache(async (): Promise<AuthSession | null> => {
  const cookieHeader = (await cookies()).toString();

  if (!cookieHeader) {
    return null;
  }

  try {
    const appUrl = await getAppUrl();
    const response = await fetch(`${appUrl}/api/auth/get-session`, {
      cache: "no-store",
      headers: {
        accept: "application/json",
        cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Partial<AuthSession> | null;

    if (!data?.session || !data.user) {
      return null;
    }

    return {
      session: data.session,
      user: data.user,
    };
  } catch {
    return null;
  }
});
