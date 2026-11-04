import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLUMNS = ["Token", "Chain", "Address", "Price", "Decimals"];

export function TokensTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <Table aria-busy="true" aria-label="Loading tokens">
      <TableHeader>
        <TableRow>
          {COLUMNS.map((c) => (
            <TableHead key={c}>{c}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }, (_, i) => (
          <TableRow key={i}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="size-6 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-14" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </TableCell>
            {COLUMNS.slice(1).map((c) => (
              <TableCell key={c}>
                <Skeleton className="h-4 w-20" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
