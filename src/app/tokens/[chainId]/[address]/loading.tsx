import { TokenDetailSkeleton } from "@/components/tokens/token-detail-skeleton";
import { TokenPriceChartSkeleton } from "@/components/tokens/token-price-chart-skeleton";

export default function TokenLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="h-4 w-20 animate-pulse rounded-md bg-muted" />
      <TokenDetailSkeleton />
      <TokenPriceChartSkeleton />
    </main>
  );
}
