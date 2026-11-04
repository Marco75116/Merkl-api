export type MerklErrorKind = "timeout" | "network" | "not-found" | "upstream" | "invalid-response";

/**
 * The only error type the Merkl client throws. Upstream bodies are never
 * attached, so nothing from Merkl can leak to a client as-is.
 */
export class MerklError extends Error {
  constructor(
    public readonly kind: MerklErrorKind,
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "MerklError";
  }
}
