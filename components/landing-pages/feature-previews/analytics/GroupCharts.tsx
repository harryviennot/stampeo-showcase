import { Fragment } from "react";
import { useLocale } from "next-intl";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { fill, formatCount, listAnd } from "@/lib/landing-pages/format";
import {
  COHORTS,
  COHORT_DAYS,
  LEVELS,
  LEVEL_MOVES,
  LOCATIONS,
  cohortPercent,
} from "@/lib/landing-pages/previews/analytics-sample";
import { ChartPicture } from "./ChartPicture";
import { INK, RAMP } from "./ink";

const MUTED = "text-[var(--muted-foreground)]";

/** A cohort window's ramp step from its share: under 61 is the palest, 79 and over the darkest. */
const stepOf = (percent: number) => Math.min(RAMP.length - 1, Math.max(0, Math.floor((percent - 55) / 6)));

/** Monthly cohorts: of each month's first-time customers, the share who came back within 30, 60, 90 and 180 days. */
export function CohortsChart() {
  const { sample, chartWords } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW;
  const words = chartWords.cohorts;
  const windows = listAnd(COHORT_DAYS.map(String), sample.and);

  return (
    <ChartPicture label={fill(words.alt, { days: windows })}>
      <div className="grid grid-cols-[2.25rem_repeat(4,minmax(0,1fr))] gap-[3px] text-[11px] leading-4">
        <span />
        {COHORT_DAYS.map((days) => (
          <span key={days} className={`text-center ${MUTED}`}>
            {fill(words.window, { days })}
          </span>
        ))}
        {COHORTS.map(({ size, back }, row) => (
          <Fragment key={sample.cohortMonths[row]}>
            <span data-cohort={sample.cohortMonths[row]} className={`self-center pr-1.5 text-right ${MUTED}`}>
              {sample.cohortMonths[row]}
            </span>
            {COHORT_DAYS.map((days, at) => {
              if (back[at] === undefined) {
                return (
                  <span key={days} className={`flex h-9 items-center justify-center ${MUTED}`}>
                    –
                  </span>
                );
              }
              const percent = cohortPercent(size, back[at]);
              const step = stepOf(percent);

              return (
                <span
                  key={days}
                  className="flex h-9 items-center justify-center rounded-[5px] text-[11px] font-semibold tabular-nums"
                  style={{ backgroundColor: RAMP[step], color: step >= 3 ? "white" : INK.navy }}
                >
                  {percent}%
                </span>
              );
            })}
          </Fragment>
        ))}
      </div>
      <p className={`mt-3 text-[12px] leading-4 ${MUTED}`}>{words.note}</p>
    </ChartPicture>
  );
}

/** The ramp colour of each level, from the lowest to the highest. */
const LEVEL_TONES = [RAMP[2], RAMP[3], RAMP[4]];

/** Levels: the customers on each level today, and the customers who moved up a level in each of the last six months. */
export function LevelsChart() {
  const copy = useLandingCopy();
  const { sample, chartWords } = copy.previews.analytics.ANALYTICS_PREVIEW;
  const { levelNames } = copy.shared.SHARED;
  const names = [levelNames.bronze, levelNames.silver, levelNames.gold];
  const words = chartWords.levels;
  const widest = Math.max(...LEVELS.map((level) => level.customers));
  const tallest = Math.max(...LEVEL_MOVES.map((month) => month.count));
  const counts = LEVELS.map((level, index) => fill(words.on, { customers: level.customers, level: names[index] })).join(", ");

  return (
    <ChartPicture label={fill(words.alt, { levels: counts })}>
      <ul className="flex flex-col gap-3">
        {LEVELS.map(({ customers }, index) => (
          <li key={names[index]}>
            <div className="flex items-baseline justify-between gap-3 text-[13px] leading-5 sm:text-sm">
              <span className={MUTED}>{names[index]}</span>
              <span className="font-semibold tabular-nums text-[var(--foreground)]">{customers}</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full" style={{ backgroundColor: INK.track }}>
              <div className="h-full rounded-full" style={{ width: `${(100 * customers) / widest}%`, backgroundColor: LEVEL_TONES[index] }} />
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 border-t border-black/[0.07] pt-4 text-[13px] leading-4 font-semibold text-[var(--foreground)]">{words.moves}</p>
      <div className="mt-3 flex items-end gap-2">
        {LEVEL_MOVES.map(({ count }, index) => (
          <div key={sample.moveMonths[index]} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[11px] leading-4 font-semibold tabular-nums text-[var(--foreground)]">{count}</span>
            <div className="w-full rounded-t-[3px]" style={{ height: `${Math.round((56 * count) / tallest)}px`, backgroundColor: INK.navy }} />
            <span className={`text-[11px] leading-4 ${MUTED}`}>{sample.moveMonths[index]}</span>
          </div>
        ))}
      </div>
    </ChartPicture>
  );
}

/** By location: the picker that shows every chart for one shop at a time, over the locations and their visits. */
export function LocationsChart() {
  const { sample, chartWords } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW;
  const words = chartWords.locations;
  const locale = useLocale();
  const widest = Math.max(...LOCATIONS.map((location) => location.visits));
  const visits = (count: number) => formatCount(locale, count);
  const total = LOCATIONS.reduce((sum, location) => sum + location.visits, 0);
  const list = listAnd(
    LOCATIONS.map((location, index) => fill(words.item, { name: sample.locations[index], visits: visits(location.visits) })),
    sample.and,
  );

  return (
    <ChartPicture label={fill(words.alt, { locations: list })}>
      <div className="flex h-11 items-center justify-between rounded-xl px-3.5 text-[14px] font-semibold text-[var(--foreground)] ring-1 ring-black/[0.14]">
        <span>{words.all}</span>
        <span className={MUTED}>▾</span>
      </div>
      <ul className="mt-2 flex flex-col gap-1 rounded-xl p-1.5 ring-1 ring-black/[0.07]">
        <li className="flex h-9 items-center justify-between rounded-lg px-2.5 text-[13px] font-semibold text-[var(--foreground)] sm:text-sm" style={{ backgroundColor: INK.track }}>
          <span>{words.all}</span>
          <span className="flex items-center gap-2 tabular-nums">
            {visits(total)}
            <span style={{ color: INK.navy }}>✓</span>
          </span>
        </li>
        {LOCATIONS.map(({ visits: count }, index) => (
          <li key={sample.locations[index]} className="px-2.5 py-1.5">
            <div className="flex items-baseline justify-between text-[13px] leading-5 sm:text-sm">
              <span className={MUTED}>{sample.locations[index]}</span>
              <span className="font-semibold tabular-nums text-[var(--foreground)]">{visits(count)}</span>
            </div>
            <div className="mt-1 h-2 rounded-full" style={{ backgroundColor: INK.track }}>
              <div className="h-full rounded-full" style={{ width: `${(100 * count) / widest}%`, backgroundColor: INK.periwinkle }} />
            </div>
          </li>
        ))}
      </ul>
    </ChartPicture>
  );
}
