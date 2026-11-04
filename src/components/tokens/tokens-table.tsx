import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TokenCell } from "@/components/tokens/token-cell";
import { formatAddress, formatPrice } from "@/lib/format";
import { getChainName } from "@/lib/constants/chains.constant";
import type { Token } from "@/lib/merkl/schemas";

type TokensTableProps = {
  tokens: Token[];
};

export function TokensTable({ tokens }: TokensTableProps) {

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead>Address</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Decimals</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tokens.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
              No tokens match these filters.
            </TableCell>
          </TableRow>
        ) : (
          tokens.map((token) => (
            // The whole row is clickable through the stretched link in the first
            // cell: a real <a>, so it works without JS and is keyboard-reachable.
            <TableRow key={token.id} className="relative cursor-pointer">
              <TableCell>
                <Link
                  href={`/tokens/${token.id}`}
                  className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:ring-2 [&:focus-visible]:after:ring-ring"
                >
                  <TokenCell
                    name={token.name}
                    symbol={token.symbol}
                    displaySymbol={token.displaySymbol}
                    icon={token.icon}
                  />
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getChainName(token.chainId)}</Badge>
              </TableCell>
              <TableCell className="font-mono text-xs" title={token.address}>
                {formatAddress(token.address)}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatPrice(token.price)}</TableCell>
              <TableCell className="text-right tabular-nums">{token.decimals}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
