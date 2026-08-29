/**
 * What the signup preview card shows for progress, per program type. The rule
 * is the same for both types: a configured head start is REAL (it is exactly
 * what the customer will hold the moment they sign up), so the preview shows
 * it; without one we fall back to a believable demo value so the strip does
 * not look empty. Pure — tested in `signup-preview.test.ts`.
 */

import type { RewardTier } from "@/lib/types/design";

/** Demo stamps shown when the program grants no head start. */
const DEMO_STAMPS = 3;

export function previewStampCount(initialStamps: number | undefined | null): number {
  return initialStamps && initialStamps > 0 ? initialStamps : DEMO_STAMPS;
}

/**
 * `sortedRewards` is the reward menu sorted by ascending threshold. The demo
 * fallback sits partway to the first reward so every strip style (big number,
 * ring, track) shows visible progress. A head start above the first reward is
 * shown as-is: that is a real instant welcome gift, not a rendering bug.
 */
export function previewPointsBalance(
  initialPoints: number | undefined | null,
  sortedRewards: RewardTier[]
): number {
  if (initialPoints && initialPoints > 0) return initialPoints;
  return sortedRewards.length > 0 ? Math.round(sortedRewards[0].threshold * 0.6) : 0;
}
