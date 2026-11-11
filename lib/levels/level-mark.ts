/**
 * The colour of the level marks on the sign-up page (the top level's star,
 * border and tint). They sit on the cream strip and sheet, so a business accent
 * that is pale there would vanish: the mark takes the accent only when it
 * reaches 3:1 against that surface, and the page's own ink otherwise.
 */

/** The page's ink colour, readable on the strip and the sheet. */
export const LEVEL_INK = "var(--primary)";

type Rgb = [number, number, number];

/** The strip and the sheet are drawn on the page's cream. */
const SURFACE_RGB: Rgb = [250, 249, 246];

/** Minimum contrast for a mark that is not text (WCAG non-text contrast). */
const MIN_CONTRAST = 3;

/** `#rgb`, `#rrggbb` or `rgb(r, g, b)` as channels, else null. */
function parseColor(value: string): Rgb | null {
  const text = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text)?.[1];
  if (hex) {
    const full = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16)) as Rgb;
  }
  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(text);
  if (!rgb) return null;
  const channels = rgb.slice(1, 4).map(Number) as Rgb;
  return channels.every((c) => c <= 255) ? channels : null;
}

function luminance(color: Rgb): number {
  const [r, g, b] = color.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastWithSurface(color: Rgb): number {
  const [a, b] = [luminance(color), luminance(SURFACE_RGB)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** The business accent when it shows on the strip, else the page ink. */
export function levelMarkColor(accent: string | null | undefined): string {
  const rgb = accent ? parseColor(accent) : null;
  return accent && rgb && contrastWithSurface(rgb) >= MIN_CONTRAST ? accent.trim() : LEVEL_INK;
}
