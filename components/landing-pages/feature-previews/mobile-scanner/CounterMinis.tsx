import type { ReactNode } from "react";
import { MiniFrame } from "../MiniFrame";
import { APP } from "./AppScreen";

/**
 * The labels on these screens are the Scanner app's own English strings
 * (scanner-app `src/locales/en/stamp.json` and `points.json`), so a visitor
 * reads what a team member will read.
 */

/** A screen mini sits on the app's own light surface. */
const SCREEN_SURFACE = { background: APP.surface, color: APP.ink } as const;

const PILL = "flex items-center justify-center rounded-full text-[15px] font-bold text-white";

/** A stepper key: white, rounded, with a minus or a plus. */
function StepKey({ plus = false }: Readonly<{ plus?: boolean }>) {
  return (
    <span className="flex h-[46px] w-[54px] items-center justify-center rounded-[16px] bg-white ring-1 ring-[#ddd9d0]">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={APP.ink} strokeWidth="3" strokeLinecap="round">
        <path d={plus ? "M5 12h14M12 5v14" : "M5 12h14"} />
      </svg>
    </span>
  );
}

/** Eight stamp dots: two on the card, three about to be added, three still empty. */
function StampDots() {
  const dots = ["#3a2418", "#3a2418", "#8a625c", "#8a625c", "#8a625c", "#ded7d5", "#ded7d5", "#ded7d5"];

  return (
    <div className="flex justify-center gap-[5px]">
      {dots.map((color, index) => (
        <span key={index} className="h-[14px] w-[14px] rounded-full" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

/** Adding several stamps in one scan: the stepper set to 3, and the button that says so. */
export function StampsMini() {
  return (
    <MiniFrame {...SCREEN_SURFACE} label="The Scanner app adding three stamps in one scan: a stepper set to 3 and the Add 3 stamps button.">
      <p className="text-center text-[13px] font-medium" style={{ color: APP.muted }}>
        Sophie
      </p>
      <div className="mt-2 flex items-center justify-between">
        <StepKey />
        <span className="text-[44px] leading-[50px] font-bold tabular-nums">3</span>
        <StepKey plus />
      </div>
      <p className="mt-1.5 text-center text-[13px] font-semibold" style={{ color: APP.brand }}>
        +3 stamps
      </p>
      <div className="mt-3">
        <StampDots />
      </div>
      <span className={`${PILL} mt-auto h-[46px]`} style={{ backgroundColor: APP.brand }}>
        Add 3 stamps
      </span>
    </MiniFrame>
  );
}

const KEYS: ReactNode[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [".", "0", "back"],
];

/** A keypad key: white, rounded, one glyph. */
function Key({ glyph }: Readonly<{ glyph: ReactNode }>) {
  return (
    <span className="flex h-[27px] flex-1 items-center justify-center rounded-[9px] bg-white text-[15px] font-semibold">
      {glyph === "back" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={APP.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 6l-6 6 6 6M4 12h16" />
        </svg>
      ) : (
        glyph
      )}
    </span>
  );
}

/** Points from what they spent: the amount typed so far, the points it earns, and the keypad. */
export function PointsMini() {
  return (
    <MiniFrame {...SCREEN_SURFACE} label="The Scanner app taking a spend amount of 12.50, with the keypad and the points it earns, about 12.">
      <div className="flex items-end justify-center gap-1.5">
        <span className="text-[40px] leading-[44px] font-bold tabular-nums">12.50</span>
        <span className="mb-1 text-[20px] font-semibold" style={{ color: APP.muted }}>
          $
        </span>
      </div>
      <div className="mt-1.5 flex justify-center">
        <span
          className="rounded-full px-3.5 py-[3px] text-[14px] font-semibold"
          style={{ backgroundColor: "#ebe3e2", color: APP.brand }}
        >
          ≈ +12 pts
        </span>
      </div>
      <div className="mt-auto flex flex-col gap-[5px]">
        {KEYS.map((row, index) => (
          <div key={index} className="flex gap-[5px]">
            {row.map((glyph, at) => (
              <Key key={at} glyph={glyph} />
            ))}
          </div>
        ))}
      </div>
    </MiniFrame>
  );
}

/** One reward the customer holds: its name and when it expires, or the Gift tag, and the Redeem button. */
function HeldReward({ name, meta }: Readonly<{ name: string; meta: ReactNode }>) {
  return (
    <div className="flex items-center gap-2 rounded-[16px] py-2 pr-2 pl-3" style={{ backgroundColor: "#efe9e8" }}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] leading-[17px] font-semibold">{name}</p>
        <p className="text-[11px] leading-[15px]">{meta}</p>
      </div>
      <span className="flex h-[30px] items-center rounded-full px-3 text-[12px] font-bold text-white" style={{ backgroundColor: APP.brand }}>
        Redeem
      </span>
    </div>
  );
}

/** Redeeming a reward on the spot: what the customer holds, one row each. */
export function RewardsMini() {
  return (
    <MiniFrame {...SCREEN_SURFACE} label="The Scanner app's list of rewards to redeem: three rewards, each with a Redeem button.">
      <p className="text-[11px] font-bold tracking-[0.04em] uppercase" style={{ color: APP.muted }}>
        Rewards to redeem
      </p>
      <div className="mt-2.5 flex flex-col gap-2">
        <HeldReward
          name="Free coffee"
          meta={
            <span className="font-semibold" style={{ color: "rgb(194, 65, 12)" }}>
              Expires today
            </span>
          }
        />
        <HeldReward
          name="Free pastry"
          meta={
            <span className="rounded-full px-1.5 py-px text-[10px] font-bold ring-1 ring-[#492c2a]" style={{ color: APP.brand }}>
              Gift
            </span>
          }
        />
        <HeldReward name="Free coffee" meta={<span style={{ color: APP.muted }}>Expires in 5 days</span>} />
      </div>
    </MiniFrame>
  );
}
