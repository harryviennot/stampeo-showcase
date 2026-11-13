import type { ReactElement, ReactNode } from "react";
import type { PreviewSlug } from "../landing-pages/pages";
import { pageFile } from "./landing-pages-source";
import { renderEnAsync } from "./render-en";
import { mockEnglishServerTranslations } from "./server-intl";

const PAGES = new Map<PreviewSlug, Promise<string>>();

/**
 * A preview's page as a visitor's browser receives it, without the shell's header and footer: the page
 * function called as Next calls it, its async sections resolved, the US dollars and trial in place.
 */
export function renderPreviewPage(slug: PreviewSlug): Promise<string> {
  if (!PAGES.has(slug)) {
    PAGES.set(
      slug,
      (async () => {
        await mockEnglishServerTranslations();
        const { default: Page } = await import(pageFile(slug));
        const shell = Page() as ReactElement<{ children: ReactNode }>;

        return renderEnAsync(shell.props.children);
      })(),
    );
  }
  return PAGES.get(slug) as Promise<string>;
}

/** Every link and button of a render, with its attributes and the name a screen reader gives it. */
export function tapTargets(html: string): Array<{ tag: string; attrs: string; name: string }> {
  return [...html.matchAll(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/g)].map(([, tag, attrs, inner]) => {
    const label = /\baria-label="([^"]*)"/.exec(attrs)?.[1];
    const text = inner.replace(/<svg\b[^>]*\baria-hidden[\s\S]*?<\/svg>/g, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    return { tag, attrs, name: label ?? text };
  });
}
