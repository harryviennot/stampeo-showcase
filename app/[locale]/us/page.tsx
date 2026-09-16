import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { MARKETS, PILOT_HREFLANG, marketRobots, type Market } from "@/lib/markets";

/**
 * US English pilot (served at /us via the middleware rewrite, and directly at
 * /en/us). Distinct URL so it can rank independently of the generic English
 * homepage via hreflang en-US.
 *
 * Indexability comes from `MARKETS.<market>.indexable`, which also decides
 * whether the homepage advertises this URL via hreflang. Both are the same
 * decision: an indexed page missing from the homepage cluster is an
 * unreciprocated annotation, which Google ignores.
 */
const MARKET: Market = "us";
const M = MARKETS[MARKET];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "metadata.home" });
  return {
    title: t("title"),
    description: t("description"),
    // One flag, shared with PILOT_HREFLANG and with this market's other pages:
    // a page Google may index is a page the homepage advertises. See
    // lib/markets.ts.
    robots: marketRobots(MARKET),
    alternates: { canonical: M.path, languages: PILOT_HREFLANG },
    openGraph: { locale: M.ogLocale },
  };
}

export default function UsPilotPage() {
  setRequestLocale("en");
  return <VariantLanding locale="en" market={MARKET} />;
}
