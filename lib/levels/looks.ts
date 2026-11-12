import type { CardDesign } from "@/lib/types/design";

/**
 * The colours a level's card takes by default: level 2 is silver, level 3
 * gold. A copy of `SKINS` in
 * backend/app/services/programs/levels/skins.py (the showcase cannot import
 * it), written as the backend stores them; `looks.test.ts` holds the values.
 * Keep the two in step.
 */
export type LevelLook = Pick<
  CardDesign,
  | "background_color"
  | "foreground_color"
  | "label_color"
  | "stamp_filled_color"
  | "stamp_empty_color"
  | "stamp_border_color"
  | "strip_background_color"
  | "icon_color"
>;

/** A light brushed metal with near-black text and slate stamps. */
export const SILVER_LOOK: LevelLook = {
  background_color: "rgb(212, 216, 222)",
  foreground_color: "rgb(26, 30, 36)",
  label_color: "rgb(62, 68, 80)",
  stamp_filled_color: "rgb(58, 64, 76)",
  stamp_empty_color: "rgb(176, 182, 192)",
  stamp_border_color: "rgb(62, 68, 80)",
  strip_background_color: "rgb(212, 216, 222)",
  icon_color: "rgb(238, 241, 245)",
};

/** A warm yellow-gold with dark brown text and deep brown stamps. */
export const GOLD_LOOK: LevelLook = {
  background_color: "rgb(204, 160, 52)",
  foreground_color: "rgb(38, 26, 4)",
  label_color: "rgb(74, 52, 10)",
  stamp_filled_color: "rgb(70, 46, 6)",
  stamp_empty_color: "rgb(170, 128, 34)",
  stamp_border_color: "rgb(38, 26, 4)",
  strip_background_color: "rgb(204, 160, 52)",
  icon_color: "rgb(255, 232, 166)",
};

export const LEVEL_LOOKS = { silver: SILVER_LOOK, gold: GOLD_LOOK } as const;
