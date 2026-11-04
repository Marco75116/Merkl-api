"use client";

import { Button } from "@/components/ui/button";

export default function TokensError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Tokens</h1>
      <div className="rounded-lg border p-6">
        <p className="font-medium">Could not load tokens.</p>
        <p className="mt-1 text-sm text-muted-foreground">Merkl may be slow or unavailable. Try again in a moment.</p>
        <Button className="mt-4" variant="outline" size="sm" onClick={reset}>
          Retry
        </Button>
      </div>
    </main>
  );
}
