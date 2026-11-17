/** The notifications preview's wording editor as it types a message in: the message as parts and how far in it is. */

/** A message as the dashboard's editor shows it: text and the variables filled in at send time, written `{first name}`. */
export type WordingPart = { kind: "text"; text: string } | { kind: "variable"; name: string };

/** One keystroke every 30ms. */
export const TYPING_MS = 30;

/** The values the lock screen reads each variable with, by the variable's name (the sample customer's). */
export const sampleValues = (values: ReadonlyArray<{ name: string; value: string }>): Readonly<Record<string, string>> =>
  Object.fromEntries(values.map(({ name, value }) => [name, value]));

const VARIABLE = /\{([^{}]+)\}/g;

export function parseWording(text: string): WordingPart[] {
  const parts: WordingPart[] = [];
  let from = 0;

  for (const match of text.matchAll(VARIABLE)) {
    if (match.index > from) parts.push({ kind: "text", text: text.slice(from, match.index) });
    parts.push({ kind: "variable", name: match[1] });
    from = match.index + match[0].length;
  }
  if (from < text.length) parts.push({ kind: "text", text: text.slice(from) });
  return parts;
}

/** The keystrokes the message takes: a letter is one, and a variable is one, landing whole as a chip. */
export function wordingSteps(parts: readonly WordingPart[]): number {
  return parts.reduce((sum, part) => sum + (part.kind === "text" ? part.text.length : 1), 0);
}

/** The message as written after `steps` keystrokes. */
export function typedWording(parts: readonly WordingPart[], steps: number): WordingPart[] {
  const shown: WordingPart[] = [];
  let left = steps;

  for (const part of parts) {
    if (left <= 0) break;
    if (part.kind === "variable") {
      shown.push(part);
      left -= 1;
    } else {
      shown.push({ kind: "text", text: part.text.slice(0, left) });
      left -= part.text.length;
    }
  }
  return shown;
}

/** The message as a customer reads it: each variable replaced by its value, or left as typed when it has none. */
export function resolveWording(parts: readonly WordingPart[], values: Readonly<Record<string, string>>): string {
  return parts.map((part) => (part.kind === "text" ? part.text : (values[part.name] ?? `{${part.name}}`))).join("");
}

/** The keystrokes made `elapsedMs` after typing began; all of them at once for a reader who asks for less motion. */
export function typedSteps(elapsedMs: number, total: number, reducedMotion = false): number {
  if (reducedMotion) return total;
  return Math.min(total, Math.max(0, Math.floor(elapsedMs / TYPING_MS)));
}

export type WordingMode = "ready" | "own";

export interface WordingView {
  /** What the message field holds. */
  parts: WordingPart[];
  /** What the lock screen's notification says. */
  banner: string;
  /** Whether the editor is still typing: the caret shows. */
  typing: boolean;
}

/** The field and the lock screen for a mode, `steps` keystrokes into the owner's own words. */
export function wordingView({
  mode,
  steps,
  ready,
  own,
  values,
}: Readonly<{ mode: WordingMode; steps: number; ready: string; own: string; values: Readonly<Record<string, string>> }>): WordingView {
  if (mode === "ready") return { parts: parseWording(ready), banner: ready, typing: false };

  const parts = parseWording(own);
  const typed = typedWording(parts, steps);

  return { parts: typed, banner: resolveWording(typed, values), typing: steps < wordingSteps(parts) };
}
