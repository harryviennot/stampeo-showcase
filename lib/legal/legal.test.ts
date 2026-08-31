import { describe, expect, it } from "bun:test";
import fs from "fs";
import path from "path";
// Comes in with `rehype-slug`, which is what generates these ids at build
// time, so the test slugs headings exactly the way the page does.
import GithubSlugger from "github-slugger";
import { routing } from "@/i18n/routing";
import { getLegalContent } from "./index";
import { STABLE_LEGAL_IDS } from "./mdx";

const PAGES = ["privacy", "terms"] as const;

describe("getLegalContent", () => {
  // Both pages call notFound() on a null return, and merchant emails deep-link
  // to /{locale}/privacy and /{locale}/terms, so an unmapped locale is a hard
  // 404 on a link we send out ourselves.
  it("resolves both legal pages in every locale the site serves", () => {
    for (const locale of routing.locales) {
      for (const page of PAGES) {
        const legal = getLegalContent(page, locale);
        expect(legal, `${page} missing for ${locale}`).not.toBeNull();
        expect(legal!.title.length).toBeGreaterThan(0);
        expect(legal!.content.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns null for a locale we do not serve", () => {
    expect(getLegalContent("privacy", "de")).toBeNull();
  });
});

/**
 * Emails link to one stable anchor (`#support-access`) regardless of which
 * locale's page the reader lands on. `rehypeStableLegalIds` rewrites each
 * locale's auto-generated slug to that shared id, so every locale needs an
 * entry — a missing one silently drops the reader at the top of the page.
 */
const DEEP_LINKED = [
  { page: "privacy", section: "2.3", stableId: "support-access" },
  { page: "terms", section: "8.6", stableId: "data-processing-support-access" },
  { page: "privacy", section: "10.1", stableId: "object-to-support-access" },
] as const;

function headingFor(locale: string, page: "privacy" | "terms", section: string) {
  const dir = path.join(process.cwd(), "legal", locale);
  const file = fs
    .readdirSync(dir)
    .find((f) =>
      page === "privacy"
        ? /privacy|confidentialite|privacidad|prywatnosci/.test(f)
        : /terms|conditions|terminos|regulamin/.test(f)
    );
  const source = fs.readFileSync(path.join(dir, file!), "utf-8");
  const match = source
    .split("\n")
    .find((line) => new RegExp(`^#+\\s+${section.replace(".", "\\.")}\\s`).test(line));
  return match?.replace(/^#+\s+/, "").trim();
}

describe("STABLE_LEGAL_IDS", () => {
  it("maps the deep-linked heading of every locale to its stable id", () => {
    for (const locale of routing.locales) {
      for (const { page, section, stableId } of DEEP_LINKED) {
        const heading = headingFor(locale, page, section);
        expect(heading, `${page} §${section} heading missing in ${locale}`).toBeDefined();
        const slug = new GithubSlugger().slug(heading!);
        expect(
          STABLE_LEGAL_IDS[slug],
          `${locale} ${page} §${section} slug "${slug}" is not mapped`
        ).toBe(stableId);
      }
    }
  });
});
