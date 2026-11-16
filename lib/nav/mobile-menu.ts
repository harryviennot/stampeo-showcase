/** The phone menu's pure choices: how it moves and which of its entries is the page you are on. */

/** The menu's timing, in seconds, and how far it rises (px) as it fades in. */
export interface MenuMotion {
  rise: number;
  enter: number;
  exit: number;
  /** The wait between one group of the menu appearing and the next. */
  stagger: number;
}

/** A 180ms fade with a 6px rise and a 25ms stagger; for a reader who wants less motion, the same fade and nothing else. */
export function menuMotion(reducedMotion: boolean): MenuMotion {
  return { rise: reducedMotion ? 0 : 6, enter: 0.18, exit: 0.12, stagger: reducedMotion ? 0 : 0.025 };
}

/** Whether `href` is the page `pathname` (locale-stripped) or one inside it; an anchor never is. */
export function isCurrentPath(pathname: string, href: string): boolean {
  if (href.startsWith("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Tailwind's `lg`: from this width the page shows the desktop header and the phone menu is hidden. */
export const DESKTOP_QUERY = "(min-width: 64rem)";

/** The part of a `MediaQueryList` that `closeWhenDesktop` reads. */
export interface DesktopQuery {
  matches: boolean;
  addEventListener(type: "change", listener: () => void): void;
  removeEventListener(type: "change", listener: () => void): void;
}

/**
 * Closes an open phone menu once the window is at the desktop width, so the page scroll and the inert page are
 * given back: at once if it already is, and whenever it grows into it. Returns the function that stops watching.
 */
export function closeWhenDesktop(query: DesktopQuery, onClose: () => void): () => void {
  const check = () => {
    if (query.matches) onClose();
  };

  check();
  query.addEventListener("change", check);
  return () => query.removeEventListener("change", check);
}
