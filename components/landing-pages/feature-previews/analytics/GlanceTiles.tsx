import { Kpi, VisitsOverTime } from "../../platform/DeliverAnalytics";

/**
 * The top of the dashboard's Analytics page, which every plan has, as it lays
 * out on a phone: visits and new customers side by side, the 30-day return
 * rate across, then the weekly chart. The figures are the sample café's, as
 * the dashboard captures show them.
 */
export function GlanceTiles() {
  return (
    <div
      role="img"
      aria-label="Analytics: 2,770 visits, up 17%; 460 new customers, up 11%; a 30-day return rate of 61%, up 2 points; and the visits over time, week by week."
      className="w-full max-w-[460px] rounded-[28px] bg-[var(--background-subtle)] p-3.5 sm:p-5"
    >
      <div aria-hidden className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <Kpi label="Visits" value="2,770" trend="▲17%" />
        <Kpi label="New customers" value="460" trend="▲11%" />
        <div className="col-span-2">
          <Kpi label="30-day return rate" value="61%" trend="▲2 pts" />
        </div>
        <VisitsOverTime />
      </div>
    </div>
  );
}
