import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Same footprint as `TokenPriceChart` so the card does not jump when the data streams in. */
export function TokenPriceChartSkeleton() {
  return (
    <Card aria-busy="true" aria-label="Loading price history">
      <CardHeader className="space-y-1.5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}
