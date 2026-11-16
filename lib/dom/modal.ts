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

/** What an open menu moves focus between: an element that can take it, and say whether it sits in an inert screen. */
export interface FocusStop {
  focus(): void;
  closest(selector: string): unknown;
}

/** Where a menu's links and buttons are looked for. */
export interface StopContainer {
  querySelectorAll(selector: string): Iterable<FocusStop>;
}

/** The key an open menu reacts to, as the browser's keyboard event gives it. */
export interface MenuKeyEvent {
  key: string;
  shiftKey: boolean;
  preventDefault(): void;
}

/** The tab stops of an open menu: the burger, then the menu's links and buttons that are not in an inert screen. */
export function menuStops(burger: FocusStop | null, menu: StopContainer | null): FocusStop[] {
  const inside = [...(menu?.querySelectorAll("a[href], button:not([disabled])") ?? [])].filter((stop) => !stop.closest("[inert]"));

  return [...(burger ? [burger] : []), ...inside];
}

/**
 * What a key does in an open menu: Escape hands the focus to the burger (the header closes the menu); Tab keeps to
 * the stops, wrapping at both ends with the browser's own move prevented, and is otherwise left alone.
 */
export function handleMenuKey(event: MenuKeyEvent, burger: FocusStop | null, menu: StopContainer | null, active: unknown): void {
  if (event.key === "Escape") return burger?.focus();
  if (event.key !== "Tab") return;

  const stops = menuStops(burger, menu);
  const next = trapStop(stops.length, stops.indexOf(active as FocusStop), event.shiftKey);

  if (next === null) return;
  event.preventDefault();
  stops[next].focus();
}
