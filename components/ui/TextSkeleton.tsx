/**
 * Inline placeholder for a number that has not resolved yet (STA-330: prices
 * and trial days hold until the client knows the visitor's region).
 *
 * Rendered INSIDE the text element it stands in for, so it inherits the font
 * size and line box — the chip is `1em` tall and `ch`-wide, and the layout is
 * pixel-identical before and after the value arrives. `aria-hidden` and no
 * `aria-live`: the held state lasts one hydration frame, and announcing a
 * pulse placeholder to a screen reader is noise. Class idiom matches the
 * Header auth slot (`bg-[var(--muted)] animate-pulse`).
 */
export function TextSkeleton({ ch = 4 }: Readonly<{ ch?: number }>) {
  return (
    <span
      aria-hidden
      className="inline-block h-[1em] align-middle rounded bg-[var(--muted)] animate-pulse"
      style={{ width: `${ch}ch` }}
    />
  );
}
