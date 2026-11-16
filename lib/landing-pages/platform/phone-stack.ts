/**
 * The deck of Platform's phone stack and the clock that moves it. The first four cards are the first paint: the
 * café's stamp card in front, whole, and the tops of a points card, a level card and a stamp card behind it. The
 * front card plays a small moment if it has one (a stamp, some points, a level up), leaves, and the next card
 * takes its place. Pure data and pure steps; the component only draws them.
 */

import { WRENFOLD } from "@/components/landing-pages/shared/samples";
import { resolveFanCard } from "@/lib/hero-fan";
import { GOLD_LOOK, SILVER_LOOK, type LevelLook } from "@/lib/levels/looks";
import type { CardDesign, RewardTier } from "@/lib/types/design";

/** What a card shows once its moment has played. */
export interface StackMoment {
  stamps?: number;
  pointsBalance?: number;
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
  /** A level card prints its level over the count. */
  headerLabel?: string;
  moment?: StackMoment;
}

/** The props of a `WalletCard`, before or after the moment. */
export interface ShownCard {
  design: Partial<CardDesign>;
  stamps?: number;
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
  headerLabel?: string;
}

/** A shop's card from the brand banks. */
function shop(id: string, extra: Partial<StackCard> = {}): StackCard {
  const card = resolveFanCard(id);

  if (card.kind === "stamps") return { id, program: "stamps", design: card.sample.design, stamps: card.sample.stamps, ...extra };
  return {
    id,
    program: "points",
    design: card.sample.design,
    pointsBalance: card.sample.pointsBalance,
    pointsRewards: card.sample.pointsRewards,
    ...extra,
  };
}

/** A card in a level's look, with the level's name over the count. */
function inLook(card: StackCard, look: LevelLook, headerLabel: string, extra: Partial<StackCard> = {}): StackCard {
  return { ...card, design: { ...card.design, ...look }, headerLabel, ...extra };
}

/** The dry cleaner's stamp card, a Silver level that moves up to Gold. */
const WRENFOLD_CARD: StackCard = { id: "wrenfold", program: "stamps", design: WRENFOLD.design, stamps: 4 };

/** The cards in the order they come to the front. */
export const PHONE_DECK: readonly StackCard[] = [
  shop("aurevo", { moment: { stamps: 6 } }),
  shop("salon"),
  inLook(shop("patoune"), SILVER_LOOK, "Silver"),
  shop("fournee"),
  shop("marginalia", { moment: { pointsBalance: 252 } }),
  inLook(WRENFOLD_CARD, SILVER_LOOK, "Silver", { moment: { look: GOLD_LOOK, headerLabel: "Gold" } }),
];

/** What the card shows, before its moment or after it. */
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

/** How many strips show above the front card. */
export const PHONE_STRIPS = 3;

export type StackPhase = "rest" | "moment" | "leaving";

export interface StackState {
  /** The index of the card in front. */
  front: number;
  phase: StackPhase;
}

/** Aurevo in front, at rest: the first paint, and what a reader who asks for less motion keeps. */
export const FIRST_PAINT: StackState = { front: 0, phase: "rest" };

/** How long the front card plays its moment and leaves, in ms; with the rest, a card holds the front for 3.2 seconds. */
const MOMENT_MS = 600;
const LEAVE_MS = 300;
const CYCLE_MS = 3200;
/** The first card waits this long once the stack is in view, so a visitor sees it whole before it moves. */
export const FIRST_REST_MS = 1200;

export interface Placement {
  /** How many cards away from the front this one is in the deck's order. */
  behind: number;
  /** Where the card sits, counted from the front; a card out of sight waits one slot above the top strip. */
  slot: number;
  hidden: boolean;
  leaving: boolean;
}

/** Where a card sits for a clock state. */
export function placement(index: number, state: StackState, count: number): Placement {
  const behind = (((index - state.front) % count) + count) % count;
  const hidden = behind > PHONE_STRIPS;

  return {
    behind,
    slot: hidden ? PHONE_STRIPS + 1 : behind,
    hidden,
    leaving: state.phase === "leaving" && index === state.front,
  };
}

/**
 * Whether a card is drawn at all: the front and its strips always; once the page is live (`warm`) also the card
 * waiting above the top strip, so its images are loaded by the time it fades in. The first paint draws the four in view.
 */
export function drawn(place: Placement, warm: boolean): boolean {
  return place.behind <= PHONE_STRIPS + Number(warm);
}

/** The state after the front card's current phase, and how long that phase lasts: rest, then the moment if it has one, then leaving. */
export function stepAfter(
  state: StackState,
  hasMoment: boolean,
  cards: number = PHONE_DECK.length,
): { state: StackState; after: number } {
  if (state.phase === "rest") {
    const next: StackPhase = hasMoment ? "moment" : "leaving";

    return { state: { front: state.front, phase: next }, after: CYCLE_MS - MOMENT_MS * Number(hasMoment) - LEAVE_MS };
  }
  if (state.phase === "moment") return { state: { front: state.front, phase: "leaving" }, after: MOMENT_MS };

  return { state: { front: (state.front + 1) % cards, phase: "rest" }, after: LEAVE_MS };
}

export interface StackView {
  front: number;
  phase: StackPhase;
  /** Whether the front card shows what it becomes after its moment. */
  after: boolean;
  animated: boolean;
}

/** What the stack draws for a clock state: the first paint, whatever the clock said, for a reader who asks for less motion. */
export function stackView(state: StackState, reducedMotion: boolean): StackView {
  if (reducedMotion) return { ...FIRST_PAINT, after: false, animated: false };

  return { ...state, after: state.phase !== "rest", animated: true };
}
