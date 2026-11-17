import { code } from "./jsx-source";

/** The `--stack-zoom` of every stacked picture in a render of `HoverRows`. */
export function stackZooms(html: string): number[] {
  return [...html.matchAll(/--stack-zoom:([\d.]+)/g)].map((match) => Number(match[1]));
}

/** Tailwind's named text sizes, in px. */
const NAMED = { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, "2xl": 24, "3xl": 30, "4xl": 36 } as const;

/**
 * The smallest font size, in drawn px, that the source sets for a phone: a
 * `text-[Npx]` or named `text-xs` class with no breakpoint prefix, or a
 * `fontSize` style. It throws when it finds none, so a check built on it can
 * never pass because a component stopped writing sizes in a form it reads.
 */
export function smallestLabelPxIn(source: string): number {
  const classes = [...source.matchAll(/(?<![:\w-])text-(?:\[([\d.]+)px\]|(xs|sm|base|lg|xl|2xl|3xl|4xl))(?![\w[-])/g)].map((match) =>
    match[1] ? Number(match[1]) : NAMED[match[2] as keyof typeof NAMED],
  );
  const styles = [...source.matchAll(/fontSize:\s*"?([\d.]+)/g)].map((match) => Number(match[1]));
  const sizes = [...classes, ...styles];

  if (sizes.length === 0) throw new Error("no font size found in the source");
  return Math.min(...sizes);
}

/** `smallestLabelPxIn` for a component's file. */
export const smallestLabelPx = (file: string) => smallestLabelPxIn(code(file));
