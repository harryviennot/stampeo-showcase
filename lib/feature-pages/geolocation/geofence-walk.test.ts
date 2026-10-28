import { describe, expect, it } from "bun:test";
import {
  ENTRY_T,
  FADE_END,
  FADE_START,
  FOOTSTEPS,
  LOOP,
  NOTIFY_T,
  POSTER_T,
  RING_R,
  ROUTE,
  ROUTE_LENGTH,
  SHOP,
  WALK_END,
  WALK_START,
  WAYPOINT_TIMES,
  pointAt,
} from "./geofence-walk";

const fromShop = ([x, y]: readonly [number, number]) => Math.hypot(x - SHOP[0], y - SHOP[1]);

describe("the geolocation hero's walk", () => {
  it("crosses the shop's ring partway down the avenue, on its edge", () => {
    expect(ENTRY_T).toBeGreaterThan(WALK_START);
    expect(ENTRY_T).toBeLessThan(WALK_END);
    const walked = ((ENTRY_T - WALK_START) / (WALK_END - WALK_START)) * ROUTE_LENGTH;
    expect(Math.abs(fromShop(pointAt(walked)) - RING_R)).toBeLessThan(1);
  });

  it("lights the phone a beat after the crossing, while the customer is still walking", () => {
    expect(NOTIFY_T - ENTRY_T).toBeCloseTo(0.35, 6);
    expect(NOTIFY_T).toBeLessThan(WALK_END);
  });

  it("ends at the shop's door, inside the ring", () => {
    expect(fromShop(ROUTE[ROUTE.length - 1])).toBeLessThan(RING_R);
    expect(WAYPOINT_TIMES[WAYPOINT_TIMES.length - 1]).toBeCloseTo(WALK_END, 6);
  });

  it("leaves footsteps in walking order, only while walking", () => {
    const times = FOOTSTEPS.map((step) => step.at);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(Math.min(...times)).toBeGreaterThan(WALK_START);
    expect(Math.max(...times)).toBeLessThan(WALK_END);
  });

  it("holds its reduced-motion still after the walk, with the notification shown", () => {
    expect(POSTER_T).toBeGreaterThanOrEqual(WALK_END);
    expect(POSTER_T).toBeGreaterThan(NOTIFY_T);
    expect(POSTER_T).toBeLessThan(FADE_START);
  });

  it("clears everything before the loop restarts", () => {
    expect(FADE_START).toBeLessThan(FADE_END);
    expect(FADE_END).toBeLessThan(LOOP);
  });

  // The phone covers the right quarter of the 400-wide map.
  it("keeps the story left of the phone", () => {
    expect(Math.max(...ROUTE.map((p) => p[0]))).toBeLessThan(290);
    expect(SHOP[0] + RING_R).toBeLessThan(290);
  });
});
