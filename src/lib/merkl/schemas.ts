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

/** GET /v4/tokens/{id}?returnUnderlying=true: `underlying` is null unless the token is a wrapper. */
export const tokenDetailSchema = tokenSchema.extend({
  underlying: tokenSchema.nullish(),
});

export type TokenDetail = z.infer<typeof tokenDetailSchema>;

/** GET /v4/tokens/prices/history: one row per day with samples, OHLC in USD. */
export const priceHistoryPointSchema = z.object({
  /** Unix day: days since 1970-01-01 UTC. */
  day: z.number().int(),
  open: z.number(),
  close: z.number(),
  min: z.number(),
  max: z.number(),
  avg: z.number(),
  samples: z.number().int(),
  source: z.string().nullish(),
});

export type PriceHistoryPoint = z.infer<typeof priceHistoryPointSchema>;

export const priceHistorySchema = z.array(priceHistoryPointSchema);

/**
 * GET /v4/tokens/reward: reward-eligible tokens grouped by chain id. Only the
 * fields this app needs are kept; zod strips the rest.
 */
export const rewardTokensByChainSchema = z.record(
  z.string(),
  z.array(z.object({ id: z.string(), chainId: z.number().int(), address: z.string(), symbol: z.string() })),
);

export type RewardTokensByChain = z.infer<typeof rewardTokensByChainSchema>;
