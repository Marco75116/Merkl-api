"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useQueryStates } from "nuqs";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TOKEN_PAGE_SIZES,
  tokenSearchParsers,
  type TokenPageSize,
} from "@/lib/tokens/search-params";

type TokensPaginationProps = {
  page: number;
  pageSize: TokenPageSize;
  hasNextPage: boolean;
  shownCount: number;
};

export function TokensPagination({ page, pageSize, hasNextPage, shownCount }: TokensPaginationProps) {
  const [isPending, startTransition] = useTransition();
  const [, setQuery] = useQueryStates(tokenSearchParsers, {
    shallow: false, // the server page owns the data, so re-render it
    startTransition,
  });

  return (
    <nav
      aria-label="Pagination"
      aria-busy={isPending}
      className="flex flex-wrap items-center justify-between gap-4 text-sm"
    >
      <div className="flex items-center gap-2">
        <Label htmlFor="page-size">Rows per page</Label>
        <Select
          value={pageSize}
          onValueChange={(value) => {
            // A new page size invalidates the current offset.
            if (value != null) setQuery({ items: value, page: null });
          }}
        >
          <SelectTrigger id="page-size" size="sm" className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOKEN_PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground">{shownCount} tokens</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Previous page"
          disabled={page <= 1 || isPending}
          onClick={() => setQuery({ page: page - 1 })}
        >
          <ChevronLeftIcon />
        </Button>
        <p className="min-w-16 text-center tabular-nums" aria-live="polite">
          Page {page}
        </p>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Next page"
          disabled={!hasNextPage || isPending}
          onClick={() => setQuery({ page: page + 1 })}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </nav>
  );
}
