/** The scanner preview's counter: its four screens, and when it turns them by itself. */

export const COUNTER_KEYS = ["stamps", "points", "rewards", "levels"] as const;

export type CounterKey = (typeof COUNTER_KEYS)[number];

/** How long the counter shows a screen before it turns to the next, until a visitor takes over. */
export const AUTO_ADVANCE_MS = 4000;

/** The screen `delta` places on from `key` (-1 is the one before), wrapping at both ends. */
export function stepCounter(key: CounterKey, delta: 1 | -1): CounterKey {
  const at = COUNTER_KEYS.indexOf(key);

  return COUNTER_KEYS[(at + delta + COUNTER_KEYS.length) % COUNTER_KEYS.length];
}

const ARROW_STEPS: Readonly<Record<string, 1 | -1>> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/** The screen an arrow key picks (and takes the focus to) from `key`; null for any other key, which the browser keeps. */
export function counterKeyTarget(key: CounterKey, pressed: string): CounterKey | null {
  const delta = Object.hasOwn(ARROW_STEPS, pressed) ? ARROW_STEPS[pressed] : undefined;

  return delta === undefined ? null : stepCounter(key, delta);
}

/** Whether the counter turns its own pages: on screen, untouched, and with motion allowed. */
export function autoplays({ reducedMotion, inView, touched }: Readonly<{ reducedMotion: boolean; inView: boolean; touched: boolean }>): boolean {
  return inView && !touched && !reducedMotion;
}

/** The cross-fade between two screens, in ms; a reader who asks for less motion gets an instant swap. */
export function crossfadeMs(reducedMotion: boolean): number {
  return reducedMotion ? 0 : 250;
}
