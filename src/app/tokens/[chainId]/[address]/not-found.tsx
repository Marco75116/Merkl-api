import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TokenNotFound() {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Token not found</h1>
      <p className="text-sm text-muted-foreground">Merkl has no token at this address on this chain.</p>
      <Button variant="outline" size="sm" render={<Link href="/tokens" />}>
        Back to tokens
      </Button>
    </main>
  );
}
