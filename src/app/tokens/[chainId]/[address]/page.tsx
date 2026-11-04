import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TokenDetailSkeleton } from "@/components/tokens/token-detail-skeleton";
import { TokenDetailView } from "@/components/tokens/token-detail";
import { TokenPriceChart } from "@/components/tokens/token-price-chart";
import { TokenPriceChartSkeleton } from "@/components/tokens/token-price-chart-skeleton";
import { MerklError } from "@/lib/merkl/errors";
import { tokenRefSchema, type TokenRef } from "@/lib/tokens/routes";
import { getToken, getTokenPriceHistory, isRewardToken } from "@/lib/tokens/service";

type Params = Pick<PageProps<"/tokens/[chainId]/[address]">, "params">;

export async function generateMetadata({ params }: PageProps<"/tokens/[chainId]/[address]">): Promise<Metadata> {
  const ref = tokenRefSchema.safeParse(await params);
  if (!ref.success) return { title: "Token · Merkl tokens" };
  try {
    const token = await getToken(ref.data);
    return { title: `${token.displaySymbol ?? token.symbol} · Merkl tokens` };
  } catch {
    return { title: "Token · Merkl tokens" };
  }
}

/**
 * Each section below is its own Suspense boundary with its own Merkl call, so
 * React starts the three requests together and streams every section as soon
 * as its own data is back: the token card does not wait for the chart.
 */
export default function TokenPage(props: PageProps<"/tokens/[chainId]/[address]">) {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <Link href="/tokens" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        ← All tokens
      </Link>
      <Suspense fallback={<TokenDetailSkeleton />}>
        <TokenDetails params={props.params} />
      </Suspense>
      <Suspense fallback={<TokenPriceChartSkeleton />}>
        <TokenPriceHistory params={props.params} />
      </Suspense>
    </main>
  );
}

/** Malformed chain id or address is a 404, not a Merkl round-trip. */
async function resolveRef(params: Params["params"]): Promise<TokenRef> {
  const ref = tokenRefSchema.safeParse(await params);
  if (!ref.success) notFound();
  return ref.data;
}

/** Secondary data must not take the page down: unknown (null) rather than an error. */
function nullOnMerklError(error: unknown): null {
  if (error instanceof MerklError) return null;
  throw error;
}

async function TokenDetails({ params }: Params) {
  const ref = await resolveRef(params);
  // Started before the token is awaited so the two requests overlap; the badge
  // then streams into the header on its own without holding the card back.
  const isReward = isRewardToken(ref).catch(nullOnMerklError);
  const token = await getToken(ref).catch((error: unknown) => {
    if (error instanceof MerklError && error.kind === "not-found") notFound();
    throw error;
  });
  return (
    <TokenDetailView
      token={token}
      rewardBadge={
        <Suspense fallback={<Skeleton className="h-5 w-16 rounded-4xl" />}>
          <RewardBadge isReward={isReward} />
        </Suspense>
      }
    />
  );
}

async function RewardBadge({ isReward }: { isReward: Promise<boolean | null> }) {
  return (await isReward) ? <Badge title="Can be distributed as a campaign reward">Reward</Badge> : null;
}

async function TokenPriceHistory({ params }: Params) {
  const ref = await resolveRef(params);
  const history = await getTokenPriceHistory(ref).catch(nullOnMerklError);
  return <TokenPriceChart points={history?.map(({ day, close, min, max }) => ({ day, close, min, max })) ?? null} />;
}
