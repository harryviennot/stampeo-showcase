import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketPricingPage } from "@/components/pricing/MarketPricingPage";
import { MARKETS } from "@/lib/markets";

/**
 * Pricing for the US pilot (served at /us/pricing via the middleware
 * rewrite, and directly at /en/us/pricing).
 *
 * Exists so a visitor on /us cannot navigate out of their own currency: the
 * shared nav used to point at /pricing, which quotes the international ladder.
 * Its robots directive tracks the pilot landing page — indexing a market's
 * pricing before its landing page is live would strand it without its funnel.
 */
const M = MARKETS.us;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "pricingPage.meta" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: true },
    // Its own canonical: this page must not collapse into /pricing, which
    // quotes a different currency.
    alternates: { canonical: `${M.path}/pricing` },
    openGraph: { locale: M.ogLocale },
  };
}

export default function UsPricingPage() {
  return <MarketPricingPage locale="en" market="us" />;
}
