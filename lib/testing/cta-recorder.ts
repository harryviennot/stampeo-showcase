import { mock } from "bun:test";

/**
 * A render cannot click, but every tracked button asks `useCtaTracking` for its handler as it renders. This stands
 * in for the hook to note which location and address each one asked for, and answers with the real handler.
 * Importing this module installs it for the whole test run.
 */
const realTracking = await import("@/hooks/use-cta-tracking");
// Taken before the module is mocked: afterwards the namespace answers with the stand-in.
const realHook = realTracking.useCtaTracking;

/** The tracked buttons rendered so far, in order. */
export const tracked: Array<{ trackAs: string; href: string }> = [];

mock.module("@/hooks/use-cta-tracking", () => ({
  ...realTracking,
  useCtaTracking: (trackAs: string, href: string) => {
    tracked.push({ trackAs, href });
    return realHook(trackAs as never, href);
  },
}));

/** What the buttons rendered by `render` asked to track as, and where they lead. */
export function trackedBy(render: () => unknown): Array<{ trackAs: string; href: string }> {
  const before = tracked.length;

  render();
  return tracked.slice(before);
}
