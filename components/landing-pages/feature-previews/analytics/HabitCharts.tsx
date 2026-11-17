import { Fragment } from "react";
import { useLocale } from "next-intl";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { fill } from "@/lib/landing-pages/format";
import { CARD_STAMPS } from "@/lib/landing-pages/previews/analytics-customers";
import { BUSIEST, HABITS, PROGRESS, READY, busiestSlots } from "@/lib/landing-pages/previews/analytics-sample";
import { ChartPicture } from "./ChartPicture";
import { INK, RAMP } from "./ink";

const MUTED = "text-[var(--muted-foreground)]";

/** Busiest times: visits by day and hour in a typical week, the busiest slot the darkest, with the two slots named. */
export function BusiestChart() {
  const { sample, chartWords } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW;
  const words = chartWords.busiest;
  const { busiest, quietest } = busiestSlots({ ...sample, slot: words.slot });

  return (
    <ChartPicture label={fill(words.alt, { busiest, quietest })}>
      <dl className="grid gap-1.5 text-[13px] leading-5 sm:text-sm">
        {[
          [words.busiest, busiest],
          [words.quietest, quietest],
        ].map(([term, slot]) => (
          <div key={term} className="flex flex-wrap justify-between gap-x-3">
            <dt className={MUTED}>{term}</dt>
            <dd className="font-semibold text-[var(--foreground)]">{slot}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 grid grid-cols-[2.75rem_repeat(7,minmax(0,1fr))] gap-[3px] text-[11px] leading-4">
        <span />
        {sample.days.map((day) => (
          <span key={day} className={`text-center ${MUTED}`}>
            {day}
          </span>
        ))}
        {BUSIEST.steps.map((row, hour) => (
          <Fragment key={sample.hours[hour]}>
            <span className={`self-center pr-1.5 text-right ${MUTED}`}>{sample.hours[hour]}</span>
            {row.map((step, day) => (
              <span key={sample.days[day]} className="h-7 rounded-[5px] sm:h-8" style={{ backgroundColor: RAMP[step] }} />
            ))}
          </Fragment>
        ))}
      </div>

      <div className={`mt-3 flex items-center justify-between text-[11px] leading-4 ${MUTED}`}>
        <span>{words.fewer}</span>
        <span className="flex gap-[3px]">
          {RAMP.map((color) => (
            <span key={color} className="h-2.5 w-5 rounded-[3px]" style={{ backgroundColor: color }} />
          ))}
        </span>
        <span>{words.more}</span>
      </div>
    </ChartPicture>
  );
}

/** How often they come: a bar per group, from every week to came once; the regular groups are the darker ones. */
export function HabitsChart() {
  const { sample, chartWords } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW;
  const locale = useLocale();
  const widest = Math.max(...HABITS.map((habit) => habit.count));
  const list = HABITS.map((habit, index) => `${sample.habits[index].toLocaleLowerCase(locale)} ${habit.count}`).join(", ");

  return (
    <ChartPicture label={fill(chartWords.habits.alt, { list })}>
      <ul className="flex flex-col gap-3.5">
        {HABITS.map(({ key, count }, index) => (
          <li key={key}>
            <div className="flex items-baseline justify-between gap-3 text-[13px] leading-5 sm:text-sm">
              <span className={MUTED}>{sample.habits[index]}</span>
              <span className="font-semibold tabular-nums text-[var(--foreground)]">{count}</span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full" style={{ backgroundColor: INK.track }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(100 * count) / widest}%`, backgroundColor: index < 3 ? INK.navy : INK.periwinkle }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className={`mt-4 text-[12px] leading-4 ${MUTED}`}>{chartWords.habits.note}</p>
    </ChartPicture>
  );
}

const HEIGHT = 176;

/** Reward progress: customers by stamps on their card, still coming and not back for 30 days or more, and the rewards ready. */
export function RewardsChart() {
  const { rewards } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW.chartWords;
  const tallest = Math.max(...PROGRESS.map((group) => group.still + group.gone));
  const px = (count: number) => Math.max(3, Math.round((HEIGHT * count) / tallest));

  return (
    <ChartPicture label={fill(rewards.alt, { ready: READY })}>
      <div className="flex items-end gap-2 border-b border-black/[0.08]" style={{ height: HEIGHT }}>
        {PROGRESS.map(({ label, still, gone }) => (
          <div key={label} className="flex flex-1 flex-col">
            <div className="rounded-t-[3px]" style={{ height: px(gone), backgroundColor: INK.periwinkle }} />
            <div style={{ height: px(still), backgroundColor: INK.navy }} />
          </div>
        ))}
        <div className="flex flex-1 flex-col">
          <div className="rounded-t-[3px]" style={{ height: px(READY), backgroundColor: INK.mid }} />
        </div>
      </div>
      <div className={`mt-1.5 flex gap-2 text-center text-[11px] leading-4 tabular-nums ${MUTED}`}>
        {PROGRESS.map(({ label }) => (
          <span key={label} className="flex-1">
            {label}
          </span>
        ))}
        <span className="flex-1">{rewards.ready}</span>
      </div>
      <p className={`mt-1 text-center text-[11px] leading-4 ${MUTED}`}>{fill(rewards.stamps, { count: CARD_STAMPS })}</p>
      <ul className={`mt-4 flex flex-col gap-1.5 text-[12px] leading-4 ${MUTED}`}>
        {[
          [INK.navy, rewards.stillComing, null],
          [INK.periwinkle, rewards.notBack, null],
          [INK.mid, rewards.rewardReady, READY],
        ].map(([color, label, count]) => (
          <li key={label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: String(color) }} />
              {label}
            </span>
            {count !== null && <span className="font-semibold tabular-nums text-[var(--foreground)]">{count}</span>}
          </li>
        ))}
      </ul>
    </ChartPicture>
  );
}
