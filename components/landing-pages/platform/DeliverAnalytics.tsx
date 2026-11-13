import { ArrowRightIcon } from "@/components/icons";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";

/**
 * Aurevo's analytics, drawn: the figures are illustrative and match the
 * dashboard captures (90 days: 2,770 visits up 17%, 460 new customers up 11%,
 * 83% of the visits from returning customers, a 61% 30-day return rate up 2
 * points). Every plan has all of them. The feature previews' drawn dashboards
 * read these same numbers.
 */
export const ANALYTICS = {
  visits: { total: 2770, change: 17 },
  newCustomers: { total: 460, change: 11 },
  returnRate: { percent: 61, change: 2 },
  /** The 13 weeks of the "visits over time" chart, oldest first. */
  weeks: [
    { returning: 137, first: 25 },
    { returning: 164, first: 27 },
    { returning: 134, first: 22 },
    { returning: 143, first: 23 },
    { returning: 172, first: 30 },
    { returning: 170, first: 43 },
    { returning: 192, first: 46 },
    { returning: 181, first: 46 },
    { returning: 189, first: 48 },
    { returning: 207, first: 40 },
    { returning: 200, first: 35 },
    { returning: 210, first: 37 },
    { returning: 213, first: 36 },
  ],
} as const;

/** The dashboard's own labels for these figures (web's `analytics` catalog), as they appear on its tiles. */
export const DASHBOARD = {
  visits: "Visits",
  newCustomers: "New customers",
  returnRate: "30-day return rate",
  overTime: "Visits over time",
  returning: "Returning",
  first: "First visit",
} as const;

/** The dashboard's chart and trend colours, as its captures show them. */
export const INK = { navy: "#0f172a", periwinkle: "#adbbdc", up: "#2e9e5b", figure: "#1a1a1a", label: "#8a8a8a" } as const;

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
  const { weeks } = ANALYTICS;

  return (
    <div className={`col-span-2 ${TILE}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] leading-4 font-semibold" style={{ color: INK.figure }}>
          {DASHBOARD.overTime}
        </p>
        <div className="flex gap-2.5 text-[10px] leading-4" style={{ color: INK.label }}>
          <Legend color={INK.navy} label={DASHBOARD.returning} />
          <Legend color={INK.periwinkle} label={DASHBOARD.first} />
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
  const { visits, returnRate } = ANALYTICS;
  const total = visits.total.toLocaleString("en-US");
  const label = `Analytics: ${total} visits, up ${visits.change}%; a ${DASHBOARD.returnRate} of ${returnRate.percent}%, up ${returnRate.change} points; and the visits over time, week by week.`;

  return (
    <div role="img" aria-label={label} className="grid grid-cols-2 gap-2.5">
      <Kpi label={DASHBOARD.visits} value={total} trend={`▲${visits.change}%`} />
      <Kpi label={DASHBOARD.returnRate} value={`${returnRate.percent}%`} trend={`▲${returnRate.change} pts`} />
      <VisitsOverTime />
    </div>
  );
}

/** Aurevo's card going from 5 to 6 stamps on a scan, in the analytics' figure type. */
export function DeliverUpdate() {
  return (
    <p className="flex items-center gap-2.5">
      <Figure>{PLATFORM.deliver.updatesFrom}</Figure>
      <ArrowRightIcon size={18} weight="bold" aria-hidden className="text-[var(--accent-hover)]" />
      <Figure>{PLATFORM.deliver.updatesTo}</Figure>
    </p>
  );
}
