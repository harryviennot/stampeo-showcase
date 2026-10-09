import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketPricingPage } from "@/components/pricing/MarketPricingPage";
import { marketAlternates } from "@/lib/hreflang";
import { MARKETS, marketRobots, type Market } from "@/lib/markets";
import { resolvePageOpenGraph } from "@/lib/og/metadata";

/**
 * Pricing for the UK pilot, served at /uk/pricing by a proxy rewrite to
 * this route. It exists so a visitor on /uk never navigates out of their own
 * currency. Its robots directive and its place in the pricing hreflang cluster
 * both derive from `MARKETS.uk.indexable`.
 */
const MARKET: Market = "uk";
const M = MARKETS[MARKET];

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "pricingPage.meta" });
  const canonical = `${M.path}/pricing`;
  return {
    title: t("title"),
    description: t("description"),
    robots: marketRobots(MARKET),
    // Its own canonical: this page must not collapse into /pricing, which
    // quotes a different currency. The cluster names both as alternates.
    alternates: { canonical, languages: marketAlternates("/pricing") },
    openGraph: await resolvePageOpenGraph(parent, {
      title: t("title"),
      description: t("description"),
      url: canonical,
      locale: "en",
      ogLocale: M.ogLocale,
    }),
  };
}

export default function UkPricingPage() {
  return <MarketPricingPage locale="en" market={MARKET} />;
}
