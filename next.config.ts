import type { NextConfig } from "next";

const apiUrl = (process.env.SETREADY_API_URL ?? "http://localhost:5000").replace(
  /\/+$/,
  "",
);

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/owner/equipment/image",
        destination: `${apiUrl}/api/owner/equipment/image`,
      },
      {
        source: "/api/admin/rentals/:id/complete",
        destination: `${apiUrl}/api/admin/rentals/:id/complete`,
      },
      {
        source: "/api/favorites/:path*",
        destination: `${apiUrl}/api/favorites/:path*`,
      },
      {
        source: "/api/auth/:path*",
        destination: `${apiUrl}/api/auth/:path*`,
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
