import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { TokenDetailSkeleton } from "@/components/tokens/token-detail-skeleton";
import { TokenDetailView } from "@/components/tokens/token-detail";
import { TokenPriceChart } from "@/components/tokens/token-price-chart";
import { MerklError } from "@/lib/merkl/errors";
import { tokenRefSchema } from "@/lib/tokens/routes";
import { getToken, getTokenPriceHistory, isRewardToken } from "@/lib/tokens/service";

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

export default function TokenPage(props: PageProps<"/tokens/[chainId]/[address]">) {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-6 py-10">
      <Link href="/tokens" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
        ← All tokens
      </Link>
      <Suspense fallback={<TokenDetailSkeleton />}>
        <TokenLoader params={props.params} />
      </Suspense>
    </main>
  );
}

async function TokenLoader({ params }: Pick<PageProps<"/tokens/[chainId]/[address]">, "params">) {
  // Malformed chain id or address is a 404, not a Merkl round-trip.
  const ref = tokenRefSchema.safeParse(await params);
  if (!ref.success) notFound();
  await connection();
  const [token, history, isReward] = await Promise.all([
    getToken(ref.data).catch((error: unknown) => {
      if (error instanceof MerklError && error.kind === "not-found") notFound();
      throw error;
    }),
    // The chart is secondary: an upstream failure there must not take the page down.
    getTokenPriceHistory(ref.data).catch((error: unknown) => {
      if (error instanceof MerklError) return null;
      throw error;
    }),
    // Same for the reward flag: unknown (null) rather than a broken page.
    isRewardToken(ref.data).catch((error: unknown) => {
      if (error instanceof MerklError) return null;
      throw error;
    }),
  ]);
  return (
    <>
      <TokenDetailView token={token} isReward={isReward} />
      <TokenPriceChart points={history?.map(({ day, close, min, max }) => ({ day, close, min, max })) ?? null} />
    </>
  );
}
