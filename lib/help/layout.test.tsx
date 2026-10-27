/**
 * The pieces around an article's body: badges, breadcrumb, Related and
 * "Still stuck?", rendered in English like the live page.
 */

import { describe, expect, test } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HelpBadges } from "@/components/help/HelpBadges";
import { HelpBreadcrumb } from "@/components/help/HelpBreadcrumb";
import { RelatedPages } from "@/components/help/RelatedPages";
import { StillStuck } from "@/components/help/StillStuck";
import { loadCatalog } from "@/lib/testing/catalogs";

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

describe("the badges under the title", () => {
  test("a how-to shows who can do it in one pill, and the plans only when it is gated", () => {
    const text = textOf(render(<HelpBadges type="how-to" audience={["owner", "admin"]} plans={["growth", "pro"]} />));

    expect(text).toContain("Owner and Admin");
    expect(text).toContain("Growth and Pro");
  });

  test("a Pro-only page says Pro", () => {
    const text = textOf(render(<HelpBadges type="how-to" audience={["owner"]} plans={["pro"]} />));

    expect(text).toContain("Owner");
    expect(text).toContain("Pro");
    expect(text).not.toContain("Growth");
  });

  test("a page on every plan has no plan pill, and never a pill that names Growth alone", () => {
    const html = render(<HelpBadges type="how-to" audience={["owner", "admin", "scanner"]} />);
    const text = textOf(html);

    expect(text).toContain("Owner, Admin, and Scanner");
    expect(text).not.toMatch(/Growth|Starter|Pro/);
  });

  test.each(["concept", "troubleshooting", "reference", "share", "guide"] as const)(
    "a %s page has no badges at all",
    (type) => {
      expect(render(<HelpBadges type={type} audience={["owner"]} plans={["pro"]} />)).toBe("");
    }
  );
});

describe("the breadcrumb", () => {
  test("leads back to the help home, and names the category without linking it yet", () => {
    const html = render(<HelpBreadcrumb categoryName="Your team" />);

    expect(html).toContain('<a href="/help"');
    expect(html).toContain(">Help</a>");
    expect(textOf(html)).toContain("Your team");
    expect(html).not.toMatch(/<a [^>]*>Your team/);
  });
});

describe("Related", () => {
  test("lists the related pages by title, in the order given", () => {
    const html = render(
      <RelatedPages
        pages={[
          { slug: "manage-a-team-member", title: "Manage a team member" },
          { slug: "roles", title: "Roles and what each one can do" },
        ]}
      />
    );

    expect(html.indexOf("Manage a team member")).toBeLessThan(html.indexOf("Roles and what each one"));
    expect(html).toContain('href="/help/manage-a-team-member"');
    expect(html).toContain('href="/help/roles"');
  });

  test("a page with nothing related renders no section", () => {
    expect(render(<RelatedPages pages={[]} />)).toBe("");
  });
});

describe("Still stuck?", () => {
  test("offers email, WhatsApp and the phone, as links that open the right app", () => {
    const html = render(<StillStuck />);

    expect(textOf(html)).toContain("Still stuck?");
    expect(html).toContain('href="mailto:support@stampeo.app"');
    expect(html).toContain('href="https://wa.me/33649370470"');
    expect(html).toContain('href="tel:+33649370470"');
    expect(textOf(html)).toContain("+33 6 49 37 04 70");
    expect(textOf(html)).toContain("support@stampeo.app");
  });
});
