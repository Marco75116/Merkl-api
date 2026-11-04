import type { z } from "zod";
import { MERKL_API_URL, MERKL_TIMEOUT_MS } from "@/lib/constants/global.constant";
import { MerklError } from "@/lib/merkl/errors";
import {
  priceHistorySchema,
  rewardTokensByChainSchema,
  tokenDetailSchema,
  tokenListSchema,
  type PriceHistoryPoint,
  type RewardTokensByChain,
  type Token,
  type TokenDetail,
} from "@/lib/merkl/schemas";

/**
 * Typed HTTP client for https://api.merkl.xyz. Knows nothing about Next,
 * caching or URL state: it takes plain params, enforces a timeout, and
 * returns zod-parsed data or throws a `MerklError`.
 */

type QueryValue = string | number | boolean | null | undefined;

/** Builds a query string with null/undefined dropped and keys sorted, so equal queries serialise identically. */
export function toSearchParams(params: Record<string, QueryValue>): URLSearchParams {
  const entries = Object.entries(params)
    .filter((e): e is [string, string | number | boolean] => e[1] != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => [k, String(v)]);
  return new URLSearchParams(entries);
}

async function request<S extends z.ZodType>(path: string, params: Record<string, QueryValue>, schema: S): Promise<z.infer<S>> {
  const url = new URL(path, MERKL_API_URL);
  url.search = toSearchParams(params).toString();

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(MERKL_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new MerklError("timeout", `Merkl did not answer within ${MERKL_TIMEOUT_MS}ms`);
    }
    throw new MerklError("network", "Could not reach Merkl");
  }

  if (response.status === 404) throw new MerklError("not-found", "Resource not found on Merkl", 404);
  if (!response.ok) throw new MerklError("upstream", `Merkl responded with ${response.status}`, response.status);

  const parsed = schema.safeParse(await response.json().catch(() => undefined));
  if (!parsed.success) {
    throw new MerklError("invalid-response", `Merkl response for ${path} did not match the expected shape`);
  }
  return parsed.data;
}

export type FetchTokensParams = {
  /** 0-indexed, as Merkl expects. */
  page: number;
  /** 1..200 */
  items: number;
  chainId?: number | null;
  verified?: boolean | null;
  isNative?: boolean | null;
  /** Free-text match on name or symbol. */
  search?: string | null;
  /** Exact token address; combine with `chainId` for a single result. */
  address?: string | null;
  /** `true` returns only tokens without a price. `false` is accepted but currently behaves like omitting it. */
  missingPrice?: boolean | null;
  /** Same semantics as `missingPrice`, for tokens without an icon. */
  missingIcons?: boolean | null;
};

export function fetchTokens(params: FetchTokensParams): Promise<Token[]> {
  return request("/v4/tokens/", params, tokenListSchema);
}

/** `id` is Merkl's canonical numeric id, or the `{chainId}-{address}` shorthand. */
export function fetchToken(id: string): Promise<TokenDetail> {
  return request(`/v4/tokens/${encodeURIComponent(id)}`, { returnUnderlying: true }, tokenDetailSchema);
}

export type FetchPriceHistoryParams = {
  chainId: number;
  address: string;
  /** Unix day (days since epoch, UTC). Merkl defaults to today - 365. */
  from?: number | null;
  /** Unix day. Merkl defaults to today. */
  to?: number | null;
};

/** Daily OHLC rows, oldest first. Empty when Merkl has no price feed for the token. */
export function fetchTokenPriceHistory(params: FetchPriceHistoryParams): Promise<PriceHistoryPoint[]> {
  return request("/v4/tokens/prices/history", params, priceHistorySchema);
}

export type FetchRewardTokensParams = {
  chainId: number;
  /** Matches symbol, name or address (case-insensitive). */
  search?: string | null;
};

/** Tokens that can be distributed as campaign rewards, grouped by chain id. */
export function fetchRewardTokens(params: FetchRewardTokensParams): Promise<RewardTokensByChain> {
  return request("/v4/tokens/reward", params, rewardTokensByChainSchema);
}
