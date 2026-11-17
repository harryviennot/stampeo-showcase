import type { ReactNode } from "react";
import { APP } from "./appColors";

/**
 * The Scanner app's four counter screens, drawn for the phone on the preview: its own English labels
 * (scanner-app `src/locales/en/stamp.json` and `points.json`) over its own colours, each in the brand of the shop
 * whose customer is being served, as the app takes the business's colour. They are the inside of a pane: the
 * pane gives them a name, and the phone gives them their frame.
 */

/** Each shop's action colour: Aurevo's from the Scanner loop, Marginalia's, Wrenfold's and Gaspard & Gus's from their cards. */
export const SHOP_BRAND = { aurevo: APP.brand, marginalia: "#14432e", wrenfold: "#0b0b0b", gaspardGus: "#040404" } as const;

type Brand = (typeof SHOP_BRAND)[keyof typeof SHOP_BRAND];

const PILL = "flex h-[46px] items-center justify-center rounded-full text-[15px] font-bold text-white";

/** The app's customer header: the initial in the brand's colour, the name, and a line under it. */
function CustomerRow({ brand, detail, chip }: Readonly<{ brand: Brand; detail: string; chip?: string }>) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px] font-bold text-white" style={{ backgroundColor: brand }}>
        S
      </span>
      <div className="min-w-0">
        <p className="text-[16px] leading-5 font-bold" style={{ color: APP.ink }}>
          Sophie
        </p>
        <div className="mt-0.5 flex items-center gap-1.5">
          {chip && (
            <span className="rounded-full px-2 py-px text-[12px] leading-4 font-bold ring-1 ring-[#ddd9d0]" style={{ color: APP.ink }}>
              {chip}
            </span>
          )}
          <span className="text-[13px] leading-4 font-semibold" style={{ color: APP.muted }}>
            {detail}
          </span>
        </div>
      </div>
    </div>
  );
}

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

/** Eight stamp dots: five on the card in the brand's dark, three about to be added in its light tone. */
function StampDots() {
  const dots = [...Array(5).fill("#3a2418"), ...Array(3).fill("#8a625c")];

  return (
    <div className="flex justify-center gap-[7px]">
      {dots.map((color, index) => (
        <span key={index} className="h-[16px] w-[16px] rounded-full" style={{ backgroundColor: color }} />
      ))}
    </div>
  );
}

/** Adding three stamps in one scan: the stepper set to 3, the card it completes, and the button that says so. */
export function StampsScreen() {
  return (
    <>
      <CustomerRow brand={SHOP_BRAND.aurevo} detail="5 / 8" />
      <div className="mt-7 flex items-center justify-between">
        <StepKey />
        <span className="text-[48px] leading-[54px] font-bold tabular-nums" style={{ color: APP.ink }}>
          3
        </span>
        <StepKey plus />
      </div>
      <p className="mt-2 text-center text-[14px] font-semibold" style={{ color: SHOP_BRAND.aurevo }}>
        +3 stamps
      </p>
      <p className="text-center text-[12px] leading-5" style={{ color: APP.muted }}>
        This completes the card
      </p>
      <div className="mt-5">
        <StampDots />
      </div>
      <span className={`${PILL} mt-8`} style={{ backgroundColor: SHOP_BRAND.aurevo }}>
        Add 3 stamps
      </span>
    </>
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
    <span className="flex h-[30px] flex-1 items-center justify-center rounded-[10px] bg-white text-[16px] font-semibold" style={{ color: APP.ink }}>
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

/** Points from what they spent: the amount typed so far, the points it earns before anyone confirms, and the keypad. */
export function PointsScreen() {
  return (
    <>
      <CustomerRow brand={SHOP_BRAND.marginalia} detail="240 pts" />
      <div className="mt-5 flex items-end justify-center gap-1.5" style={{ color: APP.ink }}>
        <span className="text-[44px] leading-[48px] font-bold tabular-nums">12.50</span>
        <span className="mb-1 text-[20px] font-semibold" style={{ color: APP.muted }}>
          $
        </span>
      </div>
      <div className="mt-1.5 flex justify-center">
        <span className="rounded-full bg-[#e6ece8] px-3.5 py-[3px] text-[14px] font-semibold" style={{ color: SHOP_BRAND.marginalia }}>
          ≈ +12 pts
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-[5px]">
        {KEYS.map((row, index) => (
          <div key={index} className="flex gap-[5px]">
            {row.map((glyph, at) => (
              <Key key={at} glyph={glyph} />
            ))}
          </div>
        ))}
      </div>
      <span className={`${PILL} mt-3`} style={{ backgroundColor: SHOP_BRAND.marginalia }}>
        Add Points
      </span>
    </>
  );
}

/** One reward the customer holds: its name and when it expires, or the Gift tag, and the Redeem button. */
function HeldReward({ name, meta }: Readonly<{ name: string; meta: ReactNode }>) {
  return (
    <div className="flex items-center gap-2 rounded-[16px] py-2.5 pr-2.5 pl-3.5" style={{ backgroundColor: "#efe9e8" }}>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] leading-[18px] font-semibold" style={{ color: APP.ink }}>
          {name}
        </p>
        <p className="text-[12px] leading-4">{meta}</p>
      </div>
      <span className="flex h-[32px] items-center rounded-full px-3.5 text-[13px] font-bold text-white" style={{ backgroundColor: SHOP_BRAND.aurevo }}>
        Redeem
      </span>
    </div>
  );
}

/** Redeeming a reward on the spot, or leaving it for next time: what the customer holds, one row each. */
export function RewardsScreen() {
  return (
    <>
      <CustomerRow brand={SHOP_BRAND.aurevo} detail="8 / 8" />
      <p className="mt-6 text-[12px] font-bold tracking-[0.04em] uppercase" style={{ color: APP.muted }}>
        Rewards to redeem
      </p>
      <div className="mt-2.5 flex flex-col gap-2.5">
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
            <span className="rounded-full px-1.5 py-px text-[11px] font-bold ring-1 ring-[#492c2a]" style={{ color: APP.brand }}>
              Gift
            </span>
          }
        />
        <HeldReward name="Free coffee" meta={<span style={{ color: APP.muted }}>Expires in 5 days</span>} />
      </div>
    </>
  );
}

/**
 * What the register shows for a customer on a level: their level beside their name, and the perks to apply before
 * charging, in the app's wording ("Silver perk: …" for one, "Silver perks:" over a list for more). The dry cleaner's
 * Silver customer unless a page passes its own shop.
 */
export function LevelScreen({
  brand = SHOP_BRAND.wrenfold,
  level = "Silver",
  detail = "4 / 6",
  perks = ["Free hanger return", "Priority pickup"],
}: Readonly<{ brand?: Brand; level?: string; detail?: string; perks?: readonly string[] }>) {
  const one = perks.length === 1;

  return (
    <>
      <CustomerRow brand={brand} detail={detail} chip={level} />
      <div
        className="mt-7 flex items-start gap-2.5 rounded-[14px] px-3 py-3 ring-1"
        style={{ backgroundColor: APP.amberTint, ["--tw-ring-color" as string]: "rgba(245, 158, 11, 0.35)" }}
      >
        <svg className="mt-0.5 shrink-0" width="18" height="18" viewBox="0 0 256 256" fill={APP.amber} aria-hidden>
          <path d="M234.5 114.38l-45.1 39.36 13.51 58.6a16 16 0 01-23.84 17.34l-51.07-31-51 31a16 16 0 01-23.85-17.34l13.51-58.6-45.1-39.36a16 16 0 019.11-28.06l59.46-5.15 23.21-55.36a15.95 15.95 0 0129.44 0l23.2 55.36 59.47 5.15a16 16 0 019.15 28.06z" />
        </svg>
        <div className="min-w-0">
          <p className="text-[15px] leading-5 font-bold" style={{ color: APP.ink }}>
            {one ? `${level} perk: ${perks[0]}` : `${level} perks:`}
          </p>
          {!one &&
            perks.map((perk) => (
              <p key={perk} className="text-[14px] leading-5 font-semibold" style={{ color: APP.ink }}>
                {perk}
              </p>
            ))}
          <p className="mt-1 text-[12px] leading-4" style={{ color: APP.muted }}>
            {one ? "Apply it at the till before charging." : "Apply them at the till before charging."}
          </p>
        </div>
      </div>
      <span className={`${PILL} mt-8`} style={{ backgroundColor: brand }}>
        Add Stamp
      </span>
    </>
  );
}
