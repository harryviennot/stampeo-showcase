/** What a full-screen menu owes the reader who cannot see it: Tab stays inside it, and the page behind it cannot be reached. */

/**
 * Where Tab or Shift+Tab sends focus among `count` tab stops when it is on stop `at` (-1 outside them): the stop to
 * focus, or null to leave the browser's own move. Focus leaving either end, or starting outside, wraps round.
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

/** Makes each element inert and returns the function that gives each back its state; a missing element is skipped. */
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

/** An element an open menu moves focus between. */
export interface FocusStop {
  focus(): void;
  closest(selector: string): unknown;
}

export interface StopContainer {
  querySelectorAll(selector: string): Iterable<FocusStop>;
}

export interface MenuKeyEvent {
  key: string;
  shiftKey: boolean;
  preventDefault(): void;
}

/** The burger, then the menu's links and buttons that are not in an inert screen. */
export function menuStops(burger: FocusStop | null, menu: StopContainer | null): FocusStop[] {
  const inside = [...(menu?.querySelectorAll("a[href], button:not([disabled])") ?? [])].filter((stop) => !stop.closest("[inert]"));

  return [...(burger ? [burger] : []), ...inside];
}

/** Escape hands the focus to the burger (the header closes the menu); Tab wraps at both ends of the stops. */
export function handleMenuKey(event: MenuKeyEvent, burger: FocusStop | null, menu: StopContainer | null, active: unknown): void {
  if (event.key === "Escape") return burger?.focus();
  if (event.key !== "Tab") return;

  const stops = menuStops(burger, menu);
  const next = trapStop(stops.length, stops.indexOf(active as FocusStop), event.shiftKey);

  if (next === null) return;
  event.preventDefault();
  stops[next].focus();
}
