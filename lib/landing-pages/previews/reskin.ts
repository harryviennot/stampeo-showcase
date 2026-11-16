/**
 * The card design hero's card: one wallet card that takes on the look of six shops in turn, a caption naming each.
 * It moves on by itself, slowly, until a visitor takes over with the buttons, the dots or a swipe. Pure.
 */

import { resolveFanCard } from "@/lib/hero-fan";
import type { CardDesign, PassField, RewardTier } from "@/lib/types/design";

/** The shops, in the order of the captions in `CARD_DESIGN_PREVIEW.reskin`. */
export const RESKIN_SHOPS = ["lustre", "fournee", "ravin", "lashwell", "marginalia", "rolling-slice"] as const;

/** How long each shop's card is held, in ms. */
export const RESKIN_STEP_MS = 4800;

/** How far a drag has to go sideways, in px, to count as a swipe. */
export const SWIPE_PX = 40;

/** A cardholder and a reward for each card: the two fields a pass shows under its strip. */
const FIELDS: Record<(typeof RESKIN_SHOPS)[number], PassField[]> = {
  lustre: [
    { key: "holder", label: "Cardholder", value: "Dan" },
    { key: "reward", label: "Reward", value: "Free wash" },
  ],
  fournee: [
    { key: "holder", label: "Cardholder", value: "Ava" },
    { key: "reward", label: "Reward", value: "Free croissant" },
  ],
  ravin: [
    { key: "holder", label: "Cardholder", value: "Iris" },
    { key: "reward", label: "Next reward", value: "Free glass" },
  ],
  lashwell: [
    { key: "holder", label: "Cardholder", value: "Maya" },
    { key: "reward", label: "Reward", value: "Free lash fill" },
  ],
  marginalia: [
    { key: "holder", label: "Cardholder", value: "Elias" },
    { key: "reward", label: "Next reward", value: "Free tote bag" },
  ],
  "rolling-slice": [
    { key: "holder", label: "Cardholder", value: "Leo" },
    { key: "reward", label: "Reward", value: "Free slice" },
  ],
};

export interface ReskinCard {
  id: string;
  program: "stamps" | "points";
  design: Partial<CardDesign>;
  stamps?: number;
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
}

/** A shop's card from the brand banks, with its two fields. */
export function reskinCard(id: (typeof RESKIN_SHOPS)[number]): ReskinCard {
  const card = resolveFanCard(id);
  const design = { ...card.sample.design, secondary_fields: FIELDS[id] };

  if (card.kind === "stamps") return { id, program: "stamps", design, stamps: card.sample.stamps };
  return { id, program: "points", design, pointsBalance: card.sample.pointsBalance, pointsRewards: card.sample.pointsRewards };
}

export type ReskinRole = "live" | "side" | "hidden";

/** Where a card sits when `active` is the live one: its places right of it (negative to the left, wrapping) and its role. */
export function reskinPlacement(index: number, active: number, count: number): { offset: number; role: ReskinRole } {
  const half = Math.floor(count / 2);
  const offset = ((((index - active + half) % count) + count) % count) - half;

  return { offset, role: offset === 0 ? "live" : Math.abs(offset) === 1 ? "side" : "hidden" };
}

export interface ReskinState {
  /** The shop in front. */
  active: number;
  /** A visitor has chosen a shop: the clock stops for good. */
  touched: boolean;
}

export type ReskinEvent = { type: "tick" | "previous" | "next" } | { type: "show"; index: number };

/** What the clock and a visitor's clicks do to the card: the clock only moves it while no one has taken over. */
export function reskinStep(state: ReskinState, event: ReskinEvent, count: number): ReskinState {
  switch (event.type) {
    case "tick":
      return state.touched ? state : { ...state, active: (state.active + 1) % count };
    case "next":
      return { active: (state.active + 1) % count, touched: true };
    case "previous":
      return { active: (state.active + count - 1) % count, touched: true };
    case "show":
      return event.index >= 0 && event.index < count ? { active: event.index, touched: true } : state;
  }
}

/** The way a drag of `dx` by `dy` px turns the card: a long enough sideways drag, not a mostly vertical one. */
export function swipeDirection(dx: number, dy: number): "next" | "previous" | null {
  if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy)) return null;
  return dx < 0 ? "next" : "previous";
}

/**
 * What the hero draws: the shop in front, whether the clock runs (not for a reader who asks for less motion, nor once a
 * visitor has chosen), and whether a screen reader is told the shop's name (only once a visitor has chosen it).
 */
export function reskinView(state: ReskinState, reducedMotion: boolean): { active: number; autoplay: boolean; announce: boolean } {
  return { active: state.active, autoplay: !reducedMotion && !state.touched, announce: state.touched };
}
