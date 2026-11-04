/**
 * Chains offered in the chain filter. A hand-picked subset of the chains
 * Merkl supports (GET /v4/chains/), limited to the largest ones. Ids and
 * names match Merkl's; icons follow Merkl's static-assets convention.
 */

export type SupportedChain = {
  id: number;
  name: string;
  icon: string;
};

const chainIcon = (id: number) => `https://storage.googleapis.com/merkl-static-assets/chains/${id}.svg`;

export const SUPPORTED_CHAINS: readonly SupportedChain[] = [
  { id: 1, name: "Ethereum", icon: chainIcon(1) },
  { id: 8453, name: "Base", icon: chainIcon(8453) },
  { id: 42161, name: "Arbitrum", icon: chainIcon(42161) },
  { id: 10, name: "Optimism", icon: chainIcon(10) },
  { id: 137, name: "Polygon", icon: chainIcon(137) },
  { id: 56, name: "BNB Chain", icon: chainIcon(56) },
  { id: 43114, name: "Avalanche", icon: chainIcon(43114) },
];

export function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === chainId)?.name ?? String(chainId);
}
