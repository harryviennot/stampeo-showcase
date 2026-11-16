import { ANALYTICS, DASHBOARD, Kpi, VisitsOverTime } from "../../platform/DeliverAnalytics";

/** The dashboard's light grey page under its white tiles: the tray a pane's drawn dashboard sits on. */
export const TRAY = "w-full max-w-[460px] rounded-[28px] bg-[var(--background-subtle)] p-3.5 sm:p-5";

/**
 * The top of the dashboard's Analytics page, as it lays
 * out on a phone: visits and new customers side by side, the 30-day return
 * rate across, then the weekly chart. The figures are Platform's `ANALYTICS`,
 * the sample café's as the dashboard captures show them.
 */
export function GlanceTiles() {
  const { visits, newCustomers, returnRate } = ANALYTICS;
  const total = visits.total.toLocaleString("en-US");
  const label = `Analytics: ${total} visits, up ${visits.change}%; ${newCustomers.total} new customers, up ${newCustomers.change}%; a ${DASHBOARD.returnRate} of ${returnRate.percent}%, up ${returnRate.change} points; and the visits over time, week by week.`;

  return (
    <div role="img" aria-label={label} className={TRAY}>
      <div aria-hidden className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <Kpi label={DASHBOARD.visits} value={total} trend={`▲${visits.change}%`} />
        <Kpi label={DASHBOARD.newCustomers} value={String(newCustomers.total)} trend={`▲${newCustomers.change}%`} />
        <div className="col-span-2">
          <Kpi label={DASHBOARD.returnRate} value={`${returnRate.percent}%`} trend={`▲${returnRate.change} pts`} />
        </div>
        <VisitsOverTime />
      </div>
    </div>
  );
}
