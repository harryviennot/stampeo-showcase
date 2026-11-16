/**
 * What a full-screen menu owes the reader who cannot see it: Tab stays inside it,
 * and the page behind it cannot be reached while it is open.
 */

/**
 * Where Tab or Shift+Tab sends focus in a menu with `count` tab stops when focus is on stop `at` (-1 when it is
 * outside them): the stop to focus, or null to let the browser take its own next step. Focus that leaves the
 * stops from either end, or starts outside them, comes back round to the other end.
 */
export function trapStop(count: number, at: number, shift: boolean): number | null {
  if (count === 0) return null;
  if (at === -1) return shift ? count - 1 : 0;
  if (!shift && at === count - 1) return 0;
  if (shift && at === 0) return count - 1;
  return null;
}

/** Anything that can be made unreachable: an element's `inert` flag. */
interface InertTarget {
  inert: boolean;
}

/**
 * Makes each element inert (not focusable, not clickable, hidden from a screen reader) and returns the function
 * that gives each back the state it had. A missing element is skipped; releasing twice does nothing the second time.
 */
export function inertWhileOpen(elements: ReadonlyArray<InertTarget | null>): () => void {
  const before = elements.flatMap((element) => (element ? [{ element, inert: element.inert }] : []));
  let released = false;

  for (const { element } of before) element.inert = true;
  return () => {
    if (released) return;
    released = true;
    for (const { element, inert } of before) element.inert = inert;
  };
}
