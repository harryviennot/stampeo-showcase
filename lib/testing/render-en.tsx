import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { RegionPricingProvider } from "@/components/market/RegionPricingProvider";
import { MARKETS } from "../markets";
import { FALLBACK_PRICING } from "../pricing";
import { loadCatalog } from "./catalogs";

const CATALOGS = new Map<string, Record<string, unknown>>();

const catalog = (locale: string) => {
  if (!CATALOGS.has(locale)) CATALOGS.set(locale, loadCatalog(locale));
  return CATALOGS.get(locale);
};

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
  return renderToStaticMarkup(
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
    </NextIntlClientProvider>,
  );
}

const ENTITIES: Record<string, string> = { "&amp;": "&", "&#x27;": "'", "&quot;": '"', "&lt;": "<", "&gt;": ">" };

/** The text of rendered markup: tags become a bar, so adjacent elements never fuse into one word, and entities are read back. */
export const textOf = (html: string) =>
  html
    .replace(/<[^>]*>/g, "|")
    .replace(/\|+/g, "|")
    .replace(/&(?:amp|#x27|quot|lt|gt);/g, (entity) => ENTITIES[entity]);
