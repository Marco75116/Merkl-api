import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Chain } from "@/lib/merkl/schemas";

export function ChainIcon({ chain }: { chain: Pick<Chain, "name" | "icon"> }) {
  return (
    <Avatar className="size-4">
      <AvatarImage src={chain.icon} alt="" />
      <AvatarFallback className="text-[8px]">{chain.name.slice(0, 1)}</AvatarFallback>
    </Avatar>
  );
}
