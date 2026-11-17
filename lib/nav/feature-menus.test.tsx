/**
 * Where the header's Product menu and the footer's features column lead, and what they say about geolocation, which
 * is not live yet: on Platform and its previews they lead to the previews and print Soon beside it; everywhere else
 * they are today's menus.
 */

import { describe, expect, test } from "bun:test";
import { createTranslator } from "next-intl";
import { NavDropdownPanel } from "@/components/sections/NavDropdown";
import { ALL_LANDING_SLUGS, LANDING_SLUGS } from "../landing-pages/pages";
import { featureLinksFor, showsSoon } from "../landing-pages/preview-nav";
import { FEATURE_ITEMS } from "../features";
import { loadCatalog } from "../testing/catalogs";
import { renderAtPathAsync } from "../testing/pathname-seam";
import { renderEn, renderEnAsync, textOf } from "../testing/render-en";
import { mockEnglishServerTranslations } from "../testing/server-intl";
import { productMenuItems } from "./menu-items";

const t = createTranslator({ locale: "en", messages: loadCatalog("en") }) as (key: string) => string;

/** A menu's links as `[label text, href]`, so a label's own Soon plate is part of its text. */
const links = (html: string) => [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, inner]) => [textOf(inner).replace(/\|/g, " ").trim(), href]);

describe("which feature says Soon", () => {
  test("only geolocation, and only in the menus that lead to the previews", () => {
    for (const { canonicalSlug } of FEATURE_ITEMS) {
      expect({ canonicalSlug, previews: showsSoon(canonicalSlug, "previews") }).toEqual({ canonicalSlug, previews: canonicalSlug === "geolocalisation" });
      expect(showsSoon(canonicalSlug, "live")).toBe(false);
    }
  });
});

describe("the desktop Product dropdown", () => {
  const open = (featureLinks: "live" | "previews") => renderEn(<NavDropdownPanel items={productMenuItems(t, "en", featureLinks, "us")} onNavigate={() => {}} />);

  test("on Platform and its previews Geolocation wears Soon, and no other feature does", () => {
    const entries = links(open("previews"));

    expect(entries.filter(([label]) => /Soon/.test(label)).map(([label]) => label)).toEqual(["Geolocation Soon"]);
    expect(entries).toHaveLength(6);
    expect(entries.find(([label]) => /Geolocation/.test(label))?.[1]).toBe("/us/landing-pages/platform/geolocation");
  });

  test("everywhere else the dropdown is today's: six links to the feature pages and no Soon", () => {
    const html = open("live");

    expect(textOf(html)).not.toContain("Soon");
    expect(links(html).map(([, href]) => href).every((href) => href.startsWith("/en/features/"))).toBe(true);
    expect(links(html).map(([label]) => label)).toEqual(["Push Notifications", "Promotional Campaigns", "Geolocation", "Mobile Scanner", "Analytics", "Card Design"]);
  });
});

describe("the shell of a US landing page: its header and footer", () => {
  const shell = async (slug: (typeof ALL_LANDING_SLUGS)[number], market: "us" | "int" = "us") => {
    await mockEnglishServerTranslations();
    const { LandingPageShell } = await import("@/components/landing-pages/shared/LandingPageShell");

    return renderAtPathAsync(market === "us" ? `/en/us/landing-pages/${slug}` : `/en/landing-pages/${slug}`, () =>
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
    expect(await shell(slug)).toMatch(/<button\b[^>]*aria-controls="mobile-menu"/);
  });

  test.each(["platform", "platform/geolocation"] as const)("%s: the footer's features lead to the previews, with Soon beside Geolocation alone", async (slug) => {
    const features = footerFeatures(await shell(slug));

    expect(features).toHaveLength(6);
    expect(features.every(([, href]) => href.startsWith("/us/landing-pages/platform/"))).toBe(true);
    expect(features.filter(([label]) => /Soon/.test(label)).map(([label]) => label)).toEqual(["Geolocation Soon"]);
  });

  test.each(["platform", "platform/geolocation"] as const)("%s on the international site: the footer's features lead to the previews of the visitor's language", async (slug) => {
    const features = footerFeatures(await shell(slug, "int"));

    expect(features).toHaveLength(6);
    expect(features.every(([, href]) => href.startsWith("/en/landing-pages/platform/"))).toBe(true);
    expect(features.filter(([label]) => /Soon/.test(label)).map(([label]) => label)).toEqual(["Geolocation Soon"]);
  });

  test.each(LANDING_SLUGS.filter((slug) => featureLinksFor(slug) === "live"))("%s: the footer's features are today's pages, with no Soon", async (slug) => {
    const html = await shell(slug);
    const features = footerFeatures(html);

    expect(features).toHaveLength(6);
    expect(features.every(([, href]) => href.startsWith("/en/features/"))).toBe(true);
    expect(textOf(html.slice(html.indexOf("<footer")))).not.toContain("Soon");
  });

  test("a page that is none of these keeps the footer exactly as it was: no Soon, today's feature pages", async () => {
    await mockEnglishServerTranslations();
    const { Footer } = await import("@/components/sections/Footer");
    const html = await renderEnAsync(await Footer({}));

    expect(footerFeatures(html)).toHaveLength(6);
    expect(textOf(html)).not.toContain("Soon");
  });
});
