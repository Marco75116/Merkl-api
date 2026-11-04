import { z } from "zod";
import { isAddress } from "viem";

/**
 * A token is addressed by chain + address everywhere in this app's URLs,
 * because that pair is what Merkl's other endpoints key on (for example
 * /v4/tokens/prices/history). Merkl's numeric id stays internal.
 */

export type TokenRef = { chainId: number; address: string };

export const tokenRefSchema = z.object({
  chainId: z.coerce.number().int().positive(),
  address: z.string().refine((a) => isAddress(a, { strict: false }), "not an EVM address"),
});

export function tokenPath({ chainId, address }: TokenRef): string {
  return `/tokens/${chainId}/${address}`;
}

/** Merkl's `{chainId}-{address}` shorthand accepted by GET /v4/tokens/{id}. */
export function merklTokenId({ chainId, address }: TokenRef): string {
  return `${chainId}-${address}`;
}
