/** The cards of the straight shelf behind `?hero=shelf`: nine in a row, five of them on a phone. */

import { BRONZE_LOOK, GOLD_LOOK, SILVER_LOOK } from "@/lib/levels/looks";
import { WRENFOLD_CARD, inLook, shop, type StackCard } from "./wallet-stack";

/** The shelf's nine: three stamp cards, three points cards, then one shop's card at Bronze, Silver and Gold. */
export const SHELF_CARDS: readonly StackCard[] = [
  shop("aurevo"),
  shop("fournee"),
  shop("lustre"),
  shop("salon"),
  shop("marginalia"),
  shop("restaurant"),
  inLook(WRENFOLD_CARD, BRONZE_LOOK, "Bronze"),
  inLook(WRENFOLD_CARD, SILVER_LOOK, "Silver"),
  inLook(WRENFOLD_CARD, GOLD_LOOK, "Gold"),
];

/** The five shelf cards a phone keeps, left to right: stamps, points, Silver, stamps, Gold. */
export const SHELF_ON_PHONE = [0, 3, 7, 1, 8] as const;
