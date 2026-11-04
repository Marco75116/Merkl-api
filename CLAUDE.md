# CLAUDE.md

Guidance for AI assistants and contributors working in this repository.

## Context

This repo is a technical test. Brief (kept verbatim so it stays local to the repo):

> In a single new repository, create a fullstack SSR application along with a joint api.
> 1. Browse Merkl's API and choose one of the resources (opportunity, campaign, token).
> 2. Expose it through endpoints in your api
> 3. Use a caching method to prevent overfetching Merkl's api
> 4. Display the data within the frontend using a simple list page / item page layout
> 5. Use at least 3 filter fields (chain, protocol, action, status, max tvl etc…) for the list
>
> Aim for ~2-3h. Get a stable low-effort foundation up, then focus on one strength.
> Evaluated on: understanding of the code, repo structure and stack curation, data architecture, dev setup and coding architecture.
> Building, containerisation and shipping to prod are disregarded.

Chosen resource: **token** (`/v4/tokens`).

## Merkl API facts (verified)

- Source of truth: tokens section of the API docs, https://api.merkl.xyz/docs#tag/tokens
- Base URL `https://api.merkl.xyz`, Swagger at `/docs`, OpenAPI JSON at `/docs/json`.
- Public, no API key. Rate limit 4200 req / 60 s (`x-ratelimit-*` headers).
- Merkl responds with `cache-control: max-age=60`; mirror that TTL for token data.
- `GET /v4/tokens/` params: `chainId`, `verified`, `isNative`, `search`, `symbol`, `name`, `address`, `page`, `items` (max 200). No count endpoint.
- `GET /v4/tokens/{id}` single token. `GET /v4/chains/` for the chain filter (70 chains, changes rarely, cache long).
- `GET /v4/tokens/reward/{chainId}` tokens usable as rewards.

## Stack

- Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, pnpm.
- UI: **shadcn/ui** for every component where one exists. Do not hand-roll buttons, inputs, selects, tables, badges, skeletons, pagination, etc. Add components with `pnpm dlx shadcn@latest add <name>`.
- URL state: **nuqs** for all filter, sort and pagination state. The URL is the single source of truth; no filter state in React state or context.
- Validation: zod at every boundary (query params in, Merkl responses in).

## Architecture rules

### Server first
- Default to React Server Components. A file gets `"use client"` only if it needs browser APIs, event handlers, or hooks. Keep client components small and leaf-level (a filter bar, a sort toggle), never whole pages.
- Pages fetch data on the server and pass plain serialisable props down.
- Loading and error states via `loading.tsx` / `error.tsx` and `<Suspense>` boundaries, not client spinners.

### Layers (keep them separate, dependencies point inward)
```
src/
  app/                 routes only: pages, layouts, route handlers. Thin.
    api/tokens/        joint API exposed by this app (Route Handlers)
    tokens/            list page
    tokens/[id]/       item page
  components/
    ui/                shadcn generated components, do not edit by hand
    tokens/            feature components
  lib/
    merkl/             typed Merkl client: fetch + zod schemas + types. Knows nothing about Next.
    cache/             caching primitive(s), swappable implementation
    tokens/            domain layer: query parsing (nuqs parsers / zod), service functions used by both pages and route handlers
    utils.ts
```
- Pages and Route Handlers both call the same service functions in `lib/tokens`. Never call Merkl directly from a page or a route handler.
- Query param parsing is defined once (nuqs parsers) and reused by the client filter bar, the server page, and the route handler.

### Caching
- Caching lives in the data layer, not in components.
- Two tiers by volatility: reference data (chains) long TTL, token data 60 s TTL matching Merkl.
- Cache key is the normalised, sorted query string so equivalent URLs hit the same entry.
- The cache interface must be swappable (in-memory now, Redis later) without touching callers.
- Also set `Cache-Control` headers on our own API responses so a CDN can cache them.

### Production readiness
- Environment variables validated at startup (`MERKL_API_URL` with sensible default).
- Every external call has a timeout and typed error. Never leak Merkl error bodies to the client raw; map to our own error shape.
- Route Handlers return consistent JSON envelopes and correct status codes.
- No `any`. No unchecked casts of Merkl responses; parse with zod.
- Accessible by default: shadcn primitives, semantic HTML, keyboard-navigable filters.

## Conventions
- Named exports. One component per file. Colocate small helpers.
- Formatting: numbers via `Intl.NumberFormat`, dates via `Intl.DateTimeFormat`, in shared `lib/format.ts`.
- Commit messages: short imperative subject, body explains why.
- Before finishing any task: `pnpm exec tsc --noEmit` and `pnpm lint` must pass.

## Commands
```
pnpm dev          # dev server
pnpm lint         # eslint
pnpm exec tsc --noEmit
pnpm dlx shadcn@latest add <component>
```

## Notes
- `AGENTS.md` is generated by `next dev` on Next 16. Read `node_modules/next/dist/docs/` for Next 16 API changes before assuming older conventions.
- `.context/` is Conductor scratch space and is gitignored.
