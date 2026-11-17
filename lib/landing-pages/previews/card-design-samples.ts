/** The cards of the card design page's anatomy and wallets sections, so no shop is on the page twice. */

import { resolveFanCard } from "@/lib/hero-fan";
import { POINTS_SAMPLES, type PointsSample } from "@/lib/loyalty-samples";
import type { CardDesign, PassField, RewardTier } from "@/lib/types/design";

/** The two cards the anatomy section switches between. */
export interface AnatomyDesigns {
  stamps: { design: Partial<CardDesign>; stamps: number };
  points: { design: Partial<CardDesign>; pointsBalance: number; pointsRewards: RewardTier[] };
}

/** The six labels of each program's card, in the order of the card's parts: on a laptop beside the card, on a phone in the legend. */
export interface AnatomyLabels {
  stamps: { desktop: readonly string[]; mobile: readonly string[] };
  points: { desktop: readonly string[]; mobile: readonly string[] };
}

const pointsSample = (id: string): PointsSample => {
  const sample = POINTS_SAMPLES.find((candidate) => candidate.id === id);

  if (!sample) throw new Error(`No points sample called ${id}`);
  return sample;
};

/** The words of the sample cards' fields: the labels, and who holds each card and what it earns (the card design copy's `cardFields`). */
export interface SampleWords {
  holder: string;
  reward: string;
  nextReward: string;
  anatomy: { stamps: { holder: string; reward: string }; points: { holder: string; reward: string } };
  wallets: { holder: string; reward: string };
}

/** A pass's two fields: the reward first (the anatomy labels it on the left) or last. */
const fields = (holderLabel: string, holder: string, rewardLabel: string, reward: string, rewardFirst = false): PassField[] => {
  const pair = [
    { key: "holder", label: holderLabel, value: holder },
    { key: "reward", label: rewardLabel, value: reward },
  ];

  return rewardFirst ? pair.reverse() : pair;
};

const SPA = resolveFanCard("saltmoss");
const BOUTIQUE = pointsSample("ode");

/** The spa's stamp card and the boutique's points card, with their fields in the page's words. */
export function anatomyDesigns(words: SampleWords): AnatomyDesigns {
  const { anatomy } = words;

  return {
    stamps: {
      design: {
        ...SPA.sample.design,
        secondary_fields: fields(words.holder, anatomy.stamps.holder, words.reward, anatomy.stamps.reward, true),
      },
      stamps: SPA.kind === "stamps" ? SPA.sample.stamps : 0,
    },
    points: {
      design: {
        ...BOUTIQUE.design,
        secondary_fields: fields(words.holder, anatomy.points.holder, words.nextReward, anatomy.points.reward, true),
      },
      pointsBalance: BOUTIQUE.pointsBalance,
      pointsRewards: BOUTIQUE.pointsRewards,
    },
  };
}

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

/** The grocer's pass as the two wallet phones open it, with its fields in the page's words. */
export function walletSample(words: SampleWords): PhoneSample {
  return {
    name: "Harvest Row",
    design: { ...GROCER.sample.design, secondary_fields: fields(words.holder, words.wallets.holder, words.nextReward, words.wallets.reward) },
    pointsBalance: GROCER.kind === "points" ? GROCER.sample.pointsBalance : 0,
    pointsRewards: GROCER.kind === "points" ? GROCER.sample.pointsRewards : [],
    others: [pointsSample("salon"), pointsSample("pace")],
  };
}
