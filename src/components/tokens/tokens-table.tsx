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
            <TableRow key={token.id}>
              <TableCell>
                <TokenCell
                  name={token.name}
                  symbol={token.symbol}
                  displaySymbol={token.displaySymbol}
                  icon={token.icon}
                />
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
