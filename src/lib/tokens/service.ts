import { cache } from "react";
import { isAddress } from "viem";
import { fetchToken, fetchTokenPriceHistory, fetchTokens, type FetchTokensParams } from "@/lib/merkl/client";
import type { PriceHistoryPoint, Token, TokenDetail } from "@/lib/merkl/schemas";
import { merklTokenId, type TokenRef } from "@/lib/tokens/routes";
import type { TokenListQuery, TokenPageSize } from "@/lib/tokens/search-params";

/**
 * Domain layer for tokens. Pages (and later route handlers) call these
 * functions and nothing else; they are the only callers of the Merkl client.
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

/** Request-scoped memo: the page and its generateMetadata share one Merkl call. */
export const getToken = cache((ref: TokenRef): Promise<TokenDetail> => fetchToken(merklTokenId(ref)));

export const PRICE_HISTORY_DAYS_DEFAULT = 90;

const MS_PER_DAY = 86_400_000;

/** Daily price rows for the last `days` days, oldest first. */
export function getTokenPriceHistory(
  ref: TokenRef,
  { days = PRICE_HISTORY_DAYS_DEFAULT }: { days?: number } = {},
): Promise<PriceHistoryPoint[]> {
  const today = Math.floor(Date.now() / MS_PER_DAY);
  return fetchTokenPriceHistory({ ...ref, from: today - days, to: today }).then((rows) =>
    rows.toSorted((a, b) => a.day - b.day),
  );
}
