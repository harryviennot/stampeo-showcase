import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { MARKETS, PILOT_HREFLANG, marketRobots, type Market } from "@/lib/markets";
import { resolvePageOpenGraph } from "@/lib/og/metadata";

/**
 * UK English pilot, served at /uk by a proxy rewrite to this route.
 * Distinct URL so it can rank independently of the generic English homepage
 * via hreflang en-GB.
 *
 * Indexability comes from `MARKETS.<market>.indexable`, which also decides
 * whether the homepage advertises this URL via hreflang. Both are the same
 * decision: an indexed page missing from the homepage cluster is an
 * unreciprocated annotation, which Google ignores.
 */
const MARKET: Market = "uk";
const M = MARKETS[MARKET];

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "metadata.home" });
  return {
    title: t("title"),
    description: t("description"),
    // One flag, shared with PILOT_HREFLANG and with this market's other pages:
    // a page Google may index is a page the homepage advertises. See
    // lib/markets.ts.
    robots: marketRobots(MARKET),
    alternates: { canonical: M.path, languages: PILOT_HREFLANG },
    openGraph: await resolvePageOpenGraph(parent, {
      title: t("title"),
      description: t("description"),
      url: M.path,
      locale: "en",
      ogLocale: M.ogLocale,
    }),
  };
}

export default function UkPilotPage() {
  setRequestLocale("en");
  return <VariantLanding locale="en" market={MARKET} />;
}
