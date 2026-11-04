import { z } from "zod";

/**
 * Zod schemas for the Merkl v4 resources this app consumes, derived from
 * https://api.merkl.xyz/docs/json and checked against live responses.
 * Everything leaving the Merkl client is parsed with these, so the rest of
 * the app only ever sees the inferred types below.
 */

export const tokenSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  chainId: z.number().int(),
  address: z.string(),
  decimals: z.number(),
  symbol: z.string(),
  displaySymbol: z.string().optional(),
  icon: z.string(),
  verified: z.boolean(),
  isNative: z.boolean(),
  isTest: z.boolean(),
  /** TOKEN | PRETGE | POINT today; kept open so a new type does not break parsing. */
  type: z.string(),
  /** USD. Absent or null when Merkl has no price feed for the token. */
  price: z.number().nullish(),
  priceSource: z.string().nullish(),
  /** Unix seconds of the last price update. */
  updatedAt: z.number().nullish(),
  underlyingTokenId: z.string().optional(),
});

export type Token = z.infer<typeof tokenSchema>;

export const tokenListSchema = z.array(tokenSchema);
