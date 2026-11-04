import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  /**
   * Lifetimes (seconds) for the `"use cache"` scopes in `lib/tokens/service.ts`.
   * `stale` is the browser router cache, `revalidate` the server refresh,
   * `expire` the hard cut-off. An `expire` under 5 min would keep the entry out
   * of prefetches, so neither profile goes below that.
   */
  cacheLife: {
    /** Token lists and details: Merkl answers with `max-age=60`. */
    merkl: { stale: 30, revalidate: 60, expire: 300 },
    /** Daily price rows and reward eligibility: change at most once a day. */
    daily: { stale: 300, revalidate: 3600, expire: 86_400 },
  },
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
