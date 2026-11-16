import { expect } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToReadableStream, renderToStaticMarkup } from "react-dom/server";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { MARKETS } from "../markets";
import { FALLBACK_PRICING } from "../pricing";
import { loadCatalog } from "./catalogs";

const CATALOGS = new Map<string, Record<string, unknown>>();

const catalog = (locale: string) => {
  if (!CATALOGS.has(locale)) CATALOGS.set(locale, loadCatalog(locale));
  return CATALOGS.get(locale);
};

/** `node` under the locale's catalogs, and under the US dollars and trial length when `us`. */
function inProviders(locale: string, node: ReactNode, us: boolean) {
  return (
    <NextIntlClientProvider
      locale={locale}
      timeZone="UTC"
      messages={catalog(locale)}
      onError={(error) => {
        throw error;
      }}
    >
      {us ? (
        <RegionPricingProvider
          ladders={{ eur: FALLBACK_PRICING.eur, usd: FALLBACK_PRICING.usd }}
          defaultCurrency="usd"
          defaultTrialDays={MARKETS.us.trialDays}
        >
          {node}
        </RegionPricingProvider>
      ) : (
        node
      )}
    </NextIntlClientProvider>
  );
}

/**
 * Server-renders `node` under the English catalogs, as a page does; a missing
 * message throws. `us` adds the US dollars and trial length, for what prints
 * through `RegionText`.
 */
export function renderEn(node: ReactNode, { us = false }: { us?: boolean } = {}): string {
  return renderIn("en", node, { us });
}

/** `renderEn` under another locale's catalogs, as that locale's page renders `node`. */
export function renderIn(locale: string, node: ReactNode, { us = false }: { us?: boolean } = {}): string {
  return renderToStaticMarkup(inProviders(locale, node, us));
}

/**
 * The markup a visitor's browser receives for a tree that holds async server
 * components (call `mockEnglishServerTranslations()` first): every piece
 * resolved, the US dollars and trial in place, React's text separators removed.
 */
export async function renderEnAsync(node: ReactNode): Promise<string> {
  const stream = await renderToReadableStream(inProviders("en", node, true));

  await stream.allReady;
  return (await new Response(stream).text()).replace(/<!--[\s\S]*?-->/g, "");
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&#x27;": "'", "&quot;": '"', "&lt;": "<", "&gt;": ">" };

/** Markup's entities read back as the characters a visitor sees. */
export const decodeEntities = (markup: string) => markup.replace(/&(?:amp|#x27|quot|lt|gt);/g, (entity) => ENTITIES[entity]);

/** The text of rendered markup: tags become a bar, so adjacent elements never fuse into one word, and entities are read back. */
export const textOf = (html: string) => decodeEntities(html.replace(/<[^>]*>/g, "|").replace(/\|+/g, "|"));

/** The lines are all in the text of `markup`, each one after the one before it. */
export function expectInOrder(markup: string, lines: readonly string[]) {
  const text = textOf(markup);
  let from = 0;

  for (const line of lines) {
    const at = text.indexOf(line, from);

    expect({ line, found: at > -1 }).toEqual({ line, found: true });
    from = at + line.length;
  }
}

/** The accessible names of the pictures in a render: a `role="img"` box, an `<img>` or a `<video>`. */
export function pictures(markup: string): string[] {
  return [...markup.matchAll(/<([a-z]+)\b([^>]*)>/g)].flatMap(([, tag, attrs]) => {
    const name = /\b(?:aria-label|alt)="([^"]+)"/.exec(attrs)?.[1];
    const isPicture = /\brole="img"/.test(attrs) || (tag === "img" && /\balt="/.test(attrs)) || (tag === "video" && /\baria-label="/.test(attrs));

    return isPicture && name ? [decodeEntities(name)] : [];
  });
}

/** The shops' logos in a render, one for each card or logo tile. */
export const logos = (html: string): string[] =>
  [...html.matchAll(/<img[^>]*\bsrc="(\/themes\/[a-z-]+\/logo\.[a-z]+)"/g)].map((match) => match[1]);
