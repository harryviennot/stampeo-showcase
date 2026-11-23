/**
 * The deck of Platform's phone stack and the clock that moves it. The first four cards are the first paint: the first
 * card in front, whole (year-round the café's stamp card, at Christmas Little Santas), and the tops of the next three
 * behind it. The front card plays a small moment if it has one (a stamp, some points, a level up), then leaves as the
 * rest of the deck moves up one place in the same motion. Pure data and pure steps; the component only draws them.
 */

import { HERO_FAN_SEASON, resolveFanCard, type FanSeason } from "@/lib/hero-fan";
import { LEVELS_SHOP } from "@/lib/landing-pages/previews/loyalty-ladder";
import { GOLD_LOOK, SILVER_LOOK, type LevelLook } from "@/lib/levels/looks";
import type { CardDesign, RewardTier } from "@/lib/types/design";

/** What a card shows once its moment has played. */
export interface StackMoment {
  stamps?: number;
  pointsBalance?: number;
  look?: LevelLook;
  level?: StackLevel;
}

/** The levels a card of the deck can be on; the page words them. */
export type StackLevel = "silver" | "gold";

export interface StackCard {
  id: string;
  program: "stamps" | "points";
  design: Partial<CardDesign>;
  stamps?: number;
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
  /** A level card prints its level over the count. */
  level?: StackLevel;
  moment?: StackMoment;
}

/** The props of a `WalletCard`, before or after the moment. */
export interface ShownCard {
  design: Partial<CardDesign>;
  stamps?: number;
  pointsBalance?: number;
  pointsRewards?: RewardTier[];
  level?: StackLevel;
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
function inLook(card: StackCard, look: LevelLook, level: StackLevel, extra: Partial<StackCard> = {}): StackCard {
  return { ...card, design: { ...card.design, ...look }, level, ...extra };
}

/** The barbershop's 5-stamp card, the levels example of the loyalty programs page. */
const BARBER_CARD: StackCard = {
  id: "gaspard-gus",
  program: "stamps",
  design: { ...LEVELS_SHOP.design, total_stamps: 5 },
  stamps: 3,
};

/**
 * The year-round cards in the order they come to the front, the strongest first: the café of every fan's apex, the
 * salon's points ring, the barbershop moving up from Silver to Gold, then the bakery, the bookstore, the pizza truck
 * and the car wash, the cards the homepage and Platform fans lead with.
 */
const DEFAULT_DECK: readonly StackCard[] = [
  shop("aurevo", { moment: { stamps: 6 } }),
  shop("salon"),
  inLook(BARBER_CARD, SILVER_LOOK, "silver", { moment: { look: GOLD_LOOK, level: "gold" } }),
  shop("fournee"),
  shop("marginalia", { moment: { pointsBalance: 252 } }),
  shop("rolling-slice"),
  shop("lustre"),
];

/**
 * The Christmas cards (lib/christmas-samples.ts), character themes first: Little Santas in front, then Rudolph's
 * points card, Santa's Elves and Candy Cane's red, so the four in view are four colours and show both engines.
 * Little Santas gets a stamp, Rudolph some points and the Elves a stamp as each takes the front.
 */
const CHRISTMAS_DECK: readonly StackCard[] = [
  shop("christmas-little-santas", { moment: { stamps: 8 } }),
  shop("christmas-rudolph", { moment: { pointsBalance: 222 } }),
  shop("christmas-santas-elves", { moment: { stamps: 7 } }),
  shop("christmas-candy-cane"),
  shop("christmas-north-pole"),
  shop("christmas-reindeer-games"),
  shop("christmas-elf-workshop"),
];

const DECKS: Record<FanSeason, readonly StackCard[]> = {
  default: DEFAULT_DECK,
  halloween: DEFAULT_DECK,
  christmas: CHRISTMAS_DECK,
};

/** The deck a season runs: its own cards at Christmas, the year-round ones otherwise. */
export function phoneDeck(season: FanSeason): readonly StackCard[] {
  return DECKS[season];
}

/** The deck the page runs, for the season the hero is set to. */
export const PHONE_DECK: readonly StackCard[] = phoneDeck(HERO_FAN_SEASON);

/** What the card shows, before its moment or after it. */
export function showing(card: StackCard, after: boolean): ShownCard {
  const { moment } = card;
  const shown: ShownCard = {
    design: card.design,
    stamps: card.stamps,
    pointsBalance: card.pointsBalance,
    pointsRewards: card.pointsRewards,
    level: card.level,
  };

  if (!after || !moment) return shown;
  return {
    ...shown,
    design: moment.look ? { ...card.design, ...moment.look } : card.design,
    stamps: moment.stamps ?? card.stamps,
    pointsBalance: moment.pointsBalance ?? card.pointsBalance,
    level: moment.level ?? card.level,
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

/** The deck's first card in front, at rest: the first paint, and what a reader who asks for less motion keeps. */
export const FIRST_PAINT: StackState = { front: 0, phase: "rest" };

/**
 * How long the front card plays its moment and how long the deck takes to move up one place, in ms; with the rest, a
 * card holds the front for 3.6 seconds. Every card moves for `MOVE_MS`, so the leaving card has faded by the time it
 * goes.
 */
const MOMENT_MS = 700;
export const MOVE_MS = 700;
const CYCLE_MS = 3600;
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

/**
 * Where a card sits for a clock state. While the front card leaves, it keeps the front slot and every other card
 * already sits where the next rest puts it, so the deck moves up one place as the front card goes.
 */
export function placement(index: number, state: StackState, count: number): Placement {
  const leaving = state.phase === "leaving" && index === state.front;
  if (leaving) return { behind: 0, slot: 0, hidden: false, leaving };

  const front = state.phase === "leaving" ? (state.front + 1) % count : state.front;
  const behind = (((index - front) % count) + count) % count;
  const hidden = behind > PHONE_STRIPS;

  return { behind, slot: hidden ? PHONE_STRIPS + 1 : behind, hidden, leaving };
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

    return { state: { front: state.front, phase: next }, after: CYCLE_MS - MOMENT_MS * Number(hasMoment) - MOVE_MS };
  }
  if (state.phase === "moment") return { state: { front: state.front, phase: "leaving" }, after: MOMENT_MS };

  return { state: { front: (state.front + 1) % cards, phase: "rest" }, after: MOVE_MS };
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
