import { ANALYTICS } from "@/components/landing-pages/platform/DeliverAnalytics";
import { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";
import { AXIS, WEEK_LABELS } from "@/lib/landing-pages/previews/analytics-sample";
import { ChartPicture } from "./ChartPicture";
import { INK } from "./ink";

/** The plot area: 200px, and taller from lg where the card is as tall as the two figures beside it. */
const PLOT = "h-[200px] lg:h-[272px]";

/** The two series the chart stacks, with the words the copy gives them. */
function Legend() {
  const [returning, first] = ANALYTICS_PREVIEW.numbers.chart.legend;

  return (
    <div className="flex gap-3 text-[12px] leading-4 text-[var(--muted-foreground)]">
      {[
        [INK.navy, returning],
        [INK.periwinkle, first],
      ].map(([color, label]) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

/** One week's bar: first visits on top of the returning ones, as tall as the week's visits on the axis. */
function Bars({ height }: Readonly<{ height: string }>) {
  return (
    <div className={`relative flex items-end gap-[3%] border-b border-black/[0.08] ${height}`}>
      {ANALYTICS.weeks.map((week, index) => {
        const sum = week.returning + week.first;

        return (
          <div key={index} data-week={index} className="flex flex-1 flex-col" style={{ height: `${(100 * sum) / AXIS.max}%` }}>
            <div className="rounded-t-[2px]" style={{ height: `${(100 * week.first) / sum}%`, backgroundColor: INK.periwinkle }} />
            <div className="flex-1" style={{ backgroundColor: INK.navy }} />
          </div>
        );
      })}
    </div>
  );
}

/**
 * The weekly "Visits over time" chart: returning and first visits stacked, thirteen weeks, the sample café's.
 * `axis` adds the dashboard's scale and the dates under every second week; without it the bars stand alone, for
 * the small card beside the hero, which names the chart above it (`titled`).
 */
export function VisitsChart({ axis = false, titled = false }: Readonly<{ axis?: boolean; titled?: boolean }>) {
  const { chart } = ANALYTICS_PREVIEW.numbers;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        {titled && <p className="text-[13px] leading-4 font-semibold text-[var(--foreground)]">{chart.label}</p>}
        <Legend />
      </div>

      {axis ? (
        <div className="mt-4 flex">
          <div className={`relative w-9 shrink-0 ${PLOT}`}>
            {[...AXIS.ticks].reverse().map((tick) => (
              <span
                key={tick}
                className="absolute right-2 translate-y-1/2 text-[11px] leading-none tabular-nums text-[var(--muted-foreground)]"
                style={{ bottom: `${(100 * tick) / AXIS.max}%` }}
              >
                {tick}
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <div className="relative">
              {AXIS.ticks.slice(1).map((tick) => (
                <span key={tick} className="absolute inset-x-0 border-t border-black/[0.06]" style={{ bottom: `${(100 * tick) / AXIS.max}%` }} />
              ))}
              <Bars height={PLOT} />
            </div>
            <div className="mt-2 flex gap-[3%]">
              {ANALYTICS.weeks.map((_, index) => (
                <span key={index} className="relative h-4 flex-1">
                  {index % 2 === 0 && (
                    <span className="absolute left-1/2 -translate-x-1/2 text-[11px] leading-4 whitespace-nowrap text-[var(--muted-foreground)]">
                      {WEEK_LABELS[index / 2]}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <Bars height="h-[88px]" />
        </div>
      )}
    </div>
  );
}

/** The weekly chart on its axis as a picture: the visits in all, over the weeks, and the share from returning customers. */
export function VisitsPicture() {
  const { weeks } = ANALYTICS;
  const total = ANALYTICS.visits.total;
  const returning = weeks.reduce((sum, week) => sum + week.returning, 0);

  return (
    <ChartPicture
      label={`${ANALYTICS_PREVIEW.numbers.chart.label}: ${total.toLocaleString("en-US")} visits over ${weeks.length} weeks, ${Math.round((100 * returning) / total)}% from returning customers.`}
    >
      <VisitsChart axis />
    </ChartPicture>
  );
}
