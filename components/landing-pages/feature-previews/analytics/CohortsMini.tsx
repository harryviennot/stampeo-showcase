import { MiniFrame } from "../MiniFrame";
import { INK } from "./ink";

/**
 * The two tiles Pro adds to the dashboard's Analytics page, drawn like the charts beside them: monthly
 * cohorts and the location filter. Labels are the dashboard's own English strings (web
 * `messages/en/analytics.json`), and none names a city.
 */

const TITLE = "text-[13px] leading-4 font-semibold";
const TILE_SURFACE = { className: "bg-white", color: INK.figure } as const;

/** Light to dark: from the smallest share of a month's first-time customers who came back to the largest. */
const RAMP = ["#eceff7", "#c9d3ea", "#8fa3d1", "#4a63a8", INK.navy];

const HORIZONS = ["30 d", "60 d", "90 d", "180 d"];

/**
 * First-visit months, newest first, and the ramp step of each window that has passed (a window that has not
 * passed yet is left out and drawn as a dash). A month's share only grows as its windows lengthen.
 */
const COHORTS = [
  { key: "sep", label: "Sep", steps: [2] },
  { key: "aug", label: "Aug", steps: [2, 3] },
  { key: "jul", label: "Jul", steps: [1, 2, 3] },
  { key: "jun", label: "Jun", steps: [2, 3, 3] },
  { key: "may", label: "May", steps: [2, 2, 3] },
  { key: "apr", label: "Apr", steps: [2, 3, 3, 4] },
] as const;

/** Monthly cohorts (Pro): of each month's first-time customers, the share who came back within 30, 60, 90 and 180 days. */
export function CohortsMini() {
  return (
    <MiniFrame
      {...TILE_SURFACE}
      label="Monthly cohorts: of each month's first-time customers, the share who came back within 30, 60, 90 and 180 days."
    >
      <p className={TITLE}>Monthly cohorts</p>
      <div className="mt-2 ml-[30px] grid grid-cols-4 gap-[3px] text-center text-[9px] leading-3" style={{ color: INK.label }}>
        {HORIZONS.map((horizon) => (
          <span key={horizon}>{horizon}</span>
        ))}
      </div>
      <div className="mt-1 flex flex-1 flex-col justify-between">
        {COHORTS.map(({ key, label, steps }) => (
          <div key={key} data-cohort={key} className="flex items-center gap-[3px]">
            <span className="w-[27px] shrink-0 text-right text-[9px] leading-3" style={{ color: INK.label }}>
              {label}
            </span>
            <div className="grid flex-1 grid-cols-4 gap-[3px]">
              {HORIZONS.map((horizon, at) =>
                steps[at] === undefined ? (
                  <span key={horizon} className="flex h-[21px] items-center justify-center text-[9px] leading-3" style={{ color: INK.label }}>
                    –
                  </span>
                ) : (
                  <span key={horizon} className="h-[21px] rounded-[4px]" style={{ backgroundColor: RAMP[steps[at]] }} />
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[9px] leading-3" style={{ color: INK.label }}>
        A dash means that window has not passed yet.
      </p>
    </MiniFrame>
  );
}

/** The locations the picker lists: made up, and named for no city. */
const LOCATIONS = ["Main Street", "Harbor Road"];

/** The location filter (Pro): one picker over every section, so each location can be read on its own. */
export function LocationMini() {
  return (
    <MiniFrame {...TILE_SURFACE} label="Filter by location: every section of the page, one location at a time.">
      <p className={TITLE}>Filter by location</p>
      <div
        className="mt-3 flex h-9 items-center justify-between rounded-[10px] px-3 text-[12px] leading-4 font-semibold ring-1 ring-black/[0.12]"
        style={{ color: INK.figure }}
      >
        <span>All locations</span>
        <span aria-hidden style={{ color: INK.label }}>
          ▾
        </span>
      </div>
      <ul className="mt-2 flex flex-col gap-1.5 rounded-[10px] p-1.5 ring-1 ring-black/[0.06]">
        {["All locations", ...LOCATIONS].map((name, at) => (
          <li
            key={name}
            className="flex h-7 items-center justify-between rounded-[7px] px-2 text-[11px] leading-4"
            style={at === 0 ? { backgroundColor: "#eceff7", color: INK.figure } : { color: INK.label }}
          >
            <span className={at === 0 ? "font-semibold" : undefined}>{name}</span>
            {at === 0 && <span style={{ color: INK.navy }}>✓</span>}
          </li>
        ))}
      </ul>
      <p className="mt-auto text-[9px] leading-3" style={{ color: INK.label }}>
        Every section, one location at a time.
      </p>
    </MiniFrame>
  );
}
