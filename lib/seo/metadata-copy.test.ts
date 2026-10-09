import { describe, expect, test } from "bun:test";
import { routing } from "@/i18n/routing";
import { MARKETS, type Market } from "../markets";
import { planMessageArgs } from "../plans/plan-facts";
import { FALLBACK_PRICING, pricingMessageArgs } from "../pricing";
import { catalogFiles, catalogStrings, loadCatalog, strictTranslator } from "../testing/catalogs";

/**
 * Every page title and meta description, checked as a search result shows it.
 *
 * `app/[locale]/layout.tsx` sets `title.template: "%s | Stampeo"`. The homepage
 * sets no title of its own, so it renders `metadata.home.title` as written and
 * names the brand itself; every other page returns a plain string and gets the
 * suffix, so its string must not. Google shows about 60 characters of a title
 * and 160 of a description, and cuts the rest.
 */

const SUFFIX = " | Stampeo";
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/** The interpolated `{starterPrice}` and `{trialDays}` a market's page passes. */
function marketArgs(market: Market, locale: string) {
  const { currency, trialDays } = MARKETS[market];
  return pricingMessageArgs(FALLBACK_PRICING[currency.code.toLowerCase()], locale, trialDays);
}

/** "ok", or the offending text with its measure, so a failure names the string. */
const withinLimit = (text: string, measured: number, max: number) =>
  measured <= max ? "ok" : `${measured} > ${max}: ${text}`;

/** A shop name of ordinary length, for the merchant enrolment pages. */
const SHOP = { businessName: "Golden Hours" };

interface Page {
  path: string;
  title: string;
  description: string;
  /** "as-is" for the homepage, which carries the brand in its own string. */
  render: "as-is" | "suffixed";
  /** Market pages render in English only. */
  locales?: readonly string[];
  /** A merchant's name has no fixed length, so its title has none either. */
  nameInTitle?: boolean;
  args?: (locale: string) => Record<string, string | number>;
}

const FEATURE_SLUGS = Object.keys(
  (loadCatalog("en").metadata as { features: Record<string, unknown> }).features,
);

const PAGES: Page[] = [
  { path: "/", title: "metadata.home.title", description: "metadata.home.description", render: "as-is" },
  {
    path: "/pricing",
    title: "pricingPage.meta.title",
    description: "pricingPage.meta.description",
    render: "suffixed",
    args: (locale) => marketArgs("int", locale),
  },
  {
    path: "/us",
    title: "variant.us.meta.title",
    description: "variant.us.meta.description",
    render: "suffixed",
    locales: ["en"],
    args: () => marketArgs("us", "en"),
  },
  {
    path: "/us/pricing",
    title: "variant.us.pricingMeta.title",
    description: "variant.us.pricingMeta.description",
    render: "suffixed",
    locales: ["en"],
    args: () => marketArgs("us", "en"),
  },
  ...FEATURE_SLUGS.map(
    (slug): Page => ({
      path: `/features/${slug}`,
      title: `metadata.features.${slug}.title`,
      description: `metadata.features.${slug}.description`,
      render: "suffixed",
      args: () => planMessageArgs(),
    }),
  ),
  {
    path: "/loyalty-programs",
    title: "metadata.loyaltyPrograms.title",
    description: "metadata.loyaltyPrograms.description",
    render: "suffixed",
  },
  { path: "/contact", title: "metadata.contact.title", description: "metadata.contact.description", render: "suffixed" },
  { path: "/about", title: "about.title", description: "about.metaDescription", render: "suffixed" },
  { path: "/blog", title: "blog.metaTitle", description: "blog.description", render: "suffixed" },
  { path: "/changelog", title: "changelog.meta.title", description: "changelog.meta.description", render: "suffixed" },
  {
    path: "/onboarding",
    title: "metadata.onboarding.title",
    description: "metadata.onboarding.description",
    render: "suffixed",
  },
  {
    path: "/{slug}",
    title: "metadata.acquisition.title",
    description: "metadata.acquisition.defaultDesc",
    render: "suffixed",
    nameInTitle: true,
    args: () => SHOP,
  },
  {
    path: "/{slug} (unknown shop)",
    title: "metadata.acquisition.notFound",
    description: "metadata.acquisition.notFoundDesc",
    render: "suffixed",
  },
];

describe.each(routing.locales)("%s", (locale) => {
  const t = strictTranslator(locale, loadCatalog(locale));
  const pages = PAGES.filter((page) => !page.locales || page.locales.includes(locale));

  describe.each(pages.map((page) => [page.path, page] as const))("%s", (_path, page) => {
    const args = page.args?.(locale) ?? {};
    const title = t(page.title as never, args);
    const rendered = page.render === "as-is" ? title : `${title}${SUFFIX}`;
    const description = t(page.description as never, args);

    test("names Stampeo at most once in the title", () => {
      expect(withinLimit(rendered, rendered.match(/Stampeo/g)?.length ?? 0, 1)).toBe("ok");
    });

    test.skipIf(page.nameInTitle === true)(`title fits in ${TITLE_MAX} characters`, () => {
      expect(withinLimit(rendered, rendered.length, TITLE_MAX)).toBe("ok");
    });

    test(`description fits in ${DESCRIPTION_MAX} characters`, () => {
      expect(withinLimit(description, description.length, DESCRIPTION_MAX)).toBe("ok");
    });

    test("uses no em dash", () => {
      expect(`${title}\n${description}`).not.toContain("—");
    });
  });
});

/**
 * "Punch card" is the US search term for a stamp card. It is used on the `/us`
 * SEO surfaces only (both pages' metadata, one heading, one FAQ entry); the
 * product calls them stamps everywhere else.
 */
describe("punch card vocabulary", () => {
  const US_SEO_KEYS = new Set([
    "landing.json::variant.us.meta.title",
    "landing.json::variant.us.meta.description",
    "landing.json::variant.us.pricingMeta.title",
    "landing.json::variant.us.pricingMeta.description",
    "landing.json::variant.us.differentiator.title",
  ]);
  const FAQ_ENTRY = /^landing\.json::variant\.us\.faq\.items\[\d+\]\.(?:question|answer)$/;

  const found = routing.locales.flatMap((locale) =>
    catalogFiles(locale).flatMap((file) =>
      catalogStrings(loadCatalog(locale, file), `${locale}/${file}::`)
        .filter(({ text }) => /punch/i.test(text))
        .map(({ where }) => where),
    ),
  );

  test("appears only on the /us SEO surfaces", () => {
    const outside = found.filter((id) => {
      const [locale, rest] = id.split("/");
      return locale !== "en" || !(US_SEO_KEYS.has(rest) || FAQ_ENTRY.test(rest));
    });
    expect(outside).toEqual([]);
  });

  test("is used in every /us SEO surface, and in exactly one FAQ entry", () => {
    const english = found.filter((id) => id.startsWith("en/")).map((id) => id.slice(3));
    for (const key of US_SEO_KEYS) expect(english).toContain(key);
    const faqEntries = new Set(
      english.filter((id) => FAQ_ENTRY.test(id)).map((id) => id.replace(/\.(?:question|answer)$/, "")),
    );
    expect(faqEntries.size).toBe(1);
  });
});
