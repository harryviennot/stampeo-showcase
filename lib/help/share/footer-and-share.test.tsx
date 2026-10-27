/**
 * The slim footer under every help page, and the light layout of a page an
 * owner sends. The privacy policy puts the cookie control wherever a cookie can
 * be set, so both must carry it.
 */

import { describe, expect, test } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HelpFooter } from "@/components/help/HelpFooter";
import { ShareLayout } from "@/components/help/ShareLayout";
import { loadCatalog } from "@/lib/testing/catalogs";
import type { HelpPage } from "../types";

const render = (element: ReactElement) =>
  renderToStaticMarkup(
    <NextIntlClientProvider
      locale="en"
      timeZone="UTC"
      messages={loadCatalog("en")}
      onError={(error) => {
        throw error;
      }}
    >
      {element}
    </NextIntlClientProvider>
  );

const textOf = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

describe("the footer of a help page", () => {
  const html = render(<HelpFooter />);

  test("holds the cookie-preferences control and the privacy link", () => {
    expect(textOf(html)).toContain("Cookie preferences");
    expect(html).toContain('<button type="button"');
    expect(html).toMatch(/<a [^>]*href="\/en\/privacy"/);
  });

  test("leads back into the site, in English, so help is not a dead end", () => {
    expect(html).toContain('href="/en/pricing"');
    expect(html).toContain('href="/en#features"');
    expect(html).toContain('href="/en/contact"');
    expect(html).toContain('href="/en/terms"');
    expect(html).toContain('href="/help"');
  });

  test("is not the site's full footer: no newsletter form, no store badges", () => {
    expect(html).not.toContain("<form");
    expect(html).not.toContain("App Store");
  });
});

describe("a page an owner sends to someone else", () => {
  const page = {
    slug: "get-the-loyalty-card",
    category: "for-your-customers",
    title: "Add the loyalty card to your phone",
    type: "share",
    audience: ["customer"],
  } as HelpPage;

  const html = render(
    <ShareLayout page={page}>
      <ol>
        <li>Scan the QR code at the counter.</li>
        <li>Fill in the form.</li>
      </ol>
    </ShareLayout>
  );

  test("has a bar with a Share button, and the steps under the title", () => {
    const text = textOf(html);

    expect(text).toContain("Stampeo");
    expect(text).toContain("Share");
    expect(text).toContain("Add the loyalty card to your phone");
    expect(html).toContain("help-share");
    expect(text).toContain("Scan the QR code at the counter.");
  });

  test("leaves the bar and the footer off a printed copy", () => {
    expect(html).toMatch(/class="[^"]*print:hidden[^"]*"[^>]*>(?:(?!<main).)*Share/s);
    expect(html).toMatch(/<footer class="[^"]*print:hidden/);
  });

  test("has no way out of the shop's page: the logo is not a link, and the footer is the slim one", () => {
    const bar = html.slice(0, html.indexOf("<main"));

    expect(bar).not.toContain("<a ");
    expect(html).not.toContain('href="/en/pricing"');
  });

  test("keeps the cookie-preferences control and the privacy link", () => {
    expect(textOf(html)).toContain("Cookie preferences");
    expect(html).toMatch(/<a [^>]*href="\/en\/privacy"/);
  });

  test("sends a reader who is stuck back to the shop, not to our support", () => {
    expect(textOf(html)).toContain("Still stuck? Ask at the shop");
    expect(html).not.toContain("mailto:");
    expect(html).not.toContain("wa.me");
  });
});
