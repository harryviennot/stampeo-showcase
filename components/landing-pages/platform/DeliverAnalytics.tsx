import { useLocale } from "next-intl";
import { ArrowRightIcon } from "@/components/icons";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { fill, formatCount } from "@/lib/landing-pages/format";
import { ANALYTICS, INK } from "@/lib/landing-pages/platform/analytics-figures";

/** The chart's top, as the dashboard's axis rounds it. */
const AXIS_MAX = 260;

const TILE = "rounded-2xl bg-white p-3 ring-1 ring-black/[0.05] sm:p-3.5";

/** A figure as the dashboard's tiles print it: large, semibold, tight, tabular, in the tiles' ink. */
function Figure({ children }: Readonly<{ children: string }>) {
  return (
    <span className="text-[1.625rem] leading-none font-semibold tracking-[-0.03em] tabular-nums" style={{ color: INK.figure }}>
      {children}
    </span>
  );
}

/** One of the dashboard's figure tiles: its label, the figure, and the trend beside it. */
export function Kpi({ label, value, trend }: Readonly<{ label: string; value: string; trend: string }>) {
  return (
    <div className={TILE}>
      <p className="truncate text-[11px] leading-4" style={{ color: INK.label }}>
        {label}
      </p>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <Figure>{value}</Figure>
        <span className="text-[11px] font-semibold tabular-nums" style={{ color: INK.up }}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function Legend({ color, label }: Readonly<{ color: string; label: string }>) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

/** The weekly "Visits over time" tile: returning and first visits stacked, thirteen weeks. */
export function VisitsOverTime() {
  const { analyticsCard } = useLandingCopy().platform.PLATFORM;
  const { weeks } = ANALYTICS;

  return (
    <div className={`col-span-2 ${TILE}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] leading-4 font-semibold" style={{ color: INK.figure }}>
          {analyticsCard.overTime}
        </p>
        <div className="flex gap-2.5 text-[10px] leading-4" style={{ color: INK.label }}>
          <Legend color={INK.navy} label={analyticsCard.returning} />
          <Legend color={INK.periwinkle} label={analyticsCard.first} />
        </div>
      </div>
      <div className="mt-3 flex h-[72px] items-end gap-[3%] border-b border-black/[0.07]">
        {weeks.map((week, index) => {
          const sum = week.returning + week.first;
          return (
            <div
              key={index}
              data-week={index}
              className="flex flex-1 flex-col"
              style={{ height: `${(100 * sum) / AXIS_MAX}%` }}
            >
              <div className="rounded-t-[2px]" style={{ height: `${(100 * week.first) / sum}%`, backgroundColor: INK.periwinkle }} />
              <div className="flex-1" style={{ backgroundColor: INK.navy }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The two figures over the weekly chart, in the dashboard's tiles; read out as one picture. */
export function DeliverAnalytics() {
  const { analyticsCard } = useLandingCopy().platform.PLATFORM;
  const { visits, returnRate } = ANALYTICS;
  const total = formatCount(useLocale(), visits.total);
  const label = fill(analyticsCard.alt, {
    visits: total,
    visitsChange: visits.change,
    returnRate: analyticsCard.returnRate,
    returnRatePercent: returnRate.percent,
    returnRateChange: returnRate.change,
  });

  return (
    <div role="img" aria-label={label} className="grid grid-cols-2 gap-2.5">
      <Kpi label={analyticsCard.visits} value={total} trend={`▲${visits.change}%`} />
      <Kpi label={analyticsCard.returnRate} value={`${returnRate.percent}%`} trend={`▲${returnRate.change} ${analyticsCard.points}`} />
      <VisitsOverTime />
    </div>
  );
}

/** Aurevo's card going from 5 to 6 stamps on a scan, in the analytics' figure type. */
export function DeliverUpdate() {
  const { PLATFORM } = useLandingCopy().platform;

  return (
    <p className="flex items-center gap-2.5">
      <Figure>{PLATFORM.deliver.updatesFrom}</Figure>
      <ArrowRightIcon size={18} weight="bold" aria-hidden className="text-[var(--accent-hover)]" />
      <Figure>{PLATFORM.deliver.updatesTo}</Figure>
    </p>
  );
}
