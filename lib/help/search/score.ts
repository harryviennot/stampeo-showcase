/**
 * Searches the help pages in the browser. Every word the reader types must be
 * found, as the start of a word or with one typo, in the title, keywords,
 * section titles, category or description. Pure and dependency-free: the
 * corpus is a few dozen pages, and a hand-written scorer keeps loose near
 * misses ("qzxwvk" finding a page) out.
 */

import type { SearchEntry, SearchHit, SearchSnippet, TextPart } from "./types";

type Field = "title" | "keywords" | "headings" | "category" | "description";

/** How much a match in each field counts. */
const WEIGHT: Record<Field, number> = {
  title: 10,
  keywords: 6,
  headings: 4,
  category: 2,
  description: 2,
};

/** How good a match is: the word itself, its start, or the word with one typo. */
const EXACT = 1;
const PREFIX = 0.8;
const TYPO = 0.5;
/** A word shorter than this is never matched through a typo. */
const TYPO_MIN_LENGTH = 5;

const PHRASE_BONUS = 6;

/** Words that carry no meaning in "how do I add a team member". */
const SMALL_WORDS = new Set([
  "a", "an", "the", "to", "of", "and", "or", "for", "in", "on", "my", "me", "i", "do", "does",
  "how", "can", "is", "it", "you", "your", "with", "from", "what", "where",
]);

/** Lower case, accents removed. */
function fold(text: string): string {
  return text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function wordsOf(text: string): string[] {
  return fold(text).match(/[\p{L}\p{N}]+/gu) ?? [];
}

/**
 * The words a query is searched for. Small words are dropped, unless nothing
 * else is left ("how to" is searched as typed).
 */
export function queryTokens(query: string): string[] {
  const words = wordsOf(query);
  const meaningful = words.filter((word) => !SMALL_WORDS.has(word));
  return meaningful.length > 0 ? meaningful : words;
}

/** True when `a` becomes `b` with one insertion, deletion, substitution or swap of neighbours. */
function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start += 1;
  if (start === a.length && start === b.length) return true;

  const restA = a.slice(start);
  const restB = b.slice(start);
  if (restA.slice(1) === restB.slice(1)) return true; // substitution
  if (restA.slice(1) === restB) return true; // deletion
  if (restA === restB.slice(1)) return true; // insertion
  return restA.length > 1 && restB.length > 1 && restA[0] === restB[1] && restA[1] === restB[0] && restA.slice(2) === restB.slice(2); // swap
}

/** 0 for no match; the word against one of a field's words. */
function quality(token: string, word: string): number {
  if (word === token) return EXACT;
  if (word.startsWith(token)) return PREFIX;
  if (token.length < TYPO_MIN_LENGTH) return 0;
  if (withinOneEdit(token, word)) return TYPO;
  // The reader stopped typing before the end of a word they also mistyped.
  if (word.length > token.length && withinOneEdit(token, word.slice(0, token.length))) return TYPO;
  return 0;
}

function bestQuality(token: string, words: readonly string[]): number {
  let best = 0;
  for (const word of words) best = Math.max(best, quality(token, word));
  return best;
}

interface FieldWords {
  title: string[];
  keywords: string[];
  headings: string[];
  category: string[];
  description: string[];
}

function fieldWords(entry: SearchEntry): FieldWords {
  return {
    title: wordsOf(entry.title),
    keywords: entry.keywords.flatMap(wordsOf),
    headings: entry.headings.flatMap(wordsOf),
    category: wordsOf(entry.category),
    description: wordsOf(entry.description),
  };
}

/** The entry's score for the query, or 0 when any word is missing. */
function scoreEntry(entry: SearchEntry, words: FieldWords, tokens: readonly string[]): number {
  let total = 0;
  for (const token of tokens) {
    let tokenScore = 0;
    for (const field of Object.keys(WEIGHT) as Field[]) tokenScore += WEIGHT[field] * bestQuality(token, words[field]);
    if (tokenScore === 0) return 0;
    total += tokenScore;
  }

  // Typed as the title or a keyword is written.
  const phrase = tokens.join(" ");
  if (tokens.length > 1) {
    if (fold(entry.title).includes(phrase)) total += PHRASE_BONUS;
    if (entry.keywords.some((keyword) => fold(keyword) === phrase)) total += PHRASE_BONUS;
  }
  return total;
}

/** The description, or the section title when only a section title matched. */
function snippetFor(entry: SearchEntry, tokens: readonly string[]): SearchSnippet {
  const description: SearchSnippet = { text: entry.description, source: "description" };
  const found = (text: string) => highlight(text, tokens).filter((part) => part.match).length;

  if (found(entry.description) > 0) return description;
  const heading = entry.headings
    .map((text) => ({ text, found: found(text) }))
    .filter((candidate) => candidate.found > 0)
    .sort((a, b) => b.found - a.found)[0];
  return heading ? { text: heading.text, source: "heading" } : description;
}

/** The pages that match, best first; none for an empty query. */
export function searchHelp(entries: readonly SearchEntry[], query: string, limit = 8): SearchHit[] {
  const tokens = queryTokens(query);
  if (tokens.length === 0) return [];

  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, fieldWords(entry), tokens) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((hit) => ({ ...hit, snippet: snippetFor(hit.entry, tokens) }));
}

/**
 * `text` cut into stretches, marking the words the query names: the typed
 * start of a word, or the whole word when it was mistyped. The stretches join
 * back into `text` exactly.
 */
export function highlight(text: string, tokens: readonly string[]): TextPart[] {
  const parts: TextPart[] = [];
  let cursor = 0;

  const push = (value: string, match: boolean) => {
    if (value === "") return;
    const last = parts[parts.length - 1];
    if (last && last.match === match) last.text += value;
    else parts.push({ text: value, match });
  };

  for (const found of text.matchAll(/[\p{L}\p{N}]+/gu)) {
    const word = found[0];
    const start = found.index ?? 0;
    const folded = fold(word);

    let marked = 0;
    for (const token of tokens) {
      const q = quality(token, folded);
      if (q === 0) continue;
      const covers = q === TYPO || folded.length !== word.length ? word.length : token.length;
      marked = Math.max(marked, covers);
    }

    push(text.slice(cursor, start), false);
    push(word.slice(0, marked), marked > 0);
    push(word.slice(marked), false);
    cursor = start + word.length;
  }
  push(text.slice(cursor), false);
  return parts;
}
