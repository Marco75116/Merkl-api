import { Skeleton } from "@/components/ui/skeleton";

/** Same footprint as `TokenFilters` while its search-param hooks resolve. */
export function TokenFiltersSkeleton() {
  return (
    <div className="flex flex-wrap items-start gap-3" aria-busy="true" aria-label="Loading filters">
      <div className="grid gap-1.5">
        <Skeleton className="h-3.5 w-12" />
        <Skeleton className="h-9 w-64" />
        <div className="min-h-4" />
      </div>
      <div className="grid gap-1.5">
        <Skeleton className="h-3.5 w-10" />
        <Skeleton className="h-9 w-48" />
      </div>
    </div>
  );
}
