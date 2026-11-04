import {
  createLoader,
  parseAsBoolean,
  parseAsInteger,
  parseAsNumberLiteral,
  parseAsString,
  type inferParserType,
} from "nuqs/server";
import { z } from "zod";

/**
 * Single definition of the /tokens URL state.
 * Used by the server page (via `loadTokenListQuery`), by client filter
 * components (via `useQueryStates(tokenSearchParsers)`) and, later, by the
 * joint API route handler.
 */

/** Allowed page sizes; all below Merkl's hard limit of 200 items. */
export const TOKEN_PAGE_SIZES = [25, 50, 100] as const;
export type TokenPageSize = (typeof TOKEN_PAGE_SIZES)[number];
export const TOKEN_PAGE_SIZE_DEFAULT: TokenPageSize = 25;
/** Shorter searches are ignored server-side; the input shows a hint instead. */
export const SEARCH_MIN_LENGTH = 3;

export const tokenSearchParsers = {
  chainId: parseAsInteger,
  /** Verified tokens by default; `?verified=false` opts into unverified ones. */
  verified: parseAsBoolean.withDefault(true),
  search: parseAsString,
  page: parseAsInteger.withDefault(1),
  items: parseAsNumberLiteral(TOKEN_PAGE_SIZES).withDefault(TOKEN_PAGE_SIZE_DEFAULT),
};

export type TokenSearchParams = inferParserType<typeof tokenSearchParsers>;

const loadRaw = createLoader(tokenSearchParsers);

/**
 * nuqs guarantees types; zod guarantees ranges. Out-of-range values are
 * clamped rather than rejected so a hand-edited URL still renders.
 */
export const tokenListQuerySchema = z.object({
  chainId: z.number().int().positive().nullable(),
  verified: z.boolean(),
  search: z
    .string()
    .trim()
    .nullable()
    .transform((s) => (s && s.length >= SEARCH_MIN_LENGTH ? s : null)),
  page: z.number().int().catch(1).transform((p) => Math.max(1, p)),
  items: z.literal(TOKEN_PAGE_SIZES).catch(TOKEN_PAGE_SIZE_DEFAULT),
});

export type TokenListQuery = z.infer<typeof tokenListQuerySchema>;

export async function loadTokenListQuery(
  input: Parameters<typeof loadRaw>[0],
): Promise<TokenListQuery> {
  return tokenListQuerySchema.parse(await loadRaw(input));
}
