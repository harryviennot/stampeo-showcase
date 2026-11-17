/**
 * The look of the live demo card (stamps and points) on the landing page: the
 * dark Stampeo card with a different shop sticker in every stamp slot and the
 * same stickers as a faded wallpaper behind the points track. The art is in
 * public/demo/stickers/; the real Wallet pass uses the same stickers.
 */
import { themedIcon } from "@/lib/loyalty-samples";
import { STAMPEO_LOGO } from "@/lib/stampeo-card";
import type { CardDesign, CustomStampConfig, PointsRewardIcons } from "@/lib/types/design";

const STICKER_BASE = "/demo/stickers";

/** Slot order: café, bakery, pizzeria, bubble tea, gelato, groomer, florist, then the Stampeo seal on the reward slot. */
const STICKER_SLOTS = ["cafe", "croissant", "pizza", "bubble-tea", "gelato", "paw", "tulip", "seal"] as const;

export const DEMO_STAMP_CONFIG: CustomStampConfig = {
  icons: STICKER_SLOTS.map((slot) => themedIcon(`demo-${slot}`, `${STICKER_BASE}/${slot}`, "png")),
  reward_icon: null,
  empty_icon: null,
  empty_mode: "greyscale",
  arrangement: "straight",
  empty_opacity: 55,
};

/** Design fields shared by both demo cards: the dark Stampeo card with the orange star logo. */
export const DEMO_CARD_BASE: Partial<CardDesign> = {
  organization_name: "Stampeo",
  logo_url: STAMPEO_LOGO,
  background_color: "#1c1c1e",
  label_color: "#fff",
};

export const DEMO_STAMP_DESIGN: Partial<CardDesign> = {
  ...DEMO_CARD_BASE,
  total_stamps: 8,
  stamp_filled_color: "#f97316",
  stamp_icon_mode: "custom",
  custom_stamp_config: DEMO_STAMP_CONFIG,
};

// The points ladder: a waving hand (a returning customer) at 60, a heart (a
// loyal regular) at 120. PointsStrip draws thresholds and these icons on the track,
// not the reward names.
export const DEMO_POINTS_REWARD_ICONS: PointsRewardIcons = {
  r_mid: { type: "preset", ref: "hand-waving" },
  r_top: { type: "preset", ref: "heart" },
};

export const DEMO_POINTS_DESIGN: Partial<CardDesign> = {
  ...DEMO_CARD_BASE,
  card_type: "points",
  points_strip_style: "progress_icons",
  progress_accent_color: "#f97316",
  points_reward_icons: DEMO_POINTS_REWARD_ICONS,
  strip_background_url: `${STICKER_BASE}/wallpaper.png`,
  strip_background_opacity: 35,
};
