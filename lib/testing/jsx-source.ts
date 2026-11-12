import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Helpers for tests that read JSX source instead of rendering it (there is no
 * component runner). They find tags and literal attributes, and follow imports
 * the way `consent-routes.test.ts` does.
 */

export const ROOT = join(import.meta.dir, "..", "..");

export function read(file: string): string {
  return readFileSync(file, "utf-8");
}

/**
 * Whole-line `//` comments and block comments, blanked out with their line
 * breaks kept. A trailing `//` is left alone: it is indistinguishable from the
 * one inside `"https://…"`. Line comments go first, so a `/*` inside one (as in
 * "/us/*") does not open a block.
 */
export function stripComments(source: string): string {
  const blank = (text: string) => text.replace(/[^\n]/g, " ");
  return source.replace(/^[ \t]*\/\/.*$/gm, blank).replace(/\/\*[\s\S]*?\*\//g, blank);
}

export interface Tag {
  name: string;
  attrs: string;
}

/** Index of the `>` that closes a tag, skipping `{…}` and quoted strings. */
function tagEnd(source: string, from: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = from; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i;
  }
  return -1;
}

/** Every JSX opening tag in source order, with its raw attribute text. */
export function openingTags(source: string): Tag[] {
  const code = stripComments(source);
  const tags: Tag[] = [];
  for (const match of code.matchAll(/<([A-Za-z][\w.]*)(?=[\s/>])/g)) {
    const start = match.index + match[0].length;
    const end = tagEnd(code, start);
    if (end === -1) continue;
    tags.push({ name: match[1], attrs: code.slice(start, end) });
  }
  return tags;
}

/** The literal value of an attribute (`a="x"` or `a={"x"}`), or null. */
export function literalAttr(attrs: string, name: string): string | null {
  const match = attrs.match(
    new RegExp(`(?:^|\\s)${name}=(?:"([^"]*)"|'([^']*)'|\\{\\s*["'\`]([^"'\`$]*)["'\`]\\s*\\})`),
  );
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? null;
}

/** The file an import specifier points at (`@/…` or relative), if it is one of ours. */
export function resolveImport(from: string, specifier: string): string | undefined {
  const base = specifier.startsWith("@/") ? join(ROOT, specifier.slice(2)) : join(dirname(from), specifier);
  return [`${base}.tsx`, `${base}.ts`, join(base, "index.tsx")].find((file) => existsSync(file));
}

/** Local name → file, for every default or named import of ours in `source`. */
export function importedFiles(file: string, source: string): Map<string, string> {
  const imports = new Map<string, string>();
  const pattern = /import\s+(?:type\s+)?(?:(\w+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s+"([^"]+)"/g;
  for (const match of stripComments(source).matchAll(pattern)) {
    const target = resolveImport(file, match[3]);
    if (!target) continue;
    if (match[1]) imports.set(match[1], target);
    for (const part of (match[2] ?? "").split(",")) {
      const name = part.trim().split(/\s+as\s+/).pop();
      if (name) imports.set(name, target);
    }
  }
  return imports;
}

/** Every `.ts` / `.tsx` file under a folder, tests excluded. */
export function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}
