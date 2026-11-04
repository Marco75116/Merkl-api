import { TokensTableSkeleton } from "@/components/tokens/tokens-table-skeleton";

export default function TokensLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="rounded-lg border">
        <TokensTableSkeleton />
      </div>
    </main>
  );
}
