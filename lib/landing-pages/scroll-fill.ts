/** The line the fill follows, as a share of the viewport's height from its top. */
const FRONT = 0.9;

/**
 * How far the share tree's branches are filled, from 0 to 1, for a tree whose
 * top is `top` px from the viewport's top and which is `height` px tall: the
 * orange reaches as far down the tree as a line near the bottom of the screen,
 * so it is empty while the tree is below that line and full once the tree's
 * channels have risen past it.
 */
export function treeFill({ top, height, viewport }: Readonly<{ top: number; height: number; viewport: number }>): number {
  return Math.min(Math.max((viewport * FRONT - top) / height, 0), 1);
}
