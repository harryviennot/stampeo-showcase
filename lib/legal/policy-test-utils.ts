import fs from "fs";
import path from "path";

// Readers shared by the privacy-policy tests.

/** The privacy policy's Markdown source in one locale. */
export function privacySource(locale: string) {
  const dir = path.join(process.cwd(), "legal", locale);
  const file = fs
    .readdirSync(dir)
    .find((f) => /privacy|confidentialite|privacidad|prywatnosci/.test(f));
  return fs.readFileSync(path.join(dir, file!), "utf-8");
}

/**
 * The body of the first privacy-policy section whose heading matches
 * `heading`, up to the next heading matching `next` (by default the next
 * numbered one).
 *
 * Scoping matters more than it looks: `stampeo_consent` and the word "consent"
 * both appear in §5.3's cookie table, so a document-wide search passes whether
 * or not the section under test says anything. Empty when the heading is
 * missing, so an assertion on it fails rather than reading the wrong text.
 */
export function section(locale: string, heading: RegExp, next: RegExp = /^#+\s+\d/m) {
  const source = privacySource(locale);
  const start = source.search(heading);
  if (start === -1) return "";
  // Start AFTER the heading line, or the heading itself would match `next`.
  const afterHeading = source.indexOf("\n", start);
  if (afterHeading === -1) return "";
  const rest = source.slice(afterHeading);
  const end = rest.search(next);
  return end === -1 ? rest : rest.slice(0, end);
}

/** One locale's `common` message catalog, as the banner and the toggle render it. */
export function commonCatalog(locale: string) {
  return JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "messages", locale, "common.json"), "utf-8"),
  ).common;
}

/** The rows of the retention table in §8, a different table from §5.3's. */
export function retentionTable(locale: string) {
  return section(locale, /^##\s+8\./m, /^##\s+9\./m)
    .split("\n")
    .filter((line) => line.trim().startsWith("|"));
}
