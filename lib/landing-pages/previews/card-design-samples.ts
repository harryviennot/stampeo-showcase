/** The cards of the card design page's anatomy and wallets sections, so no shop is on the page twice. */

import { resolveFanCard } from "@/lib/hero-fan";
import { POINTS_SAMPLES, type PointsSample } from "@/lib/loyalty-samples";
import type { CardDesign, PassField, RewardTier } from "@/lib/types/design";

/** The two cards the anatomy section switches between. */
export interface AnatomyDesigns {
  stamps: { design: Partial<CardDesign>; stamps: number };
  points: { design: Partial<CardDesign>; pointsBalance: number; pointsRewards: RewardTier[] };
}

const pointsSample = (id: string): PointsSample => {
  const sample = POINTS_SAMPLES.find((candidate) => candidate.id === id);

  if (!sample) throw new Error(`No points sample called ${id}`);
  return sample;
};

/** A pass's two fields: the reward first (the anatomy labels it on the left) or last. */
const fields = (holder: string, rewardLabel: string, reward: string, rewardFirst = false): PassField[] => {
  const pair = [
    { key: "holder", label: "Cardholder", value: holder },
    { key: "reward", label: rewardLabel, value: reward },
  ];

  return rewardFirst ? pair.reverse() : pair;
};

const SPA = resolveFanCard("saltmoss");
const BOUTIQUE = pointsSample("ode");

export const ANATOMY_DESIGNS: AnatomyDesigns = {
  stamps: {
    design: { ...SPA.sample.design, secondary_fields: fields("Elena", "Reward", "Free facial", true) },
    stamps: SPA.kind === "stamps" ? SPA.sample.stamps : 0,
  },
  points: {
    design: { ...BOUTIQUE.design, secondary_fields: fields("Noor", "Next reward", "Free tote bag", true) },
    pointsBalance: BOUTIQUE.pointsBalance,
    pointsRewards: BOUTIQUE.pointsRewards,
  },
};

/** A business's pass as the two wallet phones draw it, in place of the café the other pages use. */
export interface PhoneSample {
  /** The business's name, as Google Wallet prints it beside the round logo. */
  name: string;
  design: Partial<CardDesign>;
  stamps?: number;
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
  /** The customer's other passes, peeking out under the open one (the phone's own two when left out). */
  others?: PointsSample[];
}

const GROCER = resolveFanCard("harvest-row");

export const WALLET_SAMPLE: PhoneSample = {
  name: "Harvest Row",
  design: { ...GROCER.sample.design, secondary_fields: fields("Rosa", "Next reward", "10% off") },
  pointsBalance: GROCER.kind === "points" ? GROCER.sample.pointsBalance : 0,
  pointsRewards: GROCER.kind === "points" ? GROCER.sample.pointsRewards : [],
  others: [pointsSample("salon"), pointsSample("pace")],
};
