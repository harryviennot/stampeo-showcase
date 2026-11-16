import { ANALYTICS } from "@/components/landing-pages/platform/DeliverAnalytics";
import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { SPEND, dollars } from "@/lib/landing-pages/previews/analytics-sample";
import { ChartPicture } from "./ChartPicture";
import { INK } from "./ink";

/** A figure as the dashboard sets it: large, semibold, tight and tabular. */
const FIGURE = "text-[3rem] leading-none font-semibold tracking-[-0.04em] tabular-nums text-[var(--foreground)] sm:text-[3.5rem]";

/** The return rate: the share of first-time customers who came back, as a figure over a bar filled to it. */
export function ReturnRateChart() {
  const { percent } = ANALYTICS.returnRate;

  return (
    <ChartPicture label={`Return rate: ${percent}% of first-time customers came back within a month.`}>
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

  return (
    <ChartPicture label={`New customers: ${total} signed up.`}>
      <p className="flex items-baseline gap-3">
        <span className={FIGURE}>{total}</span>
        <span className="text-[15px] text-[var(--muted-foreground)]">{ANALYTICS_PREVIEW.numbers.newCustomers.line}</span>
      </p>
    </ChartPicture>
  );
}

/** Tracked spend on a points card: what the team entered at the counter, and the average ticket. */
export function SpendChart() {
  const total = dollars(SPEND.total);
  const ticket = `average ticket ${dollars(SPEND.ticket, true)}`;

  return (
    <ChartPicture label={`Tracked spend: ${total}, ${ticket}.`}>
      <p className={FIGURE}>{total}</p>
      <p className="mt-3 text-[15px] text-[var(--muted-foreground)]">{ticket}</p>
    </ChartPicture>
  );
}
