import { describe, expect, test } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { BrowserEscapeGuide } from "@/components/onboarding/steps/BrowserEscapeGuide";
import { catalogLocales, loadCatalog } from "@/lib/testing/catalogs";

function renderGuide(locale: string, provider: string): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider
      locale={locale}
      timeZone="UTC"
      messages={loadCatalog(locale)}
      onError={(error) => {
        throw error;
      }}
    >
      <BrowserEscapeGuide provider={provider} onClose={() => {}} onChooseEmail={() => {}} />
    </NextIntlClientProvider>,
  );
}

const textOf = (html: string) => html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const tokensOf = (html: string) => [...html.matchAll(/<strong[^>]*>(.*?)<\/strong>/g)].map((m) => m[1]);

describe("a visitor stuck in the in-app browser sees the guide in their own language", () => {
  const cases = catalogLocales().flatMap((locale) =>
    ["Google", "Apple"].map((provider) => [locale, provider] as const),
  );

  test.each(cases)("%s / %s", (locale, provider) => {
    const html = renderGuide(locale, provider);

    // A dialog named by its own heading, so a screen reader announces what it is for.
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    const labelledBy = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(labelledBy).toBeTruthy();
    const heading = html.match(new RegExp(`<h2[^>]*id="${labelledBy}"[^>]*>(.*?)</h2>`));
    expect(heading?.[1]).toContain(provider);

    // Two numbered steps; the app's ••• and the menu entry stand out as tokens.
    const steps = [...html.matchAll(/<li[^>]*>(.*?)<\/li>/g)].map((m) => m[1]);
    expect(steps).toHaveLength(2);
    expect(tokensOf(steps[0])).toEqual(["•••"]);
    expect(tokensOf(steps[1])).toHaveLength(1);

    // Both ways out are labelled: the close control and the email route.
    expect(html).toMatch(/<button[^>]*aria-label="[^"]+"/);
    expect((html.match(/<button/g) ?? []).length).toBe(2);

    // Nothing is left half-rendered: no raw placeholder, tag or key path.
    const text = textOf(html);
    expect(text).not.toMatch(/[{}<>]|onboarding\.createAccount/);
  });

  test("English names the menu entry exactly as Instagram and Messenger show it", () => {
    const html = renderGuide("en", "Google");
    expect(tokensOf(html)).toContain("Open in external browser");
  });
});
