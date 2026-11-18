/**
 * The header as a visitor's browser first receives it, with the phone menu closed, and the bar the sheet menu
 * draws when it is open. The sheet itself is in `mobile-menu-render.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import type { ReactElement } from "react";
import { Header } from "@/components/sections/Header";
import { SheetMenu } from "@/components/sections/SheetMenu";
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
  test("a header asked for nothing is the bar with the sheet menu's button", () => {
    expect(render(<Header />)).toMatchSnapshot();
  });

  test("a US page's header keeps the visitor in the US market for pricing, and leads to the live pages for the rest", () => {
    const hrefs = [...render(<Header market="us" />, "/en/us").matchAll(/<a [^>]*href="([^"]+)"/g)].map((match) => match[1]);

    expect(hrefs).toContain("/us/pricing");
    expect(hrefs).toContain("/en/loyalty-programs");
    expect(hrefs.filter((href) => href.includes("landing-pages"))).toEqual([]);
  });
});

describe("the phone menu every page's header draws", () => {
  const MOUNTS: Array<[page: string, header: () => ReactElement, pathname: string]> = [
    ["a page that mounts the header with nothing, as the changelog and the blog do", () => <Header />, "/en/changelog"],
    ["a US page", () => <Header market="us" />, "/en/us"],
    ["a UK page", () => <Header market="uk" />, "/en/uk"],
  ];

  test.each(MOUNTS)("%s: the bar's button is the 44px burger that controls the sheet it opens", (_page, header, pathname) => {
    const burger = burgerOf(render(header(), pathname));

    expect(burger).toContain('aria-controls="mobile-menu"');
    expect(burger).toContain('aria-expanded="false"');
    expect(burger).toContain("Open menu");
    expect(burger).toMatch(/\bh-11 w-11\b/);
  });

  test("the bar carries no plain burger and no marker of a menu choice", () => {
    const html = render(<Header />);

    expect(html).not.toContain("lg:hidden p-2");
    expect(html).not.toContain("data-mobile-menu");
  });
});

describe("the bar when the sheet is open", () => {
  const props = phoneMenuProps("us", "/us");
  const open = (overrides = {}) =>
    render(
      <header>
        <SheetMenu {...props} {...overrides}>
          <span>bar</span>
        </SheetMenu>
      </header>,
    );

  test("it turns solid cream on a phone and shows the X, so the layer under it reads as one", () => {
    const html = open();

    expect(barClass(html)).toContain("max-lg:bg-[var(--cream)]");
    expect(barClass(html)).toContain("max-lg:border-[var(--border)]");
    expect(burgerOf(html)).toContain('aria-expanded="true"');
    expect(burgerOf(html)).toContain("Close menu");
  });

  test("a closed menu is the bar and its button alone", () => {
    const html = open({ open: false });

    expect(burgerOf(html)).toContain("Open menu");
    expect(barClass(html)).not.toContain("max-lg:");
  });

  test("scrolled, the bar is frosted cream", () => {
    expect(barClass(open({ open: false, scrolled: true }))).toContain("backdrop-blur-md");
  });
});

describe("the sign-up buttons of the header report their clicks", () => {
  const props = phoneMenuProps("us", "/us");

  test("the desktop bar's Get started is tracked as the header's", () => {
    expect(trackedBy(() => render(<Header />))).toContainEqual({ trackAs: "header", href: "/onboarding" });
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
