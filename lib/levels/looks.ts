import type { CardDesign } from "@/lib/types/design";

/**
 * The colours a level's card takes by default, from bronze to noir. A copy of
 * `SKINS` in backend/app/services/programs/levels/skins.py (the showcase
 * cannot import it), written as the backend stores them; `looks-values.test.ts`
 * pins the values. Keep the two in step.
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

/** A warm copper brown with cream text and light-copper stamps. */
export const BRONZE_LOOK: LevelLook = {
  background_color: "rgb(136, 84, 44)",
  foreground_color: "rgb(255, 242, 226)",
  label_color: "rgb(250, 222, 188)",
  stamp_filled_color: "rgb(238, 194, 140)",
  stamp_empty_color: "rgb(108, 64, 32)",
  stamp_border_color: "rgb(255, 242, 226)",
  strip_background_color: "rgb(136, 84, 44)",
  icon_color: "rgb(84, 46, 18)",
};

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

/** A cool pale blue-grey with navy text and navy stamps. */
export const PLATINUM_LOOK: LevelLook = {
  background_color: "rgb(226, 232, 241)",
  foreground_color: "rgb(16, 28, 52)",
  label_color: "rgb(48, 66, 100)",
  stamp_filled_color: "rgb(38, 62, 110)",
  stamp_empty_color: "rgb(184, 198, 218)",
  stamp_border_color: "rgb(48, 66, 100)",
  strip_background_color: "rgb(226, 232, 241)",
  icon_color: "rgb(234, 240, 250)",
};

/** Near-black with warm white text and gold stamps. */
export const NOIR_LOOK: LevelLook = {
  background_color: "rgb(20, 20, 22)",
  foreground_color: "rgb(246, 242, 232)",
  label_color: "rgb(214, 180, 98)",
  stamp_filled_color: "rgb(212, 175, 55)",
  stamp_empty_color: "rgb(54, 54, 58)",
  stamp_border_color: "rgb(212, 175, 55)",
  strip_background_color: "rgb(20, 20, 22)",
  icon_color: "rgb(20, 20, 22)",
};

export const LEVEL_LOOKS = {
  bronze: BRONZE_LOOK,
  silver: SILVER_LOOK,
  gold: GOLD_LOOK,
  platinum: PLATINUM_LOOK,
  noir: NOIR_LOOK,
} as const;
