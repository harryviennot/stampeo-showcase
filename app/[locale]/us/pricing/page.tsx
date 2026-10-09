import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketPricingPage } from "@/components/pricing/MarketPricingPage";
import { marketAlternates } from "@/lib/hreflang";
import { MARKETS, marketRobots, type Market } from "@/lib/markets";
import { resolvePageOpenGraph } from "@/lib/og/metadata";

/**
 * Pricing for the US pilot, served at /us/pricing by a proxy rewrite to
 * this route. It exists so a visitor on /us never navigates out of their own
 * currency. Its robots directive and its place in the pricing hreflang cluster
 * both derive from `MARKETS.us.indexable`.
 */
const MARKET: Market = "us";
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

export default function UsPricingPage() {
  return <MarketPricingPage locale="en" market={MARKET} />;
}
