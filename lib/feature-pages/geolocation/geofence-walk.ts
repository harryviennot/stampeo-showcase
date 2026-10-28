/**
 * The geolocation hero's walk, in the 400-wide map drawing's units and in
 * seconds into its loop: a customer walks down the avenue, crosses the shop's
 * ring, and stops at its door. One clock drives the map and the phone, so the
 * map draws these and the phone reads the same times.
 *
 * The phone covers the right quarter of the map, so the story stays in
 * x < 290.
 */

export type Point = readonly [number, number];

/** One loop, in seconds. */
export const LOOP = 9;
export const WALK_START = 0.4;
export const WALK_END = 4.4;
/** Walker, trail and notification clear away from here to the end of the loop. */
export const FADE_START = 7.9;
export const FADE_END = 8.5;

export const SHOP: Point = [155, 206];
export const RING_R = 82;
export const ROUTE: readonly Point[] = [
  [83, -18],
  [83, 248],
  [150, 248],
];

const SEGMENTS = ROUTE.slice(1).map((p, i) =>
  Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]),
);
export const ROUTE_LENGTH = SEGMENTS.reduce((a, b) => a + b, 0);
const WAYPOINT_DISTANCES = SEGMENTS.reduce<number[]>(
  (acc, len) => [...acc, acc[acc.length - 1] + len],
  [0],
);

const timeAt = (distance: number) =>
  WALK_START + (distance / ROUTE_LENGTH) * (WALK_END - WALK_START);

export function pointAt(distance: number): Point {
  for (let i = 0; i < SEGMENTS.length; i++) {
    if (distance <= WAYPOINT_DISTANCES[i + 1] || i === SEGMENTS.length - 1) {
      const k = Math.min(1, (distance - WAYPOINT_DISTANCES[i]) / SEGMENTS[i]);
      const [ax, ay] = ROUTE[i];
      const [bx, by] = ROUTE[i + 1];
      return [ax + (bx - ax) * k, ay + (by - ay) * k];
    }
  }
  return ROUTE[ROUTE.length - 1];
}

function entryDistance(): number {
  for (let d = 0; d <= ROUTE_LENGTH; d += 0.5) {
    const [x, y] = pointAt(d);
    if (Math.hypot(x - SHOP[0], y - SHOP[1]) <= RING_R) return d;
  }
  return ROUTE_LENGTH;
}

/** The moment the walker crosses into the ring. */
export const ENTRY_T = timeAt(entryDistance());
/** The phone lights up a beat after the crossing. */
export const NOTIFY_T = ENTRY_T + 0.35;
/** The still frame for reduced motion: walker at the door, notification shown. */
export const POSTER_T = 6.5;

export const WAYPOINT_TIMES = WAYPOINT_DISTANCES.map(timeAt);
const STEP = 12;
export const FOOTSTEPS = Array.from(
  { length: Math.floor((ROUTE_LENGTH - 16) / STEP) },
  (_, i) => {
    const d = (i + 1) * STEP;
    return { point: pointAt(d), at: timeAt(d) };
  },
);
