/** A line split around its accent words, which are drawn in the accent colour. */
export interface AccentSplit {
  before: string;
  accent: string;
  after: string;
}

/** Splits `text` around its last `accent`; whole and unaccented when `accent` is not in it. */
export function splitAccent(text: string, accent: string): AccentSplit {
  const at = accent ? text.lastIndexOf(accent) : -1;
  if (at === -1) return { before: text, accent: "", after: "" };
  return { before: text.slice(0, at), accent, after: text.slice(at + accent.length) };
}
