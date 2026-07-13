/**
 * Sample card designs for the loyalty-programs card-style gallery ("Pick a
 * style, make it yours"). Rendered through <WalletCard>, so every value stays
 * within backend limits (only the known points strip styles; ascending reward
 * ladders). Captions come from i18n (loyalty.gallery.*) zipped by index.
 *
 * These are the same hand-designed brands as the landing sector carousel
 * (VariantSectorCards) — real logos and real custom stamp icons served from
 * public/themes/ and public/custom-icons/, so the gallery keeps its promise
 * ("your logo, your colors") instead of showing generic placeholders.
 *
 * NOTE: index [0] of each array is also the representative card in
 * EngineExplainer and EnginePicker, so keep the clearest example first.
 */
import type { CardDesign, ProcessedIconAsset, RewardTier } from "@/lib/types/design";
import { customConfigFor } from "@/lib/custom-stamp-presets";

export interface StampSample {
  id: string;
  design: Partial<CardDesign>;
  stamps: number;
}

export interface PointsSample {
  id: string;
  design: Partial<CardDesign>;
  pointsBalance: number;
  pointsRewards: RewardTier[];
}

// Aurevo's own to-go cup, uploaded as a custom stamp icon. Mirrors the café
// card in VariantSectorCards; the -grey variant stands in for the backend
// rembg greyscale the real upload would produce.
const aurevoCup: ProcessedIconAsset = {
  id: "aurevo-cup",
  original_url: "/themes/cafe/cup.png",
  processed_url: "/themes/cafe/cup.png",
  greyscale_url: "/themes/cafe/cup-grey.png",
  outline_url: "/themes/cafe/cup-grey.png",
  bg_removed: true,
};

export const STAMP_SAMPLES: StampSample[] = [
  // Aurevo — custom cup icons, stacked (overlap) as the card fills.
  {
    id: "aurevo",
    design: {
      organization_name: "",
      logo_url: "/themes/cafe/logo.png",
      background_color: "#4b2e2b",
      stamp_filled_color: "#3A2416",
      icon_color: "#FFFFFF",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [aurevoCup],
        reward_icon: null,
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "overlap",
        empty_opacity: 80,
      },
    },
    stamps: 5,
  },
  // Les Garçons Barbiers — preset scissors, a gift on the reward slot, logo up
  // top on a crisp white card.
  {
    id: "barber",
    design: {
      organization_name: "",
      logo_url: "/themes/barber/logo.avif",
      background_color: "#FFFFFF",
      foreground_color: "#343434",
      label_color: "#040404",
      stamp_filled_color: "#040404",
      icon_color: "#FFFFFF",
      stamp_icon: "scissors",
      reward_icon: "gift",
      total_stamps: 6,
    },
    stamps: 6,
  },
  // Le Fournil — custom croissant icons, gently staggered.
  {
    id: "bakery",
    design: {
      organization_name: "Le Fournil",
      background_color: "#F2E3C6",
      stamp_filled_color: "#B45309",
      icon_color: "#FFFDF7",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: customConfigFor(["croissant"], {
        arrangement: "staggered",
        empty_mode: "greyscale",
        empty_opacity: 55,
      }),
    },
    stamps: 5,
  },
];

export const POINTS_SAMPLES: PointsSample[] = [
  // Big running balance — the clearest points read, so it leads (and feeds the
  // explainer/picker).
  {
    id: "big_point",
    design: {
      organization_name: "L’Atelier 17",
      card_type: "points",
      points_strip_style: "big_point",
      background_color: "#161320",
      label_color: "#C9A24B",
      progress_accent_color: "#C9A24B",
    },
    pointsBalance: 95,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 80 },
      { id: "r2", name: "b", threshold: 150 },
      { id: "r3", name: "c", threshold: 300 },
    ],
  },
  // Xeniká — the business's own photo as the strip (image_only).
  {
    id: "restaurant",
    design: {
      organization_name: "",
      logo_url: "/themes/restaurant/logo.png",
      card_type: "points",
      points_strip_style: "image_only",
      background_color: "#FFFFFF",
      foreground_color: "#0C64A4",
      label_color: "#0C64A4",
      progress_accent_color: "#0C64A4",
      strip_background_color: "#FFFFFF",
      strip_background_url: "/themes/restaurant/strip.jpg",
      strip_background_opacity: 100,
    },
    pointsBalance: 75,
    pointsRewards: [{ id: "r1", name: "a", threshold: 100 }],
  },
  // Vanity — a ring that fills toward the next reward.
  {
    id: "salon",
    design: {
      organization_name: "",
      logo_url: "/themes/salon/logo.png",
      card_type: "points",
      points_strip_style: "circle_progress",
      background_color: "#FADCE7",
      foreground_color: "#8A1150",
      label_color: "#B24A7B",
      progress_accent_color: "#D6006E",
      strip_background_color: "#FFFFFF",
    },
    pointsBalance: 65,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 80 },
      { id: "r2", name: "b", threshold: 150 },
      { id: "r3", name: "c", threshold: 300 },
    ],
  },
];
