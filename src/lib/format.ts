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

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const longDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" });

/** `day` is a Unix day (days since 1970-01-01 UTC). */
export function formatUnixDay(day: number, style: "short" | "long" = "short"): string {
  const date = new Date(day * 86_400_000);
  return style === "short" ? shortDate.format(date) : longDate.format(date);
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return "—";
  return Math.abs(value) < 1 ? usdSmall.format(value) : usd.format(value);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
