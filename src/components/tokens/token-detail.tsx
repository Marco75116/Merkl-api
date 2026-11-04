import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChainBadge } from "@/components/tokens/chain-badge";
import { formatPrice, formatUnixSeconds } from "@/lib/format";
import type { Chain, TokenDetail } from "@/lib/merkl/schemas";
import { tokenPath } from "@/lib/tokens/routes";

type TokenDetailProps = {
  token: TokenDetail;
  /** Undefined when Merkl's chain list lacks the token's chain. */
  chain: Chain | undefined;
  /** Rendered among the header badges; a slot so the page can stream it in behind its own Suspense. */
  rewardBadge?: React.ReactNode;
};

export function TokenDetailView({ token, chain, rewardBadge }: TokenDetailProps) {
  const label = token.displaySymbol ?? token.symbol;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Avatar size="lg">
          {token.icon ? <AvatarImage src={token.icon} alt="" /> : null}
          <AvatarFallback>{label.slice(0, 3).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{label}</h1>
          <p className="truncate text-sm text-muted-foreground">{token.name ?? "—"}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1">
          <ChainBadge chainId={token.chainId} chain={chain} />
          {token.verified ? <Badge variant="secondary">Verified</Badge> : <Badge variant="outline">Unverified</Badge>}
          {rewardBadge}
          {token.isNative ? <Badge variant="outline">Native</Badge> : null}
          {token.isTest ? <Badge variant="destructive">Test</Badge> : null}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Identity</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <Field label="Address">
                <code className="break-all font-mono text-xs">{token.address}</code>
              </Field>
              <Field label="Chain id">{token.chainId}</Field>
              <Field label="Decimals">{token.decimals}</Field>
              <Field label="Type">{token.type}</Field>
              <Field label="Merkl id">
                <code className="font-mono text-xs">{token.id}</code>
              </Field>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <Field label="Price">
                <span className="tabular-nums">{formatPrice(token.price)}</span>
              </Field>
              <Field label="Source">{token.priceSource ?? "—"}</Field>
              <Field label="Updated">{formatUnixSeconds(token.updatedAt)}</Field>
            </dl>
          </CardContent>
        </Card>

        {token.underlying ? (
          <Card>
            <CardHeader>
              <CardTitle>Underlying token</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <Link href={tokenPath(token.underlying)} className="font-medium underline-offset-4 hover:underline">
                {token.underlying.displaySymbol ?? token.underlying.symbol}
              </Link>
              <span className="text-muted-foreground"> · {token.underlying.name ?? "—"}</span>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  );
}
