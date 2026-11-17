/** The barbershop's card at each level of its ladder, for the loyalty programs preview's hero and levels section. */

import { GOLD_LOOK, SILVER_LOOK, type LevelLook } from "@/lib/levels/looks";
import type { CardDesign } from "@/lib/types/design";

/** One level's card: its design (own look and size) and how many stamps are filled. */
export interface LadderCard {
  design: Partial<CardDesign>;
  stamps: number;
}

/** Gaspard & Gus, the fictional barbershop of the levels pages: its wordmark and scissors on a white card. */
export const LEVELS_SHOP = {
  name: "Gaspard & Gus",
  design: {
    organization_name: "",
    logo_url: "/themes/gaspard-gus/logo.avif",
    background_color: "#FFFFFF",
    foreground_color: "#343434",
    label_color: "#040404",
    stamp_filled_color: "#040404",
    icon_color: "#FFFFFF",
    stamp_icon: "scissors",
    reward_icon: "gift",
  } satisfies Partial<CardDesign>,
} as const;

/** Sophie, the member every sample card of the levels pages belongs to. */
const MEMBER = [{ key: "member", label: "Member", value: "Sophie" }];

/** The shop's card in a level's look (its own white one when `look` is left out), `total` stamps big. */
export function levelDesign(total: number, look?: LevelLook): Partial<CardDesign> {
  return { ...LEVELS_SHOP.design, ...look, total_stamps: total, secondary_fields: MEMBER };
}

/** Bronze (its own look, 6 stamps), Silver (5) and Gold (4), in the order of the ladder's copy. */
export const LADDER_CARDS: readonly LadderCard[] = [
  { design: levelDesign(6), stamps: 4 },
  { design: levelDesign(5, SILVER_LOOK), stamps: 3 },
  { design: levelDesign(4, GOLD_LOOK), stamps: 2 },
];

/** The hero's front card: Gold, 2 of 4 stamps. */
export const GOLD_HERO_CARD: LadderCard = { design: levelDesign(4, GOLD_LOOK), stamps: 2 };
