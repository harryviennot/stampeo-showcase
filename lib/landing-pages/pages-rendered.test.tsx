/**
 * The eight pages as each language's visitor receives them, in the market they are served for: the international one.
 * The copy guards read the modules; this reads what the components print from them (sample money, linked answers,
 * alt texts), where a word can still go wrong. The homepage is the one page with a US version, so it alone is also
 * read for dollars.
 */

import { describe, expect, test } from "bun:test";
import { routing } from "@/i18n/routing";
import { localePath } from "../hreflang";
import { decodeEntities, pictures, textOf } from "../testing/render-en";
import { renderPreviewPage, sectionOf } from "../testing/preview-page";
import { landingCopy } from "./copy/bundle";
import { ALL_LANDING_SLUGS } from "./pages";

const PAGES = routing.locales.flatMap((locale) => ALL_LANDING_SLUGS.map((slug) => [locale, slug] as const));

/** What the visitor reads, and what a screen reader reads out of the pictures and links. */
function readable(html: string): string {
  const withoutStyle = html.replace(/<style\b[\s\S]*?<\/style>/g, "");
  const labels = [...withoutStyle.matchAll(/\b(?:alt|aria-label|title)="([^"]*)"/g)].map((match) => decodeEntities(match[1]));

  return [textOf(withoutStyle), ...labels].join("\n");
}

describe.each(PAGES)("%s: %s", (locale, slug) => {
  test("says no em dash, leaves no {token} unfilled, and no lock screen is from Stampeo", async () => {
    const html = await renderPreviewPage(slug, locale);
    const { lockScreenAlt } = landingCopy(locale).previews.shared.PREVIEW_SHARED;
    const fromStampeo = lockScreenAlt.replace("{sender}", "Stampeo").replace("{message}", "");

    expect(readable(html)).not.toContain("—");
    expect(readable(html).match(/\{[^}\n]{1,40}\}/g)).toBeNull();
    expect(pictures(html).filter((name) => name.startsWith(fromStampeo))).toEqual([]);
  });

  test("shows no dollar: the sample money of the international pages is in euros", async () => {
    expect(readable(await renderPreviewPage(slug, locale))).not.toContain("$");
  });
});

describe("the pages with sample money show it in euros", () => {
  test.each(routing.locales)("%s: the scanner's points screen and the analytics' spend chart", async (locale) => {
    for (const slug of ["platform/mobile-scanner", "platform/analytics"] as const) {
      expect(readable(await renderPreviewPage(slug, locale))).toContain("€");
    }
  });
});

describe("the US homepage, the one page with a US version", () => {
  test("reads in dollars and punch cards, with no euro, no em dash and no {token} left", async () => {
    const text = readable(await renderPreviewPage("platform", "en", "us"));

    expect(text).toContain("$");
    expect(text).not.toContain("€");
    expect(text).not.toContain("—");
    expect(text.match(/\{[^}\n]{1,40}\}/g)).toBeNull();
    expect(text).toMatch(/punch card/i);
  });
});

describe("the campaigns page's one plan sentence", () => {
  test.each(routing.locales)("%s: 'see pricing' is a link in its answer, to the pricing page of that language", async (locale) => {
    const { faq } = landingCopy(locale).previews.promotionalCampaigns.PROMOTIONAL_CAMPAIGNS_PREVIEW;
    const answers = faq.items.filter((item) => item.answer.includes(faq.pricingLink));
    const links = [...(await sectionOf("platform/promotional-campaigns", "faq", locale)).matchAll(/<a [^>]*href="([^"]+)"[^>]*>([^<]*)<\/a>/g)].filter(
      ([, , words]) => decodeEntities(words) === faq.pricingLink,
    );

    expect(answers).toHaveLength(1);
    expect(links.map(([, href]) => href)).toEqual([localePath(locale, "/pricing")]);
  });
});
