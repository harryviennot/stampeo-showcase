/**
 * The cards of the Platform hero, and what they do over time. The stack (the default) is nine wallet cards
 * laid out like a phone's Wallet, one in front with the others showing as strips above it: the front card
 * plays a small moment if it has one (a stamp lands, points add up, a level is reached), leaves, and the
 * next takes its place. Everything here is pure; the components only draw it. The shelf's cards (`?hero=shelf`)
 * are in `wallet-shelf.ts`.
 */

import { WRENFOLD } from "@/components/landing-pages/shared/samples";
import { resolveFanCard } from "@/lib/hero-fan";
import { GOLD_LOOK, NOIR_LOOK, SILVER_LOOK, type LevelLook } from "@/lib/levels/looks";
import type { CardDesign, RewardTier } from "@/lib/types/design";

/** What a card shows once its moment has played, over what it showed before. */
export interface StackMoment {
  stamps?: number;
  pointsBalance?: number;
  /** Colours the card takes (a new level's look). */
  look?: LevelLook;
  headerLabel?: string;
}

export interface StackCard {
  id: string;
  program: "stamps" | "points";
  design: Partial<CardDesign>;
  stamps?: number;
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
  /** A level's name, printed over the count where "Stamps" or "Points" was. */
  headerLabel?: string;
  moment?: StackMoment;
}

/** The props of a `WalletCard` for a card, before or after its moment. */
export interface ShownCard {
  design: Partial<CardDesign>;
  stamps?: number;
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
  headerLabel?: string;
}

/** A shop's card from the brand banks, as the sample says. */
export function shop(id: string, extra: Partial<StackCard> = {}): StackCard {
  const card = resolveFanCard(id);

  if (card.kind === "stamps") {
    return { id, program: "stamps", design: card.sample.design, stamps: card.sample.stamps, ...extra };
  }
  return {
    id,
    program: "points",
    design: card.sample.design,
    pointsBalance: card.sample.pointsBalance,
    pointsRewards: card.sample.pointsRewards,
    ...extra,
  };
}

/** The card in a level's look (a points card draws its progress in the look's stamp colour). */
export function inLook(card: StackCard, look: LevelLook, headerLabel: string, extra: Partial<StackCard> = {}): StackCard {
  const design: Partial<CardDesign> = { ...card.design, ...look };

  if (card.program === "points") design.progress_accent_color = look.stamp_filled_color;
  return { ...card, design, headerLabel, ...extra };
}

/** The dry cleaner the level cards belong to, as a stamp card. */
export const WRENFOLD_CARD: StackCard = { id: "wrenfold", program: "stamps", design: WRENFOLD.design, stamps: 4 };

/**
 * The stack's nine, in the order they come to the front. The four strips on a phone show points, stamps and a
 * level the moment the page opens (Vanity, Patoune at Silver, Fournée and Marginalia above Aurevo).
 */
export const STACK_CARDS: readonly StackCard[] = [
  shop("aurevo", { moment: { stamps: 6 } }),
  shop("salon"),
  inLook(shop("patoune"), SILVER_LOOK, "Silver"),
  shop("fournee"),
  shop("marginalia", { moment: { pointsBalance: 252 } }),
  inLook(WRENFOLD_CARD, SILVER_LOOK, "Silver", { moment: { look: GOLD_LOOK, headerLabel: "Gold" } }),
  shop("lustre"),
  shop("restaurant"),
  inLook(shop("forme"), NOIR_LOOK, "Noir"),
];

/** What the card shows: its own, or what it becomes once its moment has played. */
export function showing(card: StackCard, after: boolean): ShownCard {
  const { moment } = card;
  const shown: ShownCard = {
    design: card.design,
    stamps: card.stamps,
    pointsBalance: card.pointsBalance,
    pointsRewards: card.pointsRewards,
    headerLabel: card.headerLabel,
  };

  if (!after || !moment) return shown;
  return {
    ...shown,
    design: moment.look ? { ...card.design, ...moment.look } : card.design,
    stamps: moment.stamps ?? card.stamps,
    pointsBalance: moment.pointsBalance ?? card.pointsBalance,
    headerLabel: moment.headerLabel ?? card.headerLabel,
  };
}

/** How many strips show above the front card, on a phone and from a laptop. */
export const STACK_STRIPS = { phone: 4, desktop: 6 } as const;

export type StackPhase = "rest" | "moment" | "leaving";

export interface StackState {
  /** The index of the card in front. */
  front: number;
  phase: StackPhase;
}

/** How long the front card is held, plays its moment and leaves, in ms. Together with the strips' slide, a cycle is 3.2 seconds. */
const MOMENT_MS = 600;
const LEAVE_MS = 300;
const CYCLE_MS = 3200;
/** The first card waits this long after the page opens, so the hero's first paint is the headline's alone. */
export const FIRST_REST_MS = 1200;

/** Where a card sits: its slot counted from the front (clamped to one above the top strip when it is out of sight). */
export function placement(
  index: number,
  state: StackState,
  count: number,
): { slot: number; hidden: boolean; leaving: boolean } {
  const behind = (((index - state.front) % count) + count) % count;
  const hidden = behind > STACK_STRIPS.desktop;

  return {
    slot: hidden ? STACK_STRIPS.desktop + 1 : behind,
    hidden,
    leaving: state.phase === "leaving" && index === state.front,
  };
}

/**
 * The state after the front card's current phase, and how long that phase lasts. A card with a moment rests,
 * plays it for 0.6 s and leaves for 0.3 s; one without goes from rest to leaving. Whichever it is, the card holds
 * the front for 3.2 s, the rest of it being the strips' slide and the pause.
 */
export function stepAfter(
  state: StackState,
  hasMoment: boolean,
  count: number = STACK_CARDS.length,
): { state: StackState; after: number } {
  if (state.phase === "rest") {
    const next: StackPhase = hasMoment ? "moment" : "leaving";

    return { state: { front: state.front, phase: next }, after: CYCLE_MS - MOMENT_MS * Number(hasMoment) - LEAVE_MS };
  }
  if (state.phase === "moment") return { state: { front: state.front, phase: "leaving" }, after: MOMENT_MS };

  return { state: { front: (state.front + 1) % count, phase: "rest" }, after: LEAVE_MS };
}

export interface StackView {
  front: number;
  phase: StackPhase;
  /** Whether the front card shows what it becomes after its moment. */
  after: boolean;
  animated: boolean;
}

/**
 * What the stack draws for a clock state. A reader who asks for less motion gets it still, with Aurevo in front
 * at its sixth stamp; otherwise the front card shows its after state while it plays its moment and leaves.
 */
export function stackView(state: StackState, reducedMotion: boolean): StackView {
  if (reducedMotion) return { front: 0, phase: "rest", after: true, animated: false };

  return { ...state, after: state.phase !== "rest", animated: true };
}
