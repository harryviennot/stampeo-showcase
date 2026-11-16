/**
 * The broadcast composer on the campaigns preview: the delivery fixture it counts to, the count's curve, what the
 * visitor sees first, and when the page sends by itself.
 */

/** The count under the card takes 900ms. */
export const COUNT_MS = 900;

/** On "Send again" the banner leaves the phone and drops in again after this pause. */
export const REPLAY_GAP_MS = 350;

/** The phone sends by itself once half of it is on screen. */
export const AUTOPLAY_RATIO = 0.5;

/** The phone is waiting for the broadcast, or the broadcast has gone. */
export type ComposerStage = "idle" | "sent";

export interface Delivery {
  delivered: number;
  total: number;
}

/** The sample broadcast's counts: what Apple and Google accepted, out of every card it was sent to. */
export function deliveryOf(metrics: ReadonlyArray<Readonly<{ label: string; value: string }>>): Delivery {
  const counts = metrics.map((metric) => ({ delivered: /\bdelivered$/i.test(metric.label), value: Number(metric.value) }));

  return {
    delivered: counts.filter((count) => count.delivered).reduce((sum, count) => sum + count.value, 0),
    total: counts.reduce((sum, count) => sum + count.value, 0),
  };
}

/** The count `elapsedMs` after "Send now": quick at first, settling on `target`, always a whole number. */
export function countedAt(elapsedMs: number, target: number): number {
  const progress = Math.min(Math.max(elapsedMs / COUNT_MS, 0), 1);

  return Math.round(target * (1 - (1 - progress) ** 3));
}

/** A reader who asks for less motion finds the broadcast already sent; everyone else finds the phone waiting. */
export function firstStage(reducedMotion: boolean): ComposerStage {
  return reducedMotion ? "sent" : "idle";
}

/** Whether the page sends the broadcast itself: once, never for a reader who asks for less motion. */
export function shouldAutoPlay({
  reducedMotion,
  played,
  visibleRatio,
}: Readonly<{ reducedMotion: boolean; played: boolean; visibleRatio: number }>): boolean {
  return !reducedMotion && !played && visibleRatio >= AUTOPLAY_RATIO;
}
