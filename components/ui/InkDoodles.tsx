import type { CSSProperties } from "react";

/**
 * Hand-sketched ink doodles: the small infographics of the paper-and-ink
 * direction. Same drawing rules as InkAnnotation — near-black ink, round
 * caps, wobbly lines, exactly one accent element each — and the same
 * `.ink-draw` CSS so they draw themselves in on reveal, stroke by stroke.
 *
 * All three are decorative (aria-hidden); the copy next to them carries the
 * meaning.
 */

const delayStyle = (seconds: number) =>
  ({ "--ink-delay": `${seconds}s` }) as CSSProperties;

const INK_PROPS = {
  fill: "none",
  stroke: "var(--near-black)",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** A loyalty card being sketched: logo lines, three stamps, one inked in. */
export function DoodleCard({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 96 96" className={`ink-draw ${className}`} aria-hidden {...INK_PROPS}>
      {/* Card outline, drawn in one slightly crooked pass */}
      <path
        d="M14 29 C12 24 16 21 22 22 L76 23 C83 23 85 26 84 32 L83 63 C83 69 80 71 74 70 L20 70 C13 70 12 66 13 60 Z"
        pathLength={1}
        style={delayStyle(0.1)}
      />
      {/* Logo and a line of text */}
      <path d="M23 33 L47 34" pathLength={1} style={delayStyle(0.55)} />
      <path d="M23 41 L38 42" pathLength={1} style={delayStyle(0.7)} />
      {/* Three stamps, the first one inked in */}
      <circle cx="29" cy="57" r="6" pathLength={1} className="ink-fill" fill="var(--accent)" style={delayStyle(0.85)} />
      <circle cx="48" cy="57" r="6" pathLength={1} style={delayStyle(1)} />
      <circle cx="67" cy="57" r="6" pathLength={1} style={delayStyle(1.15)} />
    </svg>
  );
}

/** A phone showing a QR code, the thing customers actually scan. */
export function DoodlePhoneScan({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 96 96" className={`ink-draw ${className}`} aria-hidden {...INK_PROPS}>
      {/* Phone body */}
      <path
        d="M36 10 C31 10 30 13 30 18 L30 78 C30 84 32 86 38 86 L58 86 C64 86 66 84 66 78 L66 17 C66 11 64 10 59 10 Z"
        pathLength={1}
        style={delayStyle(0.1)}
      />
      <path d="M43 16 L53 16" pathLength={1} style={delayStyle(0.55)} />
      {/* QR code: three corner squares and two dots, one square in accent */}
      <path d="M37 33 h9 v9 h-9 Z" pathLength={1} className="ink-fill" fill="var(--accent)" style={delayStyle(0.7)} />
      <path d="M50 33 h9 v9 h-9 Z" pathLength={1} style={delayStyle(0.85)} />
      <path d="M37 46 h9 v9 h-9 Z" pathLength={1} style={delayStyle(1)} />
      <path d="M52 48 L55 48" pathLength={1} style={delayStyle(1.15)} />
      <path d="M56 53 L59 53" pathLength={1} style={delayStyle(1.25)} />
      {/* The stamp it earns */}
      <path d="M40 68 L45 73 L56 63" pathLength={1} style={delayStyle(1.4)} />
    </svg>
  );
}

/** Visits climbing: three bars and a rising arrow over them. */
export function DoodleChart({ className = "" }: Readonly<{ className?: string }>) {
  return (
    <svg viewBox="0 0 96 96" className={`ink-draw ${className}`} aria-hidden {...INK_PROPS}>
      {/* Axes in one stroke */}
      <path d="M16 22 C15 42 15 60 15 77 L82 78" pathLength={1} style={delayStyle(0.1)} />
      {/* Bars, drawn up-across-down like a hand would */}
      <path d="M26 78 L27 62 L37 63 L37 78" pathLength={1} style={delayStyle(0.55)} />
      <path d="M45 78 L46 50 L56 51 L56 78" pathLength={1} style={delayStyle(0.75)} />
      <path d="M64 78 L65 36 L75 37 L75 78" pathLength={1} style={delayStyle(0.95)} />
      {/* The trend, in accent */}
      <path d="M22 50 C38 40 54 32 74 20" pathLength={1} stroke="var(--accent)" style={delayStyle(1.2)} />
      <path d="M66 17 L77 18 L73 28" pathLength={1} stroke="var(--accent)" style={delayStyle(1.6)} />
    </svg>
  );
}
