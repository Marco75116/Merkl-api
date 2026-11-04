import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Token } from "@/lib/merkl/schemas";

type TokenCellProps = Pick<Token, "name" | "symbol" | "displaySymbol" | "icon">;

export function TokenCell({ name, symbol, displaySymbol, icon }: TokenCellProps) {
  const label = displaySymbol ?? symbol;
  return (
    <div className="flex items-center gap-3">
      <Avatar size="sm">
        {icon ? <AvatarImage src={icon} alt="" /> : null}
        <AvatarFallback className="text-[10px]">{label.slice(0, 3).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 leading-tight">
        <div className="font-medium">{label}</div>
        <div className="truncate text-xs text-muted-foreground">{name ?? "—"}</div>
      </div>
    </div>
  );
}
