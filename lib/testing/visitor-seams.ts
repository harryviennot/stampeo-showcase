import { mock } from "bun:test";

/**
 * A server render never changes the reader's setting or the visitor's pick in the playground, so these two
 * seams stand in for them: the reduced-motion hook and the playground's program answer what a test sets,
 * and the real answer when it sets nothing. Importing this module installs them for the whole test run.
 */
const realPlayground = await import("@/components/features/design-de-carte/playground/usePlayground");
const realMotion = await import("@/hooks/usePrefersReducedMotion");
const startPlayground = realPlayground.usePlayground;

export const visitor: { reducedMotion: boolean; program?: "points" } = { reducedMotion: false };

mock.module("@/components/features/design-de-carte/playground/usePlayground", () => ({
  ...realPlayground,
  usePlayground: (options: { rewards: number }) => {
    const playground = startPlayground(options);
    return visitor.program ? { ...playground, program: visitor.program, isPoints: true } : playground;
  },
}));
mock.module("@/hooks/usePrefersReducedMotion", () => ({
  ...realMotion,
  usePrefersReducedMotion: () => visitor.reducedMotion,
}));

const reset = () => Object.assign(visitor, { reducedMotion: false, program: undefined });

/** Runs `render` as a visitor with the given settings would get it, and puts the seams back. */
export function renderAs<T>(settings: Partial<typeof visitor>, render: () => T): T {
  Object.assign(visitor, { reducedMotion: false, program: undefined }, settings);
  try {
    return render();
  } finally {
    reset();
  }
}

/** `renderAs` for a render that resolves async server components. */
export async function renderAsAsync<T>(settings: Partial<typeof visitor>, render: () => Promise<T>): Promise<T> {
  Object.assign(visitor, { reducedMotion: false, program: undefined }, settings);
  try {
    return await render();
  } finally {
    reset();
  }
}
