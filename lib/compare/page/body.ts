/**
 * Shaping the MDX of a comparison before it is compiled: the verdict (the first
 * paragraph) is split off so the check date can sit under it, and the two
 * "Choose if" cards are paired and followed by the sign-up button.
 */

/** A first block that is prose: not a heading, list, quote, table, code fence or a component other than `<Fact>`. */
const NOT_PROSE = /^(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|\||```|~~~|<(?!Fact\b))/;

export function splitVerdict(content: string): { verdict: string | null; rest: string } {
  const text = content.trimStart();
  const end = text.search(/\n[ \t]*\n/);
  const block = end === -1 ? text : text.slice(0, end);

  if (block === "" || NOT_PROSE.test(block)) return { verdict: null, rest: content };
  return { verdict: block.trimEnd(), rest: end === -1 ? "" : text.slice(end) };
}

const CHOOSE_IF = /<ChooseIf\s+side=(["'])(competitor|stampeo)\1[^>]*>[\s\S]*?<\/ChooseIf>/g;
const CALL_TO_ACTION = "<CallToAction />";

// A heading line, then a card: `## Choose Acme if` above `<ChooseIf side="competitor">`.
const HEADED_CARD = /^#{2,3}[ \t]+(.+?)[ \t]*\n\s*\n(<ChooseIf\s+side=(["'])(?:competitor|stampeo)\3)\s*>/gm;

/**
 * A heading written right above a card becomes that card's title, so the card
 * never shows two headings and the pair below finds the cards back to back.
 */
function absorbHeadings(content: string): string {
  return content.replace(HEADED_CARD, (_match, heading: string, open: string) => `${open} title={${JSON.stringify(heading)}}>`);
}

/**
 * Two cards written back to back (either order) go into one `<ChooseIfPair>`;
 * a `<CallToAction />` follows the last card unless the writer placed one.
 */
export function arrangeBody(source: string): string {
  const content = absorbHeadings(source);
  const cards = [...content.matchAll(CHOOSE_IF)];
  if (cards.length === 0) return content;

  let arranged = content;
  const pairAt = cards.findIndex((card, i) => {
    const next = cards[i + 1];
    return next && card[2] !== next[2] && content.slice(card.index + card[0].length, next.index).trim() === "";
  });
  if (pairAt >= 0) {
    const [first, second] = [cards[pairAt], cards[pairAt + 1]];
    arranged =
      content.slice(0, first.index) +
      `<ChooseIfPair>\n\n${first[0]}\n\n${second[0]}\n\n</ChooseIfPair>` +
      content.slice(second.index + second[0].length);
  }

  if (/<CallToAction\b/.test(arranged)) return arranged;

  const lastCard = arranged.lastIndexOf("</ChooseIf>") + "</ChooseIf>".length;
  const pairClose = /^\s*<\/ChooseIfPair>/.exec(arranged.slice(lastCard));
  const insertAt = lastCard + (pairClose ? pairClose[0].length : 0);
  return `${arranged.slice(0, insertAt)}\n\n${CALL_TO_ACTION}\n\n${arranged.slice(insertAt)}`;
}
