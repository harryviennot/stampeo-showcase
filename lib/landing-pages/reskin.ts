/**
 * The card design hero's card: one wallet card that takes on the look of six shops in turn (a car wash, a
 * bakery, a wine bar, a lash studio, a bookstore, a pizza truck), a caption naming each. The row shows the
 * live shop with a neighbour either side on a laptop and the live shop alone on a phone. Everything here is
 * pure; the component draws it.
 */

import { resolveFanCard } from "@/lib/hero-fan";
import type { CardDesign, PassField, RewardTier } from "@/lib/types/design";

/** The shops, in the order of the captions in `CARD_DESIGN_PREVIEW.reskin`. */
export const RESKIN_SHOPS = ["lustre", "fournee", "ravin", "lashwell", "marginalia", "rolling-slice"] as const;

/** How long each shop's card is held, in ms. */
export const RESKIN_STEP_MS = 2400;

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

/**
 * Where a card sits in the row when `active` is the live one: its places to the right of the live card
 * (negative to the left, wrapping round), and whether it is the live card, a neighbour or out of sight.
 */
export function reskinPlacement(index: number, active: number, count: number): { offset: number; role: ReskinRole } {
  const half = Math.floor(count / 2);
  const offset = ((((index - active + half) % count) + count) % count) - half;

  return { offset, role: offset === 0 ? "live" : Math.abs(offset) === 1 ? "side" : "hidden" };
}

export const nextShop = (active: number, count: number) => (active + 1) % count;

/** What the hero draws: the car wash standing still for a reader who asks for less motion, else the clock's shop. */
export function reskinView(active: number, reducedMotion: boolean): { active: number; animated: boolean } {
  return reducedMotion ? { active: 0, animated: false } : { active, animated: true };
}
