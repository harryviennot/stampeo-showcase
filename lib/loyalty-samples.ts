/**
 * Sample card designs for the loyalty-programs card-style gallery. Rendered
 * through <WalletCard>, so every value stays within backend limits (only the
 * known points strip styles; ascending reward ladders). Captions come from
 * i18n (loyalty.gallery.*) zipped by index. No new card rendering code.
 *
 * Note: stamp arrangements (staggered/overlap) require server-processed custom
 * icon assets, so the stamp samples use preset icons in the default straight
 * grid — the honest contrast is "stamps = icon grid" vs "points = strip".
 */
import type { CardDesign, RewardTier } from "@/lib/types/design";

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

export const STAMP_SAMPLES: StampSample[] = [
  {
    id: "coffee",
    design: {
      organization_name: "Café Lumière",
      background_color: "#1c1c1e",
      stamp_filled_color: "#f97316",
      icon_color: "#ffffff",
      stamp_icon: "coffee",
      total_stamps: 10,
    },
    stamps: 6,
  },
  {
    id: "bakery",
    design: {
      organization_name: "Le Fournil",
      background_color: "#F2E3C6",
      stamp_filled_color: "#B45309",
      icon_color: "#FFFDF7",
      stamp_icon: "bread",
      total_stamps: 8,
    },
    stamps: 5,
  },
  {
    id: "salon",
    design: {
      organization_name: "Studio Mireille",
      background_color: "#F5ECE4",
      stamp_filled_color: "#C16C50",
      icon_color: "#ffffff",
      stamp_icon: "scissors",
      total_stamps: 6,
    },
    stamps: 4,
  },
];

export const POINTS_SAMPLES: PointsSample[] = [
  {
    id: "big_point",
    design: {
      organization_name: "L’Atelier 17",
      card_type: "points",
      points_strip_style: "big_point",
      background_color: "#111827",
      progress_accent_color: "#C084FC",
    },
    pointsBalance: 95,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 80 },
      { id: "r2", name: "b", threshold: 150 },
      { id: "r3", name: "c", threshold: 300 },
    ],
  },
  {
    id: "circle_progress",
    design: {
      organization_name: "Maison Lila",
      card_type: "points",
      points_strip_style: "circle_progress",
      background_color: "#141B2E",
      progress_accent_color: "#60A5FA",
    },
    pointsBalance: 130,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 100 },
      { id: "r2", name: "b", threshold: 200 },
      { id: "r3", name: "c", threshold: 400 },
    ],
  },
  {
    id: "progress_icons",
    design: {
      organization_name: "Cave Saint-Ours",
      card_type: "points",
      points_strip_style: "progress_icons",
      background_color: "#14231C",
      progress_accent_color: "#34D399",
    },
    pointsBalance: 180,
    pointsRewards: [
      { id: "r1", name: "a", threshold: 100 },
      { id: "r2", name: "b", threshold: 250 },
      { id: "r3", name: "c", threshold: 500 },
    ],
  },
];
