/**
 * Where the header's Product menu and the footer's features column lead, and what they say about geolocation, which
 * is not live yet: on every page they lead to the live feature pages in the visitor's language and print Soon beside
 * geolocation alone. The phone menu has its own tests (`mobile-menu-render.test.tsx`).
 */

import { describe, expect, test } from "bun:test";
import { createTranslator } from "next-intl";
import { NavDropdownPanel } from "@/components/sections/NavDropdown";
import { routing } from "@/i18n/routing";
import { ALL_LANDING_SLUGS } from "../landing-pages/pages";
import { isComingSoon } from "../landing-pages/preview-nav";
import { getLocalizedSlug } from "../feature-slugs";
import { FEATURE_ITEMS } from "../features";
import { loadCatalog } from "../testing/catalogs";
import { renderAtPathAsync } from "../testing/pathname-seam";
import { renderEn, renderEnAsync, textOf } from "../testing/render-en";
import { mockEnglishServerTranslations } from "../testing/server-intl";
import { productMenuItems } from "./menu-items";

const t = createTranslator({ locale: "en", messages: loadCatalog("en") }) as (key: string) => string;

/** A menu's links as `[label text, href]`, so a label's own Soon plate is part of its text. */
const links = (html: string) => [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, inner]) => [textOf(inner).replace(/\|/g, " ").trim(), href]);

/** The six live feature pages in English, in the menu's order. */
const FEATURE_PAGES = FEATURE_ITEMS.map(({ canonicalSlug }) => `/en/features/${getLocalizedSlug(canonicalSlug, "en")}`);

describe("which feature says Soon", () => {
  test("geolocation, and no other", () => {
    expect(FEATURE_ITEMS.filter(({ canonicalSlug }) => isComingSoon(canonicalSlug)).map(({ canonicalSlug }) => canonicalSlug)).toEqual(["geolocalisation"]);
  });
});

describe("the desktop Product dropdown", () => {
  test.each(routing.locales)("%s: six links to the feature pages of that language, with Soon on the one that is coming", (locale) => {
    const html = renderEn(<NavDropdownPanel items={productMenuItems(t, locale)} onNavigate={() => {}} />);
    const entries = links(html);

    expect(entries).toHaveLength(6);
    expect(entries.filter(([label]) => /Soon/.test(label))).toHaveLength(1);
    expect(entries.find(([label]) => /Soon/.test(label))?.[1]).toContain(getLocalizedSlug("geolocalisation", locale));
  });

  test("in English: Geolocation wears Soon and no other feature does, and every link is a live page", () => {
    const entries = links(renderEn(<NavDropdownPanel items={productMenuItems(t, "en")} onNavigate={() => {}} />));

    expect(entries.map(([label]) => label)).toEqual(["Push Notifications", "Promotional Campaigns", "Geolocation Soon", "Mobile Scanner", "Analytics", "Card Design"]);
    expect(entries.map(([, href]) => href)).toEqual(FEATURE_PAGES);
  });
});

describe("the header and footer of a Platform-style page", () => {
  const shell = async (slug: (typeof ALL_LANDING_SLUGS)[number], market: "us" | "int" | "uk") => {
    await mockEnglishServerTranslations();
    const { LandingPageShell } = await import("@/components/landing-pages/shared/LandingPageShell");

    return renderAtPathAsync(market === "us" ? "/en/us" : "/en", () =>
      renderEnAsync(
        <LandingPageShell slug={slug} market={market}>
          <i>page</i>
        </LandingPageShell>,
      ),
    );
  };
  /** The footer's features column: its first link column (the sitemap list for crawlers repeats the links after it). */
  const footerFeatures = (html: string) => links(/<nav aria-label="[^"]*"[^>]*>[\s\S]*?<\/nav>/.exec(html.slice(html.indexOf("<footer")))?.[0] ?? "");

  test.each(ALL_LANDING_SLUGS)("%s: its phone menu is the sheet", async (slug) => {
    expect(await shell(slug, "int")).toMatch(/<button\b[^>]*aria-controls="mobile-menu"/);
  });

  test.each([
    ["platform", "us"],
    ["platform", "int"],
    ["platform", "uk"],
    ["platform/geolocation", "int"],
  ] as const)("%s (%s): the footer's features lead to the live pages, with Soon beside Geolocation alone", async (slug, market) => {
    const features = footerFeatures(await shell(slug, market));

    expect(features).toHaveLength(6);
    expect(features.map(([, href]) => href).sort()).toEqual([...FEATURE_PAGES].sort());
    expect(features.filter(([label]) => /Soon/.test(label)).map(([label]) => label)).toEqual(["Geolocation Soon"]);
  });
});

describe("the footer of a page with no shell of its own", () => {
  test("leads to the same live pages, with the same Soon", async () => {
    await mockEnglishServerTranslations();
    const { Footer } = await import("@/components/sections/Footer");
    const html = await renderEnAsync(await Footer({}));
    const features = links(/<nav aria-label="[^"]*"[^>]*>[\s\S]*?<\/nav>/.exec(html.slice(html.indexOf("<footer")))?.[0] ?? "");

    expect(features.map(([, href]) => href).sort()).toEqual([...FEATURE_PAGES].sort());
    expect(features.filter(([label]) => /Soon/.test(label)).map(([label]) => label)).toEqual(["Geolocation Soon"]);
  });
});
