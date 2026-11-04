"use client";

import { debounce, useQueryStates } from "nuqs";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SupportedChain } from "@/lib/constants/chains.constant";
import { SEARCH_MIN_LENGTH, tokenSearchParsers } from "@/lib/tokens/search-params";

const ALL_CHAINS = "all";
/** Keystrokes update local state at once; the URL (and the server fetch) wait for a pause. */
const SEARCH_DEBOUNCE_MS = 400;

type TokenFiltersProps = {
  chains: readonly SupportedChain[];
};

export function TokenFilters({ chains }: TokenFiltersProps) {
  const [isPending, startTransition] = useTransition();
  const [{ chainId, search }, setQuery] = useQueryStates(tokenSearchParsers, {
    shallow: false, // the server page owns the data, so re-render it
    startTransition,
  });

  // The URL only ever holds a valid search (>= SEARCH_MIN_LENGTH chars). Shorter
  // drafts stay local so they trigger neither a navigation nor a server render,
  // and equivalent searches always share the same URL.
  const [draft, setDraft] = useState(search ?? "");
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    // URL changed underneath us (back/forward, external link): resync, but keep
    // an in-progress short draft that we ourselves removed from the URL.
    setPrevSearch(search);
    if (search != null) setDraft(search);
    else if (draft.trim().length >= SEARCH_MIN_LENGTH) setDraft("");
  }
  const draftTooShort = draft.trim().length > 0 && draft.trim().length < SEARCH_MIN_LENGTH;

  const onSearchChange = (value: string) => {
    setDraft(value);
    const trimmed = value.trim();
    const options = { limitUrlUpdates: debounce(SEARCH_DEBOUNCE_MS) };
    if (trimmed.length >= SEARCH_MIN_LENGTH) {
      setQuery({ search: trimmed, page: null }, options);
    } else if (search != null) {
      setQuery({ search: null, page: null }, options);
    }
  };

  const items = [
    { value: ALL_CHAINS, label: "All chains" },
    ...chains.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <div className="flex flex-wrap items-start gap-3" aria-busy={isPending}>
      <div className="grid gap-1.5">
        <Label htmlFor="token-search">Search</Label>
        <Input
          id="token-search"
          type="search"
          placeholder="Name, symbol or address"
          className="w-64"
          value={draft}
          aria-describedby="token-search-hint"
          aria-invalid={draftTooShort || undefined}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <p id="token-search-hint" className="min-h-4 text-xs text-muted-foreground" aria-live="polite">
          {draftTooShort ? `Type at least ${SEARCH_MIN_LENGTH} characters` : null}
        </p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="chain-filter">Chain</Label>
        <Select
          items={items}
          value={chainId == null ? ALL_CHAINS : String(chainId)}
          onValueChange={(value) =>
            // Any filter change goes back to the first page.
            setQuery({ chainId: value === ALL_CHAINS || value == null ? null : Number(value), page: null })
          }
        >
          <SelectTrigger id="chain-filter" className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
