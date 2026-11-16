import type { CSSProperties } from "react";

const INK = "var(--foreground)";
const ACCENT = "var(--accent)";
const GREY = "#9ca3af";

const delay = (seconds: number) => ({ "--ink-delay": `${seconds}s` }) as CSSProperties;

/** The dashes of the line from the phone to the cloud, left to right: each is drawn a moment after the one before. */
const DASHES = Array.from({ length: 7 }, (_, index) => ({ x1: 128 + index * 14, x2: 128 + index * 14 + 8, delay: 0.3 + index * 0.12 }));

/** The cross that cuts the line lands after the last dash. */
const CROSS_DELAY = 0.3 + DASHES.length * 0.12 + 0.3;

/**
 * Where a customer's location goes, drawn in 300 by 150: a phone inside the dashed ring around a shop, a grey
 * cloud on the other side, and a dashed line between them with an ink cross on it. The ring, the shop and the
 * phone stand still; the dashes and the cross draw themselves when the section scrolls in (and are drawn
 * already for a reader who asks for less motion).
 */
export function PrivacyDiagram() {
  return (
    <svg viewBox="0 0 300 150" aria-hidden className="h-auto w-full" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* The shop's ring, with the shop at its centre */}
      <circle cx="74" cy="75" r="58" fill={ACCENT} fillOpacity="0.07" stroke={ACCENT} strokeWidth="1.75" strokeDasharray="5 6" />
      <rect x="60" y="48" width="28" height="28" rx="9" fill={ACCENT} stroke={INK} strokeWidth="1.5" />
      <path d="M67 58.5h14l-1-4.5H68zM68 58.5v9h12v-9M72.5 67.5v-4h3v4" stroke="#fff" strokeWidth="1.5" />
      <path d="M70 76l4 5 4-5" fill={INK} stroke={INK} strokeWidth="1.5" />

      {/* The phone, inside the ring */}
      <rect x="96" y="88" width="18" height="30" rx="4.5" fill="#fff" stroke={INK} strokeWidth="1.5" />
      <path d="M102 92.5h6" stroke={INK} strokeWidth="1.5" />

      {/* The cloud, outside it */}
      <path
        d="M236 104h28a15 15 0 0 0 1.5-29.9A21 21 0 0 0 225 80a12 12 0 0 0 11 24z"
        fill="#f3f4f6"
        stroke={GREY}
        strokeWidth="1.75"
      />

      {/* The line between them, cut */}
      <g className="ink-draw" stroke={INK} strokeWidth="2">
        {DASHES.map(({ x1, x2, delay: seconds }, index) => (
          <line
            key={x1}
            data-part="dash"
            x1={x1}
            y1={102 - index * 2.2}
            x2={x2}
            y2={102 - (index + 0.55) * 2.2}
            pathLength={1}
            style={delay(seconds)}
          />
        ))}
        <g stroke={ACCENT} strokeWidth="3.5">
          <line data-part="cross" x1="170" y1="78" x2="186" y2="94" pathLength={1} style={delay(CROSS_DELAY)} />
          <line data-part="cross" x1="186" y1="78" x2="170" y2="94" pathLength={1} style={delay(CROSS_DELAY + 0.15)} />
        </g>
      </g>
    </svg>
  );
}
