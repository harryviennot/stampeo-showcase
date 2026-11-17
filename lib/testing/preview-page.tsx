import type { ReactElement, ReactNode } from "react";
import type { LandingSlug } from "../landing-pages/pages";
import type { Market } from "../markets";
import { PAGE_COMPONENTS, pageFile } from "./landing-pages-source";
import { renderInAsync } from "./render-en";
import { inServerLocale, mockEnglishServerTranslations } from "./server-intl";

const PAGES = new Map<string, Promise<string>>();

/**
 * A landing page as a visitor's browser receives it, without the shell's header and footer: the page
 * component called as Next calls it for the language and the market, its async sections resolved, that market's
 * ladder and trial length in place. The feature pages and the loyalty page are served for the international
 * market only (the default); the homepage is the one page with a US version.
 */
export function renderPreviewPage(slug: LandingSlug, locale = "en", market: Market = "int"): Promise<string> {
  const key = `${slug}|${locale}|${market}`;

  if (!PAGES.has(key)) {
    PAGES.set(
      key,
      (async () => {
        await mockEnglishServerTranslations();
        const page = await import(pageFile(slug));
        const Page = page[PAGE_COMPONENTS[slug]];

        return inServerLocale(locale, async () => {
          const shell = (await Page({ market })) as ReactElement<{ children: ReactNode }>;

          return renderInAsync(locale, shell.props.children, { market });
        });
      })(),
    );
  }
  return PAGES.get(key) as Promise<string>;
}

/** Every link and button of a render, with its attributes and the name a screen reader gives it. */
export function tapTargets(html: string): Array<{ tag: string; attrs: string; name: string }> {
  return [...html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)].map(([, tag, attrs, inner]) => {
    const label = /\baria-label="([^"]*)"/.exec(attrs)?.[1];
    const text = inner.replace(/<svg\b[^>]*\baria-hidden[\s\S]*?<\/svg>/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    return { tag, attrs, name: label ?? text };
  });
}

/** The page's `data-landing-section` ids in document order, and the markup of each section up to the next. */
export function sectionsOf(html: string): Array<{ id: string; html: string }> {
  const marks = [...html.matchAll(/data-landing-section="([a-z_]+)"/g)];

  return marks.map((mark, index) => ({ id: mark[1], html: html.slice(mark.index, marks[index + 1]?.index ?? html.length) }));
}

/** The markup of one section of a landing page as a visitor receives it, or "" when the page has no such section. */
export async function sectionOf(slug: LandingSlug, id: string, locale = "en", market: Market = "int"): Promise<string> {
  return sectionsOf(await renderPreviewPage(slug, locale, market)).find((section) => section.id === id)?.html ?? "";
}
