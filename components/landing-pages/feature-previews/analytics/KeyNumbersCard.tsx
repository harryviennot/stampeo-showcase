import { useLocale } from "next-intl";
import { ANALYTICS } from "@/lib/landing-pages/platform/analytics-figures";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { fill, formatCount } from "@/lib/landing-pages/format";
import { CUSTOMERS_SEEN } from "@/lib/landing-pages/previews/analytics-sample";
import { GlassCard } from "../../platform/GlassCard";
import { INK } from "./ink";
import { VisitsChart } from "./VisitsChart";

const TILE = "rounded-2xl bg-white ring-1 ring-black/[0.05]";

/** One key number: its label and the dashboard's line under it on the left, the figure and its trend on the right. */
function KeyNumber({ label, line, value, trend }: Readonly<{ label: string; line: string; value: string; trend: string }>) {
  return (
    <div className={`${TILE} flex items-center justify-between gap-4 px-4 py-3.5`}>
      <div className="min-w-0">
        <p className="text-[13px] leading-4 font-semibold text-[var(--foreground)]">{label}</p>
        <p className="mt-1 text-[12px] leading-4 text-pretty text-[var(--muted-foreground)]">{line}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[1.75rem] leading-none font-semibold tracking-[-0.03em] tabular-nums text-[var(--foreground)]">{value}</p>
        <p className="mt-1.5 text-[12px] leading-4 font-semibold tabular-nums" style={{ color: INK.up }}>
          {trend}
        </p>
      </div>
    </div>
  );
}

/**
 * The visual beside the analytics hero: the dashboard's key numbers in one card (visits, return rate, new
 * customers) over the weekly visits chart, with the sample café's figures. The whole card is one picture.
 */
export function KeyNumbersCard() {
  const copy = useLandingCopy();
  const { numbers, hero } = copy.previews.analytics.ANALYTICS_PREVIEW;
  const { points } = copy.platform.PLATFORM.analyticsCard;
  const locale = useLocale();
  const { visits, returnRate, newCustomers } = ANALYTICS;

  return (
    <GlassCard title={numbers.title} className="w-full max-w-[560px] text-left">
      <div role="img" aria-label={hero.alt}>
        <div aria-hidden className="flex flex-col gap-2.5">
          <KeyNumber
            label={numbers.visits.label}
            line={fill(numbers.visits.line, { customers: CUSTOMERS_SEEN })}
            value={formatCount(locale, visits.total)}
            trend={`▲${visits.change}%`}
          />
          <KeyNumber
            label={numbers.returnRate.label}
            line={numbers.returnRate.line}
            value={`${returnRate.percent}%`}
            trend={`▲${returnRate.change} ${points}`}
          />
          <KeyNumber
            label={numbers.newCustomers.label}
            line={numbers.newCustomers.line}
            value={String(newCustomers.total)}
            trend={`▲${newCustomers.change}%`}
          />
          <div className={`${TILE} p-4`}>
            <VisitsChart titled />
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
