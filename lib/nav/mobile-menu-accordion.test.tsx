/** Today's phone menu, open: what the accordion panel prints, against what the header printed before the sheet menu existed. */

import { describe, expect, test } from "bun:test";
import { AccordionMenu } from "@/components/sections/MobileMenuAccordion";
import { renderEn, textOf } from "../testing/render-en";
import { renderAtPath } from "../testing/pathname-seam";
import { phoneMenuProps } from "../testing/phone-menu-props";

/** The panel under the bar: from its opening `<div>` to the bar's end. */
const panelOf = (html: string) => {
  const end = html.indexOf("</header>");

  return html.slice(html.indexOf('<div class="lg:hidden overflow-hidden'), end === -1 ? html.length : end).replace(/<\/div>$/, "");
};

const open = (market: "int" | "us", featureLinks: "live" | "previews", pathname: string, overrides = {}) =>
  renderAtPath(pathname, () =>
    renderEn(
      <AccordionMenu {...phoneMenuProps(market, featureLinks, pathname, overrides)}>
        <span>bar</span>
      </AccordionMenu>,
    ),
  );

describe("today's phone menu, open", () => {
  test("the panel of the open menu is the one the header drew before the sheet menu existed, signed out", () => {
    expect(panelOf(open("int", "live", "/features/analytics"))).toMatchSnapshot();
  });

  test("and the one that links to the previews", () => {
    expect(panelOf(open("us", "previews", "/us/landing-pages/platform"))).toMatchSnapshot();
  });

  test("signed in, the panel offers Sign out and the Dashboard where Log in and Get started were", () => {
    const text = textOf(panelOf(open("int", "live", "/", { signedIn: true })));

    expect(text).toContain("Sign out");
    expect(text).toContain("Dashboard");
    expect(text).not.toMatch(/Log in|Get started/);
  });

  test("the entry for the page you are on is the orange one", () => {
    const html = panelOf(open("int", "live", "/loyalty-programs"));

    expect(html).toMatch(/class="px-4 py-3 text-sm font-semibold rounded-xl transition-colors text-\[var\(--accent\)\] bg-\[var\(--accent\)\]\/5" href="\/en\/loyalty-programs"/);
  });
});
