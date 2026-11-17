/** Today's phone menu, open: what the accordion panel prints, against what the header printed before the sheet menu existed. */

import { describe, expect, test } from "bun:test";
import { AccordionFeatureRows, AccordionMenu } from "@/components/sections/MobileMenuAccordion";
import { routing } from "@/i18n/routing";
import { FEATURE_ITEMS } from "../features";
import { getLocalizedSlug } from "../feature-slugs";
import { renderIn } from "../testing/render-en";
import { renderEn, textOf } from "../testing/render-en";
import { renderAtPath } from "../testing/pathname-seam";
import { phoneMenuProps } from "../testing/phone-menu-props";

/** The panel under the bar: from its opening `<div>` to the bar's end. */
const panelOf = (html: string) => {
  const end = html.indexOf("</header>");

  return html.slice(html.indexOf('<div class="lg:hidden overflow-hidden'), end === -1 ? html.length : end).replace(/<\/div>$/, "");
};

const open = (market: "int" | "us", pathname: string, overrides = {}) =>
  renderAtPath(pathname, () =>
    renderEn(
      <AccordionMenu {...phoneMenuProps(market, pathname, overrides)}>
        <span>bar</span>
      </AccordionMenu>,
    ),
  );

describe("today's phone menu, open", () => {
  test("the panel of the open menu is the one the header drew before the sheet menu existed, signed out", () => {
    expect(panelOf(open("int", "/features/analytics"))).toMatchSnapshot();
  });

  test("a US page's panel links to the US pricing and, as every page does, to the loyalty programs page", () => {
    const hrefs = [...panelOf(open("us", "/us")).matchAll(/href="([^"]+)"/g)].map((match) => match[1]);

    expect(hrefs).toContain("/us/pricing");
    expect(hrefs).toContain("/en/loyalty-programs");
    expect(hrefs.filter((href) => href.includes("landing-pages"))).toEqual([]);
  });

  test("signed in, the panel offers Sign out and the Dashboard where Log in and Get started were", () => {
    const text = textOf(panelOf(open("int", "/", { signedIn: true })));

    expect(text).toContain("Sign out");
    expect(text).toContain("Dashboard");
    expect(text).not.toMatch(/Log in|Get started/);
  });

  test("the entry for the page you are on is the orange one", () => {
    const html = panelOf(open("int", "/loyalty-programs"));

    expect(html).toMatch(/class="px-4 py-3 text-sm font-semibold rounded-xl transition-colors text-\[var\(--accent\)\] bg-\[var\(--accent\)\]\/5" href="\/en\/loyalty-programs"/);
  });
});

describe("the Product row's features, once opened", () => {
  test.each(routing.locales)("%s: six links to the feature pages in that language, Geolocation's alone marked Soon", (locale) => {
    const html = renderIn(locale, <AccordionFeatureRows onNavigate={() => {}} />);
    const links = [...html.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(([, href, inner]) => ({ href, soon: inner.includes("rounded-full px-2 py-0.5") }));
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;

    expect(links.map(({ href }) => href)).toEqual(FEATURE_ITEMS.map(({ canonicalSlug }) => `${prefix}/features/${getLocalizedSlug(canonicalSlug, locale)}`));
    expect(links.filter(({ soon }) => soon).map(({ href }) => href)).toEqual([`${prefix}/features/${getLocalizedSlug("geolocalisation", locale)}`]);
  });
});
