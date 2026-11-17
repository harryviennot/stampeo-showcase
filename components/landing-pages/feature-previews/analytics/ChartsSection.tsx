import type { ReactNode } from "react";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import type { LandingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";
import { CARD_TITLE } from "../../platform/classes";
import { LpSection } from "../../shared/LpSection";
import { BusiestChart, HabitsChart, RewardsChart } from "./HabitCharts";
import { CohortsChart, LevelsChart, LocationsChart } from "./GroupCharts";
import { NewCustomersChart, ReturnRateChart, SpendChart } from "./NumberCharts";
import { VisitsPicture } from "./VisitsChart";

type ChartKey = LandingCopy["previews"]["analytics"]["ANALYTICS_PREVIEW"]["charts"]["rows"][number]["key"];

/** The chart of each card; the tracked spend is money, in the currency of the page's `market`. */
const charts = (market: Market): Record<ChartKey, ReactNode> => ({
  visits: <VisitsPicture />,
  returnRate: <ReturnRateChart />,
  newCustomers: <NewCustomersChart />,
  busiest: <BusiestChart />,
  habits: <HabitsChart />,
  rewards: <RewardsChart />,
  cohorts: <CohortsChart />,
  levels: <LevelsChart />,
  spend: <SpendChart market={market} />,
  locations: <LocationsChart />,
});

/**
 * How many columns of the twelve each card takes from `lg`: the weekly chart is tall beside the two figures, and
 * the busiest times and how often they come are wide. On a tablet the cards pair up, with the weekly chart and the
 * levels across both.
 */
const SPAN: Record<ChartKey, string> = {
  visits: "md:col-span-2 lg:col-span-7 lg:row-span-2",
  returnRate: "lg:col-span-5",
  newCustomers: "lg:col-span-5",
  busiest: "lg:col-span-6",
  habits: "lg:col-span-6",
  rewards: "lg:col-span-4",
  cohorts: "lg:col-span-4",
  levels: "md:col-span-2 lg:col-span-4",
  spend: "lg:col-span-6",
  locations: "lg:col-span-6",
};

/** The cards that are one figure: it sits in the middle of the room under the line. */
const FIGURES: ChartKey[] = ["returnRate", "newCustomers", "spend"];

const TITLE = `${CARD_TITLE} lg:text-[1.375rem]`;

const SURFACE =
  "flex flex-col rounded-[28px] bg-white p-5 shadow-[0_2px_4px_rgba(25,18,16,0.04),0_24px_48px_-28px_rgba(25,18,16,0.2)] ring-1 ring-black/[0.06] sm:p-6";

/** Every chart of the dashboard as a card: its title and the one question it answers over the chart itself. */
export function ChartsSection({ market }: Readonly<{ market: Market }>) {
  const { eyebrow, title, lead, rows } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW.charts;
  const drawn = charts(market);

  return (
    <LpSection section="charts" anchor eyebrow={eyebrow} title={title} lead={lead} align="center">
      <ul className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 text-left md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        {rows.map((row) => (
          <li key={row.key} data-chart={row.key} className={`${SURFACE} ${SPAN[row.key]}`}>
            <h3 className={TITLE}>{row.title}</h3>
            <p className="mt-2 mb-5 text-[15px] leading-snug text-pretty text-[var(--muted-foreground)] sm:text-base">{row.line}</p>
            <div className={`flex flex-1 flex-col ${FIGURES.includes(row.key) ? "justify-center" : ""}`}>{drawn[row.key]}</div>
          </li>
        ))}
      </ul>
    </LpSection>
  );
}
