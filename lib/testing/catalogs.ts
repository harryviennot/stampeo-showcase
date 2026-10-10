import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createTranslator } from "next-intl";

const MESSAGES = join(import.meta.dir, "..", "..", "messages");

const readFile = (locale: string, file: string) =>
  JSON.parse(readFileSync(join(MESSAGES, locale, file), "utf8"));

const jsonFiles = (locale: string) =>
  readdirSync(join(MESSAGES, locale)).filter((file) => file.endsWith(".json"));

/** The locale folders under `messages/` that hold at least one catalog. */
export function catalogLocales(): string[] {
  return readdirSync(MESSAGES).filter((entry) => !entry.startsWith(".") && jsonFiles(entry).length > 0);
}

/** The catalog files of one locale, e.g. `pricing.json`. */
export function catalogFiles(locale: string): string[] {
  return jsonFiles(locale);
}

/** One catalog file parsed, or every namespace merged into one tree as `i18n/request.ts` serves it. */
export function loadCatalog(locale: string, file?: string) {
  if (file) return readFile(locale, file);
  return Object.assign({}, ...jsonFiles(locale).map((name) => readFile(locale, name)));
}

export interface CatalogString {
  where: string;
  text: string;
}

/**
 * Every string in a parsed tree with its path (`a.b[0].c`). A root ending in
 * `::` (`en/pricing.json::`) is followed by the first key without a dot.
 */
export function catalogStrings(tree: unknown, root = ""): CatalogString[] {
  const out: CatalogString[] = [];
  const walk = (value: unknown, where: string) => {
    if (typeof value === "string") out.push({ where, text: value });
    else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${where}[${i}]`));
    else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        walk(child, where === "" || where.endsWith("::") ? `${where}${key}` : `${where}.${key}`);
      }
    }
  };
  walk(tree, root);
  return out;
}

/** A translator that throws on a missing message or a missing argument instead of logging. */
export function strictTranslator(locale: string, messages: Record<string, unknown>, namespace?: string) {
  return createTranslator({
    locale,
    messages,
    namespace: namespace as never,
    onError: (error) => {
      throw error;
    },
  });
}
