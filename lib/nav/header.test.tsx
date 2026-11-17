/**
 * The header as a visitor's browser first receives it, with the phone menu closed, and the bar each phone menu
 * draws when it is open. The menus themselves are in `mobile-menu-render.test.tsx` and `mobile-menu-accordion.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { Header } from "@/components/sections/Header";
import { SheetMenu } from "@/components/sections/SheetMenu";
import { AccordionMenu } from "@/components/sections/MobileMenuAccordion";
import { renderEn } from "../testing/render-en";
import { trackedBy } from "../testing/cta-recorder";
import { renderAtPath } from "../testing/pathname-seam";
import { phoneMenuProps } from "../testing/phone-menu-props";

const render = (node: ReactElement, pathname = "/en") => renderAtPath(pathname, () => renderEn(node));

/** The phone menu's button: the one `<button>` that names itself Open or Close menu. */
const burgerOf = (html: string) => /<button\b[^>]*aria-label="(?:Open|Close) menu"[^>]*>[\s\S]*?<\/button>/.exec(html)?.[0] ?? "";

/** The class of the bar: the first `<div>` of the header, which holds the nav. */
const barClass = (html: string) => /<header[^>]*>(?:<div[^>]*><\/div>)?<div class="([^"]*)"/.exec(html)?.[1] ?? "";

describe("the header with its phone menu closed", () => {
  test("a header asked for nothing renders as it did before the sheet menu existed, byte for byte", () => {
    expect(render(<Header />)).toMatchSnapshot();
  });

  test("a US page's header keeps the visitor in the US market for pricing, and leads to the live pages for the rest", () => {
    const hrefs = [...render(<Header market="us" />, "/en/us").matchAll(/<a [^>]*href="([^"]+)"/g)].map((match) => match[1]);

    expect(hrefs).toContain("/us/pricing");
    expect(hrefs).toContain("/en/loyalty-programs");
    expect(hrefs.filter((href) => href.includes("landing-pages"))).toEqual([]);
  });
});

describe("the phone menu a header draws", () => {
  const accordion = render(<Header />);
  const sheet = render(<Header mobileMenu="sheet" />);

  test("by default the bar's button opens the accordion: a plain burger that controls nothing by id", () => {
    const burger = burgerOf(accordion);

    expect(burger).toContain('aria-expanded="false"');
    expect(burger).toContain("Open menu");
    expect(burger).not.toContain("aria-controls");
  });

  test("asked for the sheet, the button is the 44px burger that controls the menu it opens", () => {
    const burger = burgerOf(sheet);

    expect(burger).toContain('aria-controls="mobile-menu"');
    expect(burger).toContain('aria-expanded="false"');
    expect(burger).toMatch(/\bh-11 w-11\b/);
  });

  test("closed, the two bars are the same page header: only the button differs, and neither carries a marker", () => {
    expect(sheet.replace(burgerOf(sheet), "")).toBe(accordion.replace(burgerOf(accordion), ""));
    expect(accordion).not.toContain("data-mobile-menu");
    expect(sheet).not.toContain("data-mobile-menu");
  });
});

describe("the bar when its phone menu is open", () => {
  const props = phoneMenuProps("us", "/us");
  const open = (Menu: typeof SheetMenu | typeof AccordionMenu, overrides = {}) =>
    render(
      <header>
        <Menu {...props} {...overrides}>
          <span>bar</span>
        </Menu>
      </header>,
    );

  test("with the sheet it turns solid cream on a phone and shows the X, so the layer under it reads as one", () => {
    const html = open(SheetMenu);

    expect(barClass(html)).toContain("max-lg:bg-[var(--cream)]");
    expect(barClass(html)).toContain("max-lg:border-[var(--border)]");
    expect(burgerOf(html)).toContain('aria-expanded="true"');
    expect(burgerOf(html)).toContain("Close menu");
  });

  test("with the accordion the bar keeps its own look, and the panel hangs under it", () => {
    const html = open(AccordionMenu);

    expect(barClass(html)).not.toContain("max-lg:");
    expect(burgerOf(html)).toContain("Close menu");
    expect(html).toContain("lg:hidden overflow-hidden border-t");
  });

  test.each([SheetMenu, AccordionMenu])("a closed menu is the bar and its button alone", (Menu) => {
    const html = open(Menu, { open: false });

    expect(burgerOf(html)).toContain("Open menu");
    expect(html).not.toContain("overflow-hidden border-t");
    expect(barClass(html)).not.toContain("max-lg:");
  });

  test("scrolled, the bar is frosted cream with either menu", () => {
    for (const Menu of [SheetMenu, AccordionMenu]) expect(barClass(open(Menu, { open: false, scrolled: true }))).toContain("backdrop-blur-md");
  });
});

describe("the sign-up buttons of the header report their clicks", () => {
  const props = phoneMenuProps("us", "/us");

  test("the desktop bar's Get started is tracked as the header's", () => {
    expect(trackedBy(() => render(<Header />))).toContainEqual({ trackAs: "header", href: "/onboarding" });
  });

  test("today's open accordion has one more, the phone's Get started, tracked as the phone header's", () => {
    const buttons = trackedBy(() =>
      render(
        <AccordionMenu {...props}>
          <span>bar</span>
        </AccordionMenu>,
      ),
    );

    expect(buttons).toEqual([{ trackAs: "header_mobile", href: "/onboarding" }]);
  });

  test("the sheet's Get started is in the menu chunk, which the server does not draw: its tracking is pinned in mobile-menu-render.test.tsx", () => {
    const buttons = trackedBy(() =>
      render(
        <SheetMenu {...props}>
          <span>bar</span>
        </SheetMenu>,
      ),
    );

    expect(buttons).toEqual([]);
  });
});
