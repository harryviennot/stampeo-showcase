import { describe, expect, it } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { BroadcastsPage } from "@/components/features/broadcasts/BroadcastsPage";
import { routing } from "@/i18n/routing";
import { loadCatalog } from "../testing/catalogs";

/** The broadcasts feature page as a visitor in the given language is served it. */
function render(locale: string): string {
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={loadCatalog(locale)} timeZone="UTC">
      <BroadcastsPage />
    </NextIntlClientProvider>,
  );
}

/** The plan pills of the hero, in the order they are drawn. */
function heroPills(html: string): string[] {
  const hero = html.slice(0, html.indexOf("</section>"));
  return [...hero.matchAll(/<span class="[^"]*rounded-full[^"]*uppercase[^"]*">([^<]*)<\/span>/g)].map(
    (match) => match[1],
  );
}

describe("the broadcasts feature page hero", () => {
  it.each(routing.locales)("%s: shows a Starter pill before the Growth and Pro pills", (locale) => {
    expect(heroPills(render(locale))).toEqual(["Starter", "Growth", "Pro"]);
  });
});
