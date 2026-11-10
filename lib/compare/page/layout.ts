/**
 * Laying a comparison's MDX out as sections: side components written next to
 * each other are paired, and the page is cut into plain sections and
 * full-width bands. Everything here rewrites MDX text before it is compiled.
 */

// A JSX opening tag, whose attribute values may hold `>` inside a string or an expression.
const OPEN = (tag: string) => String.raw`<${tag}\b(?:"[^"]*"|'[^']*'|\{(?:[^{}]|\{[^{}]*\})*\}|[^>"'{}])*>`;
const SIDE = /\bside=(["'])(competitor|stampeo)\1/;

interface Block {
  index: number;
  end: number;
  text: string;
  side: string | null;
}

/** Every `<Tag …>…</Tag>` in the text, in order, with the side its tag names. */
function blocksOf(content: string, tag: string): Block[] {
  const pattern = new RegExp(`${OPEN(tag)}[\\s\\S]*?</${tag}>`, "g");
  return [...content.matchAll(pattern)].map((match) => ({
    index: match.index,
    end: match.index + match[0].length,
    text: match[0],
    side: SIDE.exec(match[0].slice(0, match[0].indexOf(">") + 1))?.[2] ?? null,
  }));
}

/** Wraps `[start, end)` of the text in a tag, with blank lines so the markdown inside is still parsed. */
const wrap = (content: string, start: number, end: number, tag: string) =>
  `${content.slice(0, start)}<${tag}>\n\n${content.slice(start, end)}\n\n</${tag}>${content.slice(end)}`;

/**
 * Two blocks of the same component, one per side, written back to back (either
 * order) go into one wrapper; a block whose twin is not right next to it stays alone.
 */
export function pairSides(content: string, tag: string, wrapper: string): string {
  const blocks = blocksOf(content, tag);
  let paired = content;

  // From the end, so an earlier wrap never moves a later block.
  for (let i = blocks.length - 2; i >= 0; i--) {
    const [first, second] = [blocks[i], blocks[i + 1]];
    const adjacent = first.side && second.side && first.side !== second.side && content.slice(first.end, second.index).trim() === "";
    if (adjacent) {
      paired = wrap(paired, first.index, second.end, wrapper);
      i--;
    }
  }
  return paired;
}

/** A run of `<Tag>` blocks with only whitespace between them goes into one wrapper. */
export function gatherRuns(content: string, tag: string, wrapper: string): string {
  const blocks = blocksOf(content, tag);
  let gathered = content;

  for (let i = blocks.length - 1; i >= 0; i--) {
    let first = i;
    while (first > 0 && content.slice(blocks[first - 1].end, blocks[first].index).trim() === "") first--;
    gathered = wrap(gathered, blocks[first].index, blocks[i].end, wrapper);
    i = first;
  }
  return gathered;
}

type Kind = "plain" | "table" | "strengths";
interface Segment {
  kind: Kind;
  text: string;
}

/** The text cut before every `## ` heading line outside a code fence. */
function cutAtHeadings(text: string): string[] {
  const pieces: string[] = [];
  let current: string[] = [];
  let inFence = false;

  for (const line of text.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
    if (!inFence && /^## /.test(line) && current.some((kept) => kept.trim() !== "")) {
      pieces.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  pieces.push(current.join("\n"));
  return pieces;
}

const STRENGTHS_BLOCK = new RegExp(`<StrengthsPair>[\\s\\S]*?</StrengthsPair>|${OPEN("Strengths")}[\\s\\S]*?</Strengths>`, "g");

/** The text as segments: strengths blocks on their own, the rest cut at its headings, a segment with the table apart from prose. */
function segmentsOf(content: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  const addProse = (text: string) => {
    for (const piece of cutAtHeadings(text)) {
      if (piece.trim() !== "") segments.push({ kind: /<ComparisonTable\b/.test(piece) ? "table" : "plain", text: piece });
    }
  };

  for (const match of content.matchAll(STRENGTHS_BLOCK)) {
    addProse(content.slice(cursor, match.index));
    segments.push({ kind: "strengths", text: match[0] });
    cursor = match.index + match[0].length;
  }
  addProse(content.slice(cursor));
  return segments;
}

/**
 * The page as sections: the table and the strengths sit on full-width bands,
 * everything else on plain sections, neighbours of the same kind merged. Words
 * are only moved into a section, never reordered or changed.
 */
export function inSections(content: string): string {
  const merged: Segment[] = [];
  for (const segment of segmentsOf(content)) {
    const last = merged[merged.length - 1];
    if (last && last.kind === segment.kind && segment.kind !== "table") last.text += `\n\n${segment.text}`;
    else merged.push({ ...segment });
  }

  return merged
    .map(({ kind, text }) => `<PageSection tone="${kind === "plain" ? "plain" : "band"}">\n\n${text.trim()}\n\n</PageSection>`)
    .join("\n\n");
}
