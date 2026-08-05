/**
 * Geometry for the landing hero's fan of cards: seven sample wallet cards laid
 * along an arch, one upright at the apex and the rest dropping and leaning
 * outward, with the outermost pair deliberately bleeding off the viewport.
 *
 * The numbers live here rather than in the component for two reasons: they are
 * the thing that gets tuned by eye (one table to edit, not seven JSX blocks),
 * and the symmetry that makes the arch read as an arch is worth asserting in a
 * test rather than eyeballing (see hero-fan.test.ts).
 *
 * They ship as CSS custom properties, not Tailwind classes: Tailwind v4's
 * scanner only sees literal class strings in the source, so `left-[${x}%]`
 * composed from data would never be generated. globals.css picks the active
 * tier out of the three sets with two media queries (.fan-slot).
 */
import type { CSSProperties } from "react";

import {
  POINTS_SAMPLES,
  STAMP_SAMPLES,
  type PointsSample,
  type StampSample,
} from "@/lib/loyalty-samples";

/** Breakpoints match Tailwind's `sm:` (40rem) and `lg:` (64rem), which the
 *  slot visibility classes use — the two must agree or cards would resize at
 *  one width and appear at another. */
export type FanTier = "sm" | "md" | "lg";

type PerTier<T> = Record<FanTier, T>;

export interface FanSlot {
  /** Position in the arch: 0 is the apex, negative is left of it. */
  index: number;
  /** Sample id in STAMP_SAMPLES or POINTS_SAMPLES. */
  cardId: string;
  /** Card center, as a percentage of the strip's width. */
  x: PerTier<number>;
  /** Drop below the apex, as a percentage of the strip's width (1cqw).
   *  Width-relative, not px, so the arc stays a circle at every viewport
   *  rather than only at the one it was solved at. */
  y: PerTier<number>;
  /** Lean, in degrees. Negative leans left. */
  r: PerTier<number>;
  /** Rendered card width. Fluid so the arch scales between breakpoints. */
  width: PerTier<string>;
  /** Inner cards overlap outer ones. All well under the header's z-50. */
  z: number;
  /** Stagger for the deal-in, so the arch opens from the middle out. */
  delayMs: number;
  /** Parallax travel over the hero's scroll, in px / degrees. */
  driftX: number;
  driftY: number;
  driftR: number;
  /** Tailwind classes that drop the card below its breakpoint: the arch is
   *  3 cards on phones, 5 on tablets, 7 on desktop. */
  visibility: string;
}

/**
 * Brands are alternated light/dark against the cream page and mix both engines,
 * so the three cards that survive on a phone still show a stamp card and a
 * points card. The apex is aurevo — the café card is the clearest read at a
 * glance and the one used everywhere else as the flagship.
 *
 * Three rules the numbers exist to keep, each visible the moment it breaks:
 *
 *   The cards sit on a circle. A slot's horizontal offset, its drop and its
 *   lean are three views of one angle along an arc of radius R:
 *
 *     offset = R sin0     drop = R (1 - cos0)     lean = 0
 *
 *   which is the same as saying `drop = offset * tan(lean / 2)`. Tune those
 *   three by eye independently and the arch stops being an arch — the cards
 *   read as scattered, because a card leaning 12 degrees sitting where a
 *   72-degree card belongs is not on any curve the eye can complete. Pick the
 *   angles, then let the circle place the card. hero-fan.test.ts asserts it.
 *
 *   Cards never touch. Every neighbouring pair keeps a gap, so the arch reads
 *   as a row of separate cards rather than a pile. An overlapping fan looks
 *   like a stack of one thing; a spaced one shows seven different businesses,
 *   which is the point.
 *
 *   The headline gets clear air. Nothing lands on the words. That is what the
 *   arch is for: the copy sits inside it, not under it. R shrinks with the
 *   viewport because the copy does not — at 768px the headline is nearly
 *   full-width, so the arc has to flatten out above it rather than wrap it.
 */

/** The arc radius each tier is drawn on, as a percentage of the strip's width.
 *  Everything else below is derived from it; the test re-derives it rather than
 *  trusting the table. Smaller radius = tighter, deeper curve. */
export const FAN_ARC_RADIUS_PCT = {
  sm: 73.0,
  md: 100.0,
  lg: 62.6,
} as const satisfies Record<FanTier, number>;
export const FAN_SLOTS: FanSlot[] = [
  {
    index: -3,
    cardId: "pace",
    x: { sm: -14.5, md: -16.9, lg: 2.1 },
    y: { sm: 38.73, md: 25.69, lg: 22.36 },
    r: { sm: -62, md: -42, lg: -50 },
    width: {
      sm: "clamp(82px, 23vw, 108px)",
      md: "clamp(112px, 15.5vw, 145px)",
      lg: "clamp(126px, 12vw, 184px)",
    },
    z: 10,
    delayMs: 270,
    driftX: -48,
    driftY: 26,
    driftR: -5,
    visibility: "hidden lg:block",
  },
  {
    index: -2,
    cardId: "marginalia",
    x: { sm: -0.7, md: 3.0, lg: 16.8 },
    y: { sm: 20.49, md: 11.71, lg: 9.51 },
    r: { sm: -44, md: -28, lg: -32 },
    width: {
      sm: "clamp(82px, 23vw, 108px)",
      md: "clamp(112px, 15.5vw, 145px)",
      lg: "clamp(126px, 12vw, 184px)",
    },
    z: 20,
    delayMs: 180,
    driftX: -32,
    driftY: 18,
    driftR: -3.5,
    visibility: "hidden sm:block",
  },
  {
    index: -1,
    cardId: "restaurant",
    x: { sm: 18.0, md: 25.8, lg: 33.8 },
    y: { sm: 7.39, md: 2.97, lg: 2.13 },
    r: { sm: -26, md: -14, lg: -15 },
    width: {
      sm: "clamp(82px, 23vw, 108px)",
      md: "clamp(112px, 15.5vw, 145px)",
      lg: "clamp(126px, 12vw, 184px)",
    },
    z: 30,
    delayMs: 90,
    driftX: -16,
    driftY: 10,
    driftR: -2,
    visibility: "",
  },
  {
    index: 0,
    cardId: "aurevo",
    x: { sm: 50, md: 50, lg: 50 },
    y: { sm: 0, md: 0, lg: 0 },
    r: { sm: 0, md: 0, lg: 0 },
    width: {
      sm: "clamp(82px, 23vw, 108px)",
      md: "clamp(112px, 15.5vw, 145px)",
      lg: "clamp(126px, 12vw, 184px)",
    },
    z: 40,
    delayMs: 0,
    driftX: 0,
    driftY: 6,
    driftR: 0,
    visibility: "",
  },
  {
    index: 1,
    cardId: "salon",
    x: { sm: 82.0, md: 74.2, lg: 66.2 },
    y: { sm: 7.39, md: 2.97, lg: 2.13 },
    r: { sm: 26, md: 14, lg: 15 },
    width: {
      sm: "clamp(82px, 23vw, 108px)",
      md: "clamp(112px, 15.5vw, 145px)",
      lg: "clamp(126px, 12vw, 184px)",
    },
    z: 30,
    delayMs: 90,
    driftX: 16,
    driftY: 10,
    driftR: 2,
    visibility: "",
  },
  {
    index: 2,
    cardId: "lustre",
    x: { sm: 100.7, md: 97.0, lg: 83.2 },
    y: { sm: 20.49, md: 11.71, lg: 9.51 },
    r: { sm: 44, md: 28, lg: 32 },
    width: {
      sm: "clamp(82px, 23vw, 108px)",
      md: "clamp(112px, 15.5vw, 145px)",
      lg: "clamp(126px, 12vw, 184px)",
    },
    z: 20,
    delayMs: 180,
    driftX: 32,
    driftY: 18,
    driftR: 3.5,
    visibility: "hidden sm:block",
  },
  {
    index: 3,
    cardId: "gelo",
    x: { sm: 114.5, md: 116.9, lg: 97.9 },
    y: { sm: 38.73, md: 25.69, lg: 22.36 },
    r: { sm: 62, md: 42, lg: 50 },
    width: {
      sm: "clamp(82px, 23vw, 108px)",
      md: "clamp(112px, 15.5vw, 145px)",
      lg: "clamp(126px, 12vw, 184px)",
    },
    z: 10,
    delayMs: 270,
    driftX: 48,
    driftY: 26,
    driftR: 5,
    visibility: "hidden lg:block",
  },
];

/** Every tier's numbers at once; CSS resolves which set is live. Rotation and
 *  position stay unitless so the stylesheet can reuse them in calc() for both
 *  the resting angle and the counter-rotation the deal-in starts from. */
export function slotStyle(slot: FanSlot): CSSProperties {
  return {
    "--fan-x-sm": slot.x.sm,
    "--fan-x-md": slot.x.md,
    "--fan-x-lg": slot.x.lg,
    "--fan-y-sm": slot.y.sm,
    "--fan-y-md": slot.y.md,
    "--fan-y-lg": slot.y.lg,
    "--fan-r-sm": slot.r.sm,
    "--fan-r-md": slot.r.md,
    "--fan-r-lg": slot.r.lg,
    "--fan-w-sm": slot.width.sm,
    "--fan-w-md": slot.width.md,
    "--fan-w-lg": slot.width.lg,
    "--fan-z": slot.z,
    "--fan-delay": `${slot.delayMs}ms`,
    "--fan-dx": `${slot.driftX}px`,
    "--fan-dy": `${slot.driftY}px`,
    "--fan-dr": `${slot.driftR}deg`,
  } as CSSProperties;
}

export type FanCard =
  | { kind: "stamps"; sample: StampSample }
  | { kind: "points"; sample: PointsSample };

/** Which engine a slot's brand runs decides which props <WalletCard> needs. */
export function resolveFanCard(cardId: string): FanCard {
  const stamp = STAMP_SAMPLES.find((s) => s.id === cardId);
  if (stamp) return { kind: "stamps", sample: stamp };

  const points = POINTS_SAMPLES.find((s) => s.id === cardId);
  if (points) return { kind: "points", sample: points };

  throw new Error(`hero fan: unknown card id "${cardId}"`);
}
