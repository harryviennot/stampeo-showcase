/**
 * Line-level checks on the text of a comparison page.
 *
 * Each finder reports the 1-based line of what it found, so the content loader
 * can name the file and the line. Fenced code is ignored.
 */

export interface LineHit {
  line: number;
}

/** The text with fenced code lines emptied, so line numbers stay put. */
function withoutCodeFences(text: string): string {
  let inFence = false;
  return text
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return "";
      }
      return inFence ? "" : line;
    })
    .join("\n");
}

const lineAt = (text: string, index: number) => text.slice(0, index).split("\n").length;

const SYMBOL = String.raw`(?:US|CA|AU)?[$€£]`;
const CODE = String.raw`(?:EUR|USD|GBP|CHF|CAD|AUD)`;
const WORD = String.raw`(?:euros?|dollars?|pounds?)`;
const NUMBER = String.raw`\d+(?:[.,]\d+)*`;

/** A symbol or code next to a number, in either order, or a number followed by a currency word. */
const CURRENCY_AMOUNT = new RegExp(
  [
    String.raw`${SYMBOL}\s?${NUMBER}`,
    String.raw`${NUMBER}\s?${SYMBOL}`,
    String.raw`\b${CODE}\s?${NUMBER}`,
    String.raw`${NUMBER}\s?${CODE}\b`,
    String.raw`${NUMBER}\s?${WORD}\b`,
  ].join("|"),
  "gi",
);

/** Prices typed into text: `$25`, `25 €`, `EUR 25`, `25 euros`. Prices come from the catalog and the facts files. */
export function findCurrencyAmounts(text: string): Array<LineHit & { match: string }> {
  const clean = withoutCodeFences(text);
  return [...clean.matchAll(CURRENCY_AMOUNT)].map((hit) => ({ line: lineAt(clean, hit.index), match: hit[0] }));
}

const TABLE_DELIMITER = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;

/** Markdown tables (a pipe row over a delimiter row) and raw HTML tables, by the line they start on. */
export function findMarkdownTables(text: string): LineHit[] {
  const lines = withoutCodeFences(text).split("\n");
  const hits: LineHit[] = [];

  lines.forEach((line, i) => {
    if (/<table[\s>]/i.test(line)) hits.push({ line: i + 1 });
    const isDelimiter = line.includes("|") && TABLE_DELIMITER.test(line);
    if (isDelimiter && i > 0 && lines[i - 1].includes("|")) hits.push({ line: i });
  });

  return hits;
}

export interface FactUse extends LineHit {
  /** The id written in the tag, or null when it is not a plain string. */
  id: string | null;
}

/** Every `<Fact …>` tag, with its literal id. */
export function factIdsIn(text: string): FactUse[] {
  const clean = withoutCodeFences(text);
  return [...clean.matchAll(/<Fact\b[^>]*>/g)].map((tag) => ({
    id: /\bid=(["'])(.+?)\1/.exec(tag[0])?.[2] ?? null,
    line: lineAt(clean, tag.index),
  }));
}

/** Does the text open `<ChooseIf side="…">` for this side? */
export function hasChooseIf(text: string, side: "competitor" | "stampeo"): boolean {
  return new RegExp(String.raw`<ChooseIf\s+side=(["'])${side}\1\s*>`).test(withoutCodeFences(text));
}

/** Does the text place `<ComparisonTable />`? */
export function hasComparisonTable(text: string): boolean {
  return /<ComparisonTable\s*\/>/.test(withoutCodeFences(text));
}
