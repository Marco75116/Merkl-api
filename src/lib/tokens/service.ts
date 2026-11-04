import { cacheLife } from "next/cache";
import { cache } from "react";
import { isAddress } from "viem";
import {
  fetchRewardTokens,
  fetchToken,
  fetchTokenPriceHistory,
  fetchTokens,
  type FetchTokensParams,
} from "@/lib/merkl/client";
import type { PriceHistoryPoint, Token, TokenDetail } from "@/lib/merkl/schemas";
import { merklTokenId, type TokenRef } from "@/lib/tokens/routes";
import type { TokenListQuery, TokenPageSize } from "@/lib/tokens/search-params";

/**
 * Domain layer for tokens. Pages (and later route handlers) call these
 * functions and nothing else; they are the only callers of the Merkl client.
 *
 * Caching lives here: each Merkl read is a `"use cache"` scope keyed on its
 * serialised arguments and shared across requests, with lifetimes from the
 * `cacheLife` profiles in `next.config.ts`.
 */

export type TokenListResult = {
  items: Token[];
  page: number;
  pageSize: TokenPageSize;
  /** Merkl exposes no count endpoint, so this is inferred from a full page. */
  hasNextPage: boolean;
};

/**
 * One search box, two upstream filters: an EVM address goes to Merkl's exact
 * `address` filter, anything else to the free-text `search`. `strict: false`
 * accepts any casing; Merkl matches addresses case-insensitively.
 */
function toSearchFilters(search: string | null): Pick<FetchTokensParams, "search" | "address"> {
  if (search != null && isAddress(search, { strict: false })) return { address: search, search: null };
  return { search, address: null };
}

export async function listTokens(query: TokenListQuery): Promise<TokenListResult> {
  "use cache";
  cacheLife("merkl");
  const items = await fetchTokens({
    page: query.page - 1, // URL is 1-indexed for humans, Merkl is 0-indexed
    items: query.items,
    chainId: query.chainId,
    verified: query.verified,
    ...toSearchFilters(query.search),
    missingPrice: false,
    missingIcons: false,
  });

  return {
    items,
    page: query.page,
    pageSize: query.items,
    hasNextPage: items.length === query.items,
  };
}

async function fetchTokenCached(id: string): Promise<TokenDetail> {
  "use cache";
  cacheLife("merkl");
  return fetchToken(id);
}

/**
 * Request-scoped memo on top, so the page and its generateMetadata share one
 * call even on a cache miss. Keyed on the id string: `cache()` compares
 * arguments by identity, and each caller parses its own `ref` object.
 */
const getTokenById = cache(fetchTokenCached);

export function getToken(ref: TokenRef): Promise<TokenDetail> {
  return getTokenById(merklTokenId(ref));
}

/**
 * Daily price rows over Merkl's default window (the last 365 days), oldest
 * first. No explicit `from`: some feeds stop months before today, and a
 * narrower window would hide the samples that do exist.
 */
export async function getTokenPriceHistory(ref: TokenRef): Promise<PriceHistoryPoint[]> {
  "use cache";
  cacheLife("daily");
  const rows = await fetchTokenPriceHistory(ref);
  return rows.toSorted((a, b) => a.day - b.day);
}

/** Whether Merkl allows this token to be distributed as a campaign reward. */
export async function isRewardToken(ref: TokenRef): Promise<boolean> {
  "use cache";
  cacheLife("daily");
  const byChain = await fetchRewardTokens({ chainId: ref.chainId, search: ref.address });
  const wanted = ref.address.toLowerCase();
  return (byChain[String(ref.chainId)] ?? []).some((t) => t.address.toLowerCase() === wanted);
}
