/**
 * The rules behind the blind-spot cards: which face each card shows, how the control and a tap change them,
 * how they move, and when the one automatic flip fires. Pure, so the component only applies them.
 */

export type Face = "paper" | "stampeo";

/** The automatic flip: half the section in view, a 1.5 second wait on the paper faces, then a 500 ms turn in a 60 ms wave. */
export const AUTO_FLIP = { visibleAmount: 0.5, waitMs: 1500, durationMs: 500, staggerMs: 60 } as const;

/** Every card on its paper face (`false`), as the page opens. */
export const allPaper = (count: number): boolean[] => Array.from({ length: count }, () => false);

/** Every card turned to `face`: what choosing a side on the control does. */
export const setAll = (count: number, face: Face): boolean[] => Array.from({ length: count }, () => face === "stampeo");

/** The cards with one turned over, the others as they were. */
export const flipCard = (flips: readonly boolean[], index: number): boolean[] =>
  flips.map((flipped, at) => (at === index ? !flipped : flipped));

/** What the control reads: Stampeo only when every card shows its answer, paper otherwise. */
export const faceShown = (flips: readonly boolean[]): Face => (flips.length > 0 && flips.every(Boolean) ? "stampeo" : "paper");

export interface FlipMotion {
  /** Whether the section turns its cards by itself when a scroller reaches it. */
  auto: boolean;
  durationMs: number;
  staggerMs: number;
}

/** A reader who asks for less motion gets an instant swap: no turn, no wave, nothing automatic. */
export function flipMotion(reduced: boolean): FlipMotion {
  return reduced
    ? { auto: false, durationMs: 0, staggerMs: 0 }
    : { auto: true, durationMs: AUTO_FLIP.durationMs, staggerMs: AUTO_FLIP.staggerMs };
}

/** The control turns the cards in a wave; a tap turns its own card at once. */
export function flipDelayMs(index: number, motion: FlipMotion, cause: "control" | "tap"): number {
  return cause === "control" ? index * motion.staggerMs : 0;
}

/** Whether the automatic flip fires now: seen, waited, and the visitor has done nothing else yet. */
export function autoFlipDue({
  amountVisible,
  waitedMs,
  touched,
  played,
  reduced,
}: Readonly<{ amountVisible: number; waitedMs: number; touched: boolean; played: boolean; reduced: boolean }>): boolean {
  return !reduced && !touched && !played && amountVisible >= AUTO_FLIP.visibleAmount && waitedMs >= AUTO_FLIP.waitMs;
}
