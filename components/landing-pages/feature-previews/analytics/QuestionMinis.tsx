import { INK, TileFrame } from "./TileFrame";

/**
 * The tiles of four dashboard sections, drawn with the figures of the sample
 * café's captures. Their labels are the dashboard's own English strings
 * (web `messages/en/analytics.json`), and none names a city.
 */

const TITLE = "text-[13px] leading-4 font-semibold";

/** The share of first-time customers who came back within 30 days: the figure, its trend and what it measures. */
export function ReturnRateMini() {
  return (
    <TileFrame label="The 30-day return rate: 61%, up 2 points, of first-time customers who came back.">
      <p className="text-[12px] leading-4" style={{ color: INK.label }}>
        30-day return rate
      </p>
      <div className="mt-auto flex items-baseline justify-between gap-2">
        <span className="text-[68px] leading-none font-semibold tracking-[-0.04em] tabular-nums">61%</span>
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: INK.up }}>
          ▲2 pts
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ backgroundColor: INK.track }}>
        <div className="h-full rounded-full" style={{ width: "61%", backgroundColor: INK.navy }} />
      </div>
      <p className="mt-2.5 mb-auto text-[12px] leading-4" style={{ color: INK.label }}>
        of first-time customers came back
      </p>
    </TileFrame>
  );
}

/** The five groups the dashboard sorts customers into by how often they come, each with its count. */
const HABITS = [
  { label: "About every week", count: 191, tone: INK.navy },
  { label: "Every 2 weeks", count: 125, tone: INK.navy },
  { label: "About once a month", count: 106, tone: INK.navy },
  { label: "Less often", count: 33, tone: INK.periwinkle },
  { label: "Came once", count: 205, tone: INK.periwinkle },
] as const;

/** How often they come: a bar per group, from every week to came once. */
export function HabitsMini() {
  const widest = Math.max(...HABITS.map((habit) => habit.count));

  return (
    <TileFrame label="How often they come: about every week 191, every 2 weeks 125, about once a month 106, less often 33, came once 205.">
      <p className={TITLE}>How often they come</p>
      <div className="mt-3 flex flex-1 flex-col justify-between">
        {HABITS.map(({ label, count, tone }) => (
          <div key={label}>
            <div className="flex items-baseline justify-between text-[11px] leading-[14px]">
              <span style={{ color: INK.label }}>{label}</span>
              <span className="font-semibold tabular-nums">{count}</span>
            </div>
            <div className="mt-1 h-2 rounded-full" style={{ backgroundColor: INK.track }}>
              <div className="h-full rounded-full" style={{ width: `${(100 * count) / widest}%`, backgroundColor: tone }} />
            </div>
          </div>
        ))}
      </div>
    </TileFrame>
  );
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM"];

/** The week by day and hour, one step of the ramp per cell: 0 is the fewest visits, 4 the most (Thursday, 8 to 9 AM). */
const WEEK = [
  [1, 1, 1, 2, 1, 0, 0],
  [3, 3, 3, 4, 3, 2, 1],
  [3, 2, 3, 3, 3, 2, 1],
  [2, 2, 2, 3, 2, 3, 2],
  [2, 1, 2, 2, 2, 3, 2],
  [2, 2, 2, 2, 3, 3, 3],
];

/** Light to dark: from the fewest visits to the most. */
const RAMP = ["#eceff7", "#c9d3ea", "#8fa3d1", "#4a63a8", INK.navy];

/** Busiest times: visits by day and hour, the busiest slot the darkest. */
export function BusiestMini() {
  return (
    <TileFrame label="Busiest times: visits by day and hour in a typical week, busiest on Thursday from 8 to 9 AM.">
      <p className={TITLE}>Busiest times</p>
      <div className="mt-2 flex flex-1 flex-col">
        <div className="ml-[30px] grid grid-cols-7 gap-[3px] text-center text-[9px] leading-3" style={{ color: INK.label }}>
          {DAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="mt-1 flex flex-col gap-[3px]">
          {WEEK.map((row, hour) => (
            <div key={HOURS[hour]} className="flex items-center gap-[3px]">
              <span className="w-[27px] shrink-0 text-right text-[9px] leading-3" style={{ color: INK.label }}>
                {HOURS[hour]}
              </span>
              <div className="grid flex-1 grid-cols-7 gap-[3px]">
                {row.map((step, day) => (
                  <span key={DAYS[day]} className="h-[19px] rounded-[4px]" style={{ backgroundColor: RAMP[step] }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between text-[9px] leading-3" style={{ color: INK.label }}>
          <span>Fewer visits</span>
          <span className="flex gap-[2px]">
            {RAMP.map((color) => (
              <span key={color} className="h-2 w-3 rounded-[2px]" style={{ backgroundColor: color }} />
            ))}
          </span>
          <span>More visits</span>
        </div>
      </div>
    </TileFrame>
  );
}

/** Customers by stamps on their 8-stamp card (877 cards): still coming, and not back for 30 days or more. */
const PROGRESS = [
  { label: "0-1", still: 250, gone: 60 },
  { label: "2-3", still: 210, gone: 30 },
  { label: "4-5", still: 165, gone: 15 },
  { label: "6-7", still: 120, gone: 5 },
] as const;

const READY = 22;
const CHART_HEIGHT = 104;

/** Reward progress: where customers are on their card, and how many have a reward ready. */
export function RewardProgressMini() {
  const tallest = Math.max(...PROGRESS.map((group) => group.still + group.gone));
  const px = (count: number) => Math.max(3, Math.round((CHART_HEIGHT * count) / tallest));

  return (
    <TileFrame label="Reward progress: customers by stamps on their card, with 22 rewards ready.">
      <p className={TITLE}>Reward progress</p>
      <div className="mt-3 flex flex-1 items-end gap-[7px] border-b border-black/[0.07] pb-0" style={{ minHeight: CHART_HEIGHT }}>
        {PROGRESS.map(({ label, still, gone }) => (
          <div key={label} className="flex flex-1 flex-col">
            <div className="rounded-t-[3px]" style={{ height: px(gone), backgroundColor: INK.periwinkle }} />
            <div style={{ height: px(still), backgroundColor: INK.navy }} />
          </div>
        ))}
        <div className="flex flex-1 flex-col">
          <div className="rounded-t-[3px]" style={{ height: px(READY), backgroundColor: "var(--accent)" }} />
        </div>
      </div>
      <div className="mt-1 flex gap-[7px] text-center text-[10px] leading-3 tabular-nums" style={{ color: INK.label }}>
        {PROGRESS.map(({ label }) => (
          <span key={label} className="flex-1">
            {label}
          </span>
        ))}
        <span className="flex-1" />
      </div>
      <div className="mt-auto flex items-center justify-between text-[11px] leading-4">
        <span className="flex items-center gap-1.5" style={{ color: INK.label }}>
          <span className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: "var(--accent)" }} />
          Reward ready
        </span>
        <span className="font-semibold tabular-nums">{READY}</span>
      </div>
    </TileFrame>
  );
}
