/**
 * Sample card designs for the loyalty-programs card-style gallery ("Pick a
 * style, make it yours"). Rendered through <WalletCard>, so every value stays
 * within backend limits (only the known points strip styles; ascending reward
 * ladders). Captions come from i18n (loyalty.gallery.*) zipped by index.
 *
 * Every card is a real, hand-designed fictional brand — original SVG wordmark
 * logos and custom stamp icons served from public/themes/ — so the gallery
 * keeps its promise ("your logo, your colors") instead of showing placeholder
 * names with no logo.
 *
 * NOTE: index [0] of each array is also the representative card in
 * EngineExplainer and EnginePicker, so keep the clearest example first.
 */
import type { CardDesign, ProcessedIconAsset, RewardTier } from "@/lib/types/design";

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

/** A merchant-uploaded icon and its variants, from a public base path
 *  (filled `${base}.${ext}`, empty `${base}-grey.${ext}`). Mirrors the shape
 *  the backend rembg pipeline produces for a real upload. */
function themedIcon(id: string, base: string, ext = "svg"): ProcessedIconAsset {
  return {
    id,
    original_url: `${base}.${ext}`,
    processed_url: `${base}.${ext}`,
    greyscale_url: `${base}-grey.${ext}`,
    outline_url: `${base}-grey.${ext}`,
    bg_removed: true,
  };
}

export const STAMP_SAMPLES: StampSample[] = [
  // Lustre — car wash. Six big water drops in a staggered band on deep navy.
  // NOTE: staggered only reads well with LARGE icons — use it for 6 stamps or
  // fewer; above that, go straight or overlap.
  {
    id: "lustre",
    design: {
      organization_name: "",
      logo_url: "/themes/lustre/logo.svg",
      background_color: "#0B1B2B",
      stamp_filled_color: "#3B9EFF",
      icon_color: "#FFFFFF",
      total_stamps: 6,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [themedIcon("drop", "/themes/lustre/drop")],
        reward_icon: null,
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "staggered",
        empty_opacity: 60,
      },
    },
    stamps: 4,
  },
  // Aurevo — café. The brand's own to-go cup, stacked (overlap) as it fills.
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
        icons: [themedIcon("aurevo-cup", "/themes/cafe/cup", "png")],
        reward_icon: null,
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "overlap",
        empty_opacity: 80,
      },
    },
    stamps: 5,
  },
  // Pulp — cold-pressed juice bar. Bright citrus icons overlapping on a warm
  // white card.
  {
    id: "pulp",
    design: {
      organization_name: "",
      logo_url: "/themes/pulp/logo.svg",
      background_color: "#FBF7EF",
      stamp_filled_color: "#E8590C",
      icon_color: "#FFFFFF",
      total_stamps: 10,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [themedIcon("citrus", "/themes/pulp/citrus")],
        reward_icon: null,
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "overlap",
        empty_opacity: 70,
      },
    },
    stamps: 6,
  },
  // Les Garçons Barbiers — barbershop. Preset scissors, a gift on the reward
  // slot, logo on a crisp white card.
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
  // Patoune — pet grooming. Preset paw stamps: cream circles, teal paw, on
  // deep teal.
  {
    id: "patoune",
    design: {
      organization_name: "",
      logo_url: "/themes/patoune/logo.svg",
      background_color: "#0F766E",
      stamp_filled_color: "#FFF7ED",
      icon_color: "#0F766E",
      stamp_icon: "paw",
      total_stamps: 10,
    },
    stamps: 6,
  },
  // Tige — florist. Tulips in a tidy straight grid on soft sage.
  {
    id: "tige",
    design: {
      organization_name: "",
      logo_url: "/themes/tige/logo.svg",
      background_color: "#EEF2E6",
      stamp_filled_color: "#5E8B57",
      icon_color: "#FFFFFF",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [themedIcon("tulip", "/themes/tige/tulip")],
        reward_icon: null,
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "straight",
        empty_opacity: 45,
      },
    },
    stamps: 5,
  },
  // Gelo — gelato. A dozen cones piling up (overlap) on pale mint.
  {
    id: "gelo",
    design: {
      organization_name: "",
      logo_url: "/themes/gelo/logo.svg",
      background_color: "#DFF7EC",
      stamp_filled_color: "#E86FA4",
      icon_color: "#FFFFFF",
      total_stamps: 12,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [themedIcon("cone", "/themes/gelo/cone")],
        reward_icon: null,
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "overlap",
        empty_opacity: 60,
      },
    },
    stamps: 7,
  },
  // OBA — bubble tea. Cream boba cups in a straight grid on deep violet
  // (8 stamps is past the staggered sweet spot — see Lustre).
  {
    id: "oba",
    design: {
      organization_name: "",
      logo_url: "/themes/oba/logo.svg",
      background_color: "#432889",
      stamp_filled_color: "#FF9ECD",
      icon_color: "#FFFFFF",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [themedIcon("boba", "/themes/oba/boba")],
        reward_icon: null,
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "straight",
        empty_opacity: 70,
      },
    },
    stamps: 5,
  },
];

export const POINTS_SAMPLES: PointsSample[] = [
  // Marginalia — bookstore. Big running balance in gold on forest green.
  {
    id: "marginalia",
    design: {
      organization_name: "",
      logo_url: "/themes/marginalia/logo.svg",
      card_type: "points",
      points_strip_style: "big_point",
      background_color: "#14432E",
      foreground_color: "#F3E9D6",
      label_color: "#E4C67A",
      progress_accent_color: "#E4C67A",
    },
    pointsBalance: 240,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 150 },
      { id: "r2", name: "b", threshold: 300 },
      { id: "r3", name: "c", threshold: 600 },
    ],
  },
  // Xeniká — Greek restaurant. The business's own photo as the strip.
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
  // Forme — boutique gym. A lime marker for each reward on near-black.
  {
    id: "forme",
    design: {
      organization_name: "",
      logo_url: "/themes/forme/logo.svg",
      card_type: "points",
      points_strip_style: "progress_icons",
      background_color: "#0D0D0F",
      foreground_color: "#FFFFFF",
      label_color: "#C6F24E",
      progress_accent_color: "#C6F24E",
    },
    pointsBalance: 180,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 100 },
      { id: "r2", name: "b", threshold: 250 },
      { id: "r3", name: "c", threshold: 500 },
    ],
  },
  // Vanity — beauty salon. A ring that fills toward the next reward.
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
  // ODE — prêt-à-porter. Monochrome editorial: black balance on bone.
  {
    id: "ode",
    design: {
      organization_name: "",
      logo_url: "/themes/ode/logo.svg",
      card_type: "points",
      points_strip_style: "big_point",
      background_color: "#F5F1E8",
      foreground_color: "#141414",
      label_color: "#8A8378",
      progress_accent_color: "#141414",
    },
    pointsBalance: 140,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 100 },
      { id: "r2", name: "b", threshold: 250 },
      { id: "r3", name: "c", threshold: 500 },
    ],
  },
  // PACE — sneakers. Orange milestone markers on warm off-white.
  {
    id: "pace",
    design: {
      organization_name: "",
      logo_url: "/themes/pace/logo.svg",
      card_type: "points",
      points_strip_style: "progress_icons",
      background_color: "#F4F2EE",
      foreground_color: "#16130F",
      label_color: "#6B655B",
      progress_accent_color: "#FF5A1F",
    },
    pointsBalance: 160,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 120 },
      { id: "r2", name: "b", threshold: 240 },
      { id: "r3", name: "c", threshold: 480 },
    ],
  },
  // Ravin — natural wine bar. A gold ring on deep burgundy.
  {
    id: "ravin",
    design: {
      organization_name: "",
      logo_url: "/themes/ravin/logo.svg",
      card_type: "points",
      points_strip_style: "circle_progress",
      background_color: "#3A0E1D",
      foreground_color: "#F6E7D8",
      label_color: "#C79A6B",
      progress_accent_color: "#D9A441",
    },
    pointsBalance: 70,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 90 },
      { id: "r2", name: "b", threshold: 180 },
      { id: "r3", name: "c", threshold: 360 },
    ],
  },
];
