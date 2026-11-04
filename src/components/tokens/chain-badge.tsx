import { Badge } from "@/components/ui/badge";
import { ChainIcon } from "@/components/tokens/chain-icon";
import type { Chain } from "@/lib/merkl/schemas";

type ChainBadgeProps = {
  chainId: number;
  /** Undefined when Merkl's chain list lacks the id or failed to load: the raw id is shown. */
  chain: Chain | undefined;
};

export function ChainBadge({ chainId, chain }: ChainBadgeProps) {
  return (
    <Badge variant="outline" className="gap-1.5">
      {chain ? <ChainIcon chain={chain} /> : null}
      {chain?.name ?? chainId}
    </Badge>
  );
}
