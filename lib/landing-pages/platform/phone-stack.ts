/**
 * The cards of Platform's phone hero, a still Wallet stack: the café's stamp card in front, whole, and the tops
 * of a points card, a level card and a stamp card behind it. Pure data; the component only draws it.
 */

import { resolveFanCard } from "@/lib/hero-fan";
import { SILVER_LOOK, type LevelLook } from "@/lib/levels/looks";
import type { CardDesign, RewardTier } from "@/lib/types/design";

export interface StackCard {
  id: string;
  program: "stamps" | "points";
  design: Partial<CardDesign>;
  stamps?: number;
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
  /** A level card prints its level over the count. */
  headerLabel?: string;
}

/** A shop's card from the brand banks. */
function shop(id: string): StackCard {
  const card = resolveFanCard(id);

  if (card.kind === "stamps") return { id, program: "stamps", design: card.sample.design, stamps: card.sample.stamps };
  return {
    id,
    program: "points",
    design: card.sample.design,
    pointsBalance: card.sample.pointsBalance,
    pointsRewards: card.sample.pointsRewards,
  };
}

/** A card in a level's look, with the level's name over the count. */
function inLook(card: StackCard, look: LevelLook, headerLabel: string): StackCard {
  return { ...card, design: { ...card.design, ...look }, headerLabel };
}

/** The card in front, then the three behind it from the nearest to the farthest. */
export const PHONE_STACK: { front: StackCard; behind: readonly StackCard[] } = {
  front: shop("aurevo"),
  behind: [shop("salon"), inLook(shop("patoune"), SILVER_LOOK, "Silver"), shop("fournee")],
};
