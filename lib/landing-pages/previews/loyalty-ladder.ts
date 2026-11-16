/** The dry cleaner's card at each level of its ladder, for the loyalty programs preview's hero and levels section. */

import { WRENFOLD } from "@/components/landing-pages/shared/samples";
import { GOLD_LOOK, SILVER_LOOK, type LevelLook } from "@/lib/levels/looks";
import type { CardDesign } from "@/lib/types/design";

/** One level's card: its design (own look and size) and how many stamps are filled. */
export interface LadderCard {
  design: Partial<CardDesign>;
  stamps: number;
}

/** Sophie, the member every sample card of the levels pages belongs to. */
const MEMBER = [{ key: "member", label: "Member", value: "Sophie" }];

/** Wrenfold's card in a level's look (its own white one when `look` is left out), `total` stamps big. */
function levelDesign(total: number, look?: LevelLook): Partial<CardDesign> {
  return { ...WRENFOLD.design, ...look, total_stamps: total, secondary_fields: MEMBER };
}

/** Bronze (its own look, 8 stamps), Silver (6) and Gold (5), in the order of the ladder's copy. */
export const LADDER_CARDS: readonly LadderCard[] = [
  { design: levelDesign(8), stamps: 5 },
  { design: levelDesign(6, SILVER_LOOK), stamps: 4 },
  { design: levelDesign(5, GOLD_LOOK), stamps: 3 },
];

/** The hero's front card: Gold, 3 of 5 stamps. */
export const GOLD_HERO_CARD: LadderCard = { design: levelDesign(5, GOLD_LOOK), stamps: 3 };
