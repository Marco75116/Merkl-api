const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const usdSmall = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export function formatUnixSeconds(seconds: number | null | undefined): string {
  if (seconds == null) return "—";
  return `${dateTime.format(new Date(seconds * 1000))} UTC`;
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "—";
  return Math.abs(value) < 1 ? usdSmall.format(value) : usd.format(value);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
