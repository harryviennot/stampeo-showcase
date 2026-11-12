import { SECTOR_THEMES } from "@/components/landing-variant/sector-themes";
import { sectorWalletDesign } from "../landing/sector-slides";
import { POINTS_SAMPLES, STAMP_SAMPLES } from "../loyalty-samples";
import type { CardDesign, RewardTier } from "../types/design";

/** One card on the Platform hero's wheel, with what `WalletCard` needs to draw it. */
export interface WheelCard {
  id: string;
  design: Partial<CardDesign>;
  stamps?: number;
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
}

/**
 * Clockwise from the top of the wheel at rest. Light and dark cards alternate,
 * stamps and points mix, and the greens and the pinks never touch. Aurevo, the
 * pages' sample café, sits on top over the trial button; a phone sees it with
 * Fournée and Vanity on either side.
 */
const ORDER = [
  "aurevo",
  "salon",
  "lustre",
  "gelo",
  "marginalia",
  "lashwell",
  "rolling-slice",
  "pace",
  "smash-club",
  "pulp",
  "ravin",
  "saltmoss",
  "oba",
  "restaurant",
  "harvest-row",
  "fournee",
] as const;

function wheelCard(id: string): WheelCard {
  const stamp = STAMP_SAMPLES.find((sample) => sample.id === id);
  if (stamp) return { id, design: stamp.design, stamps: stamp.stamps };

  const points = POINTS_SAMPLES.find((sample) => sample.id === id);
  if (points) return { id, design: points.design, pointsBalance: points.pointsBalance, pointsRewards: points.pointsRewards };

  const theme = SECTOR_THEMES.find((candidate) => candidate.id === id);
  if (!theme) throw new Error(`card wheel: unknown card "${id}"`);
  return theme.engine === "points"
    ? { id, design: sectorWalletDesign(theme, []), pointsBalance: theme.pointsBalance, pointsRewards: theme.pointsRewards }
    : { id, design: sectorWalletDesign(theme, []), stamps: theme.walletFilled ?? Math.floor((theme.walletStamps ?? 10) * 0.6) };
}

export const WHEEL_CARDS: WheelCard[] = ORDER.map(wheelCard);

/** The wheel at its widest, in px; narrower screens scale it down whole. */
export const WHEEL = {
  /** From the hub to each card's centre. */
  radius: 700,
  cardWidth: 200,
  /** A card's height at `cardWidth`, as `PassFrame` draws it (its 1.282 ratio). */
  cardHeight: 256,
  /** One full turn. */
  turnSeconds: 80,
} as const;

/** Where card `index` sits on the rim at rest, in degrees clockwise from the top. */
export const wheelAngle = (index: number) => (index * 360) / WHEEL_CARDS.length;

/** The arc a visitor can see at rest, either side of the top. */
const VISIBLE_ARC = 70;

/** Whether card `index` rides the visible top of the wheel at rest, so the first paint draws it. */
export function inFirstPaint(index: number): boolean {
  const angle = wheelAngle(index);
  return Math.min(angle, 360 - angle) <= VISIBLE_ARC;
}
