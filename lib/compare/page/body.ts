/**
 * Shaping the MDX of a comparison before it is compiled: the verdict (the first
 * paragraph) is split off so the check date can sit under it, and the rest is
 * arranged into sections (see `layout.ts`).
 */
import { gatherRuns, inSections, pairSides } from "./layout";

/** A first block that is prose: not a heading, list, quote, table, code fence or a component other than `<Fact>`. */
const NOT_PROSE = /^(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||```|~~~|<(?!Fact\b))/;

export function splitVerdict(content: string): { verdict: string | null; rest: string } {
  const text = content.trimStart();
  const end = text.search(/\n[ \t]*\n/);
  const block = end === -1 ? text : text.slice(0, end);

  if (block === "" || NOT_PROSE.test(block)) return { verdict: null, rest: content };
  return { verdict: block.trimEnd(), rest: end === -1 ? "" : text.slice(end) };
}

// A heading line, then a card: `## Choose Acme if` above `<ChooseIf side="competitor">`.
const HEADED_CARD = /^#{2,3}[ \t]+(.+?)[ \t]*\n\s*\n(<(?:ChooseIf|Strengths)\s+side=(["'])(?:competitor|stampeo)\3)\s*>/gm;

/**
 * A heading written right above a card becomes that card's title, so the card
 * never shows two headings and the pair below finds the cards back to back.
 */
function absorbHeadings(content: string): string {
  return content.replace(
    HEADED_CARD,
    (_match, heading: string, open: string) => `${open} title={${JSON.stringify(heading.replace(/&nbsp;/g, "\u00a0"))}}>`,
  );
}

/**
 * The MDX of a page as the sections it is drawn in: a heading above a card
 * becomes its title, the two cards of a kind written back to back go into one
 * pair, the by-type-of-shop rows into one list, and the page is cut into
 * plain sections and bands.
 */
export function arrangeBody(source: string): string {
  let content = absorbHeadings(source);
  content = pairSides(content, "ChooseIf", "ChooseIfPair");
  content = pairSides(content, "Strengths", "StrengthsPair");
  content = pairSides(content, "PriceCard", "PriceCardPair");
  content = gatherRuns(content, "Fit", "FitList");
  return inSections(content);
}
