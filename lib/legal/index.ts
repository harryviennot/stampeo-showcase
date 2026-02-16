import fs from "fs";
import path from "path";

type LegalPageType = "privacy" | "terms";

const FILE_MAP: Record<LegalPageType, Record<string, string>> = {
  privacy: {
    en: "privacy-policy.md",
    fr: "politique-de-confidentialite.md",
  },
  terms: {
    en: "terms-of-service.md",
    fr: "conditions-generales-utilisation.md",
  },
};

const LEGAL_DIR = path.join(process.cwd(), "legal");

export function getLegalContent(
  pageType: LegalPageType,
  locale: string
): { title: string; lastUpdated: string; content: string } | null {
  const filename = FILE_MAP[pageType]?.[locale];
  if (!filename) return null;

  const filePath = path.join(LEGAL_DIR, locale, filename);
  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf-8");

  // Extract title from first # heading
  const titleMatch = source.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract last-updated from first bold line
  const dateMatch = source.match(/^\*\*(.+?)\*\*$/m);
  const lastUpdated = dateMatch ? dateMatch[1].trim() : "";

  // Remove the title and date lines from content, pass the rest as MDX source
  const content = source
    .replace(/^#\s+.+$/m, "")
    .replace(/^\*\*(.+?)\*\*$/m, "")
    .trim();

  return { title, lastUpdated, content };
}
