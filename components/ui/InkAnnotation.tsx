import type { CSSProperties, ReactNode } from "react";

/**
 * Hand-drawn ink annotations, part of the paper-and-ink direction. Arrows and
 * notes in the brand ink, scribbled over the page like a pen on a printout.
 * Strokes sketch themselves in when an ancestor ScrollReveal gets `.revealed`
 * (see `.ink-draw` in globals.css) — no JS of their own.
 *
 * Budget: at most one annotation per section. Two and they stop reading as a
 * human touch and start reading as a theme.
 */

type ArrowVariant =
  | "downLeft"
  | "downRight"
  | "down"
  | "right"
  | "upLeft"
  | "upRight";

/* Each variant is one wobbly main stroke plus a two-flick arrowhead that
   draws slightly after it. Curves are deliberately not symmetric — a clean
   arc reads as clipart, not as a hand. */
const ARROWS: Record<
  ArrowVariant,
  { viewBox: string; body: string; head: string }
> = {
  downLeft: {
    viewBox: "0 0 56 64",
    body: "M46 5 C51 21 44 40 17 52",
    head: "M28 43 L15 53 L30 58",
  },
  downRight: {
    viewBox: "0 0 56 64",
    body: "M10 5 C5 21 12 40 39 52",
    head: "M28 43 L41 53 L26 58",
  },
  down: {
    viewBox: "0 0 32 56",
    body: "M9 4 C20 15 21 31 14 46",
    head: "M6 38 L13 49 L22 40",
  },
  right: {
    viewBox: "0 0 80 32",
    body: "M4 7 C26 22 50 23 71 14",
    head: "M61 7 L74 13 L63 24",
  },
  upLeft: {
    viewBox: "0 0 56 64",
    body: "M46 59 C51 43 44 24 17 12",
    head: "M28 21 L15 11 L30 6",
  },
  upRight: {
    viewBox: "0 0 56 64",
    body: "M10 59 C5 43 12 24 39 12",
    head: "M28 21 L41 11 L26 6",
  },
};

const delayStyle = (seconds: number) =>
  ({ "--ink-delay": `${seconds}s` }) as CSSProperties;

export function InkArrow({
  variant,
  className = "",
  delay = 0.3,
}: Readonly<{
  variant: ArrowVariant;
  className?: string;
  /** Seconds after reveal before the stroke starts drawing. */
  delay?: number;
}>) {
  const arrow = ARROWS[variant];
  return (
    <svg
      viewBox={arrow.viewBox}
      fill="none"
      stroke="var(--near-black)"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ink-draw ${className}`}
      aria-hidden
    >
      <path d={arrow.body} pathLength={1} style={delayStyle(delay)} />
      <path d={arrow.head} pathLength={1} style={delayStyle(delay + 0.45)} />
    </svg>
  );
}

export function InkNote({
  children,
  className = "",
  rotate = -3,
}: Readonly<{
  children: ReactNode;
  className?: string;
  /** Degrees. A note pasted perfectly straight looks typeset, not written. */
  rotate?: number;
}>) {
  return (
    <span
      className={`ink-note inline-block ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
