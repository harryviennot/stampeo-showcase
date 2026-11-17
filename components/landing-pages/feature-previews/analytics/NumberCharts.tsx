import { useLocale } from "next-intl";
import { ANALYTICS } from "@/lib/landing-pages/platform/analytics-figures";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { fill, formatSampleMoney } from "@/lib/landing-pages/format";
import { SPEND } from "@/lib/landing-pages/previews/analytics-sample";
import type { Market } from "@/lib/markets";
import { ChartPicture } from "./ChartPicture";
import { INK } from "./ink";

/** A figure as the dashboard sets it: large, semibold, tight and tabular. */
const FIGURE = "text-[3rem] leading-none font-semibold tracking-[-0.04em] tabular-nums text-[var(--foreground)] sm:text-[3.5rem]";

/** The return rate: the share of first-time customers who came back, as a figure over a bar filled to it. */
export function ReturnRateChart() {
  const { percent } = ANALYTICS.returnRate;
  const { chartWords } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW;

  return (
    <ChartPicture label={fill(chartWords.returnRate.alt, { percent })}>
      <p className={FIGURE}>{percent}%</p>
      <div className="mt-4 h-3 rounded-full" style={{ backgroundColor: INK.track }}>
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: INK.navy }} />
      </div>
    </ChartPicture>
  );
}

/** New customers: the people who joined the card, with the dashboard's own word for them. */
export function NewCustomersChart() {
  const { total } = ANALYTICS.newCustomers;
  const { numbers, chartWords } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW;

  return (
    <ChartPicture label={fill(chartWords.newCustomers.alt, { total })}>
      <p className="flex items-baseline gap-3">
        <span className={FIGURE}>{total}</span>
        <span className="text-[15px] text-[var(--muted-foreground)]">{numbers.newCustomers.line}</span>
      </p>
    </ChartPicture>
  );
}

/** Tracked spend on a points card: what the team entered at the counter, and the average ticket, in the currency of the page's `market`. */
export function SpendChart({ market }: Readonly<{ market: Market }>) {
  const { spend } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW.chartWords;
  const locale = useLocale();
  const total = formatSampleMoney(locale, market, SPEND.total);
  const ticket = fill(spend.ticket, { amount: formatSampleMoney(locale, market, SPEND.ticket, true) });

  return (
    <ChartPicture label={fill(spend.alt, { total, ticket })}>
      <p className={FIGURE}>{total}</p>
      <p className="mt-3 text-[15px] text-[var(--muted-foreground)]">{ticket}</p>
    </ChartPicture>
  );
}
