import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { TokenDetailSkeleton } from "@/components/tokens/token-detail-skeleton";
import { TokenDetailView } from "@/components/tokens/token-detail";
import { MerklError } from "@/lib/merkl/errors";
import { getToken } from "@/lib/tokens/service";

export async function generateMetadata({ params }: PageProps<"/tokens/[id]">): Promise<Metadata> {
  const { id } = await params;
  try {
    const token = await getToken(id);
    return { title: `${token.displaySymbol ?? token.symbol} · Merkl tokens` };
  } catch {
    return { title: "Token · Merkl tokens" };
  }
}

export default function TokenPage(props: PageProps<"/tokens/[id]">) {
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

async function TokenLoader({ params }: Pick<PageProps<"/tokens/[id]">, "params">) {
  const { id } = await params;
  await connection();
  const token = await getToken(id).catch((error: unknown) => {
    if (error instanceof MerklError && error.kind === "not-found") notFound();
    throw error;
  });
  return <TokenDetailView token={token} />;
}
