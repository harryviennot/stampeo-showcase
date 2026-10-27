/**
 * What a help page points at must exist: related pages, `/help/<slug>` links,
 * and screenshots. Pure, so the same check runs over a fixture folder and over
 * the real content.
 */

import { stripCodeFences } from "./mdx-source";
import type { HelpPage } from "./types";

// `![alt](src)` and `[text](href)`; a title after the target is allowed and ignored.
const MARKDOWN_LINK = /(!?)\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
// `<Screenshot src="…">` and any `href="…"` written as JSX.
const SCREENSHOT_SRC = /<Screenshot\b[^>]*?\bsrc=["']([^"']+)["']/g;
const JSX_HREF = /\bhref=["']([^"']+)["']/g;

interface Reference {
  kind: "link" | "image";
  target: string;
}

function referencesIn(content: string): Reference[] {
  const source = stripCodeFences(content);
  const references: Reference[] = [];

  for (const match of source.matchAll(MARKDOWN_LINK)) {
    references.push({ kind: match[1] ? "image" : "link", target: match[2] });
  }
  for (const match of source.matchAll(SCREENSHOT_SRC)) references.push({ kind: "image", target: match[1] });
  for (const match of source.matchAll(JSX_HREF)) references.push({ kind: "link", target: match[1] });
  return references;
}

/**
 * Every broken reference in `pages`, one readable line each; empty when the
 * content is sound. `pages` should include drafts, so a published page that
 * points at a draft is caught.
 */
export function findContentProblems(pages: readonly HelpPage[], imageExists: (publicPath: string) => boolean): string[] {
  const bySlug = new Map(pages.map((page) => [page.slug, page]));
  const problems: string[] = [];

  for (const page of pages) {
    const report = (problem: string) => problems.push(`${page.filePath}: ${problem}`);

    const checkPage = (slug: string, where: string) => {
      const target = bySlug.get(slug);
      if (!target) report(`${where} points at /help/${slug}, which is not a page`);
      else if (target.draft && !page.draft) report(`${where} points at /help/${slug}, which is a draft`);
    };

    for (const slug of page.related) checkPage(slug, `related`);

    for (const { kind, target } of referencesIn(page.content)) {
      if (target.startsWith("/docs/")) {
        report(`${target} is in the old /docs/ scheme: link to /help/<slug> and keep images in /help/`);
      } else if (kind === "image") {
        if (!target.startsWith("/help/") || !imageExists(target)) report(`the image ${target} is not in public/help`);
      } else {
        const pathname = target.split(/[?#]/)[0];
        if (pathname.startsWith("/help/")) checkPage(pathname.slice("/help/".length), "a link");
      }
    }
  }

  return problems;
}
