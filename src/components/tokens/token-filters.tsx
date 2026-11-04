"use client";

import { debounce, useQueryStates } from "nuqs";
import { useState, useTransition } from "react";
import { ChainIcon } from "@/components/tokens/chain-icon";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { InputGroupAddon } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import type { Chain } from "@/lib/merkl/schemas";
import { SEARCH_MIN_LENGTH, tokenSearchParsers } from "@/lib/tokens/search-params";

/** Keystrokes update local state at once; the URL (and the server fetch) wait for a pause. */
const SEARCH_DEBOUNCE_MS = 400;

type TokenFiltersProps = {
  chains: Chain[];
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

  // No selection means all chains; the clear button gets back there.
  const selectedChain = chains.find((c) => c.id === chainId) ?? null;

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
        {/* Searchable: Merkl supports ~70 chains, too many to scan in a plain select. */}
        <Combobox
          items={chains}
          value={selectedChain}
          // Any filter change goes back to the first page.
          onValueChange={(chain) => setQuery({ chainId: chain?.id ?? null, page: null })}
          itemToStringLabel={(chain) => chain.name}
          isItemEqualToValue={(a, b) => a.id === b.id}
        >
          <ComboboxInput id="chain-filter" placeholder="All chains" className="w-56" showClear={selectedChain != null}>
            {selectedChain ? (
              <InputGroupAddon>
                <ChainIcon chain={selectedChain} />
              </InputGroupAddon>
            ) : null}
          </ComboboxInput>
          <ComboboxContent>
            <ComboboxEmpty>No chain matches.</ComboboxEmpty>
            <ComboboxList>
              {(chain: Chain) => (
                <ComboboxItem key={chain.id} value={chain}>
                  <ChainIcon chain={chain} />
                  {chain.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  );
}
