"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { formatPrice, formatUnixDay } from "@/lib/format";

/** Plain, serialisable rows: the server page shapes them, this component only draws. */
export type PricePoint = {
  /** Unix day (days since 1970-01-01 UTC). */
  day: number;
  close: number;
  min: number;
  max: number;
};

type TokenPriceChartProps = {
  /** Oldest first. `null` when the history could not be loaded; `[]` when Merkl has no feed. */
  points: PricePoint[] | null;
};

const chartConfig = {
  // The neutral theme's chart tokens are faint greys; primary ink reads in both modes.
  close: { label: "Close", color: "var(--primary)" },
} satisfies ChartConfig;

export function TokenPriceChart({ points }: TokenPriceChartProps) {
  const first = points?.[0];
  const last = points?.at(-1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Price history</CardTitle>
        <CardDescription>
          {first && last
            ? `Daily close in USD, ${formatUnixDay(first.day, "long")} to ${formatUnixDay(last.day, "long")}`
            : "Daily close in USD"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {points == null ? (
          <Empty>Price history is unavailable right now.</Empty>
        ) : points.length === 0 ? (
          <Empty>Merkl has no price samples for this token in the last year.</Empty>
        ) : (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                minTickGap={48}
                tickFormatter={(day: number) => formatUnixDay(day)}
              />
              <YAxis
                dataKey="close"
                width={72}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(value: number) => formatPrice(value)}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  const point = payload?.[0]?.payload as PricePoint | undefined;
                  if (!active || !point) return null;
                  return (
                    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-sm">
                      <p className="font-medium">{formatUnixDay(point.day, "long")}</p>
                      <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 tabular-nums">
                        <dt className="text-muted-foreground">Close</dt>
                        <dd className="text-right">{formatPrice(point.close)}</dd>
                        <dt className="text-muted-foreground">Low</dt>
                        <dd className="text-right">{formatPrice(point.min)}</dd>
                        <dt className="text-muted-foreground">High</dt>
                        <dd className="text-right">{formatPrice(point.max)}</dd>
                      </dl>
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="var(--color-close)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="flex h-24 items-center justify-center text-sm text-muted-foreground">{children}</p>;
}
