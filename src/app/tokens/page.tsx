import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { TokenFilters } from "@/components/tokens/token-filters";
import { TokensPagination } from "@/components/tokens/tokens-pagination";
import { TokensTable } from "@/components/tokens/tokens-table";
import { TokensTableSkeleton } from "@/components/tokens/tokens-table-skeleton";
import { loadTokenListQuery } from "@/lib/tokens/search-params";
import { SUPPORTED_CHAINS } from "@/lib/constants/chains.constant";
import { listTokens } from "@/lib/tokens/service";

export const metadata: Metadata = {
  title: "Tokens · Merkl",
  description: "Tokens indexed by Merkl",
};

export default function TokensPage(props: PageProps<"/tokens">) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tokens</h1>
        <p className="text-sm text-muted-foreground">Tokens indexed by Merkl across supported chains.</p>
      </header>
      {/* Everything above is the static shell; searchParams is read only inside the boundary. */}
      <Suspense fallback={<TokensTableSkeleton />}>
        <TokensList searchParams={props.searchParams} />
      </Suspense>
    </main>
  );
}

async function TokensList({ searchParams }: Pick<PageProps<"/tokens">, "searchParams">) {
  const query = await loadTokenListQuery(searchParams);
  // Token data is request-time only; keep it out of Next's runtime prerender.
  await connection();
  const result = await listTokens(query);

  return (
    <div className="space-y-4">
      <TokenFilters chains={SUPPORTED_CHAINS} />
      <div className="rounded-lg border">
        <TokensTable tokens={result.items} />
      </div>
      <TokensPagination
        page={result.page}
        pageSize={result.pageSize}
        hasNextPage={result.hasNextPage}
        shownCount={result.items.length}
      />
    </div>
  );
}
