import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { MARKETS, PILOT_HREFLANG, marketRobots, type Market } from "@/lib/markets";
import { marketPriceArgs } from "@/lib/plan-catalog";
import { resolvePageOpenGraph } from "@/lib/og/metadata";

/**
 * US English pilot, served at /us by a proxy rewrite to this route.
 * Distinct URL so it can rank independently of the generic English homepage
 * via hreflang en-US.
 *
 * Indexability comes from `MARKETS.<market>.indexable`, which also decides
 * whether the homepage advertises this URL via hreflang. Both are the same
 * decision: an indexed page missing from the homepage cluster is an
 * unreciprocated annotation, which Google ignores.
 */
const MARKET: Market = "us";
const M = MARKETS[MARKET];

export async function generateMetadata(
  _props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Its own title and description, written for the US reader, under the
  // market subtree of the English catalog.
  const t = await getTranslations({ locale: "en", namespace: "variant.us.meta" });
  const args = await marketPriceArgs(MARKET, "en");
  const title = t("title", args);
  const description = t("description", args);
  return {
    title,
    description,
    // One flag, shared with PILOT_HREFLANG and with this market's other pages:
    // a page Google may index is a page the homepage advertises. See
    // lib/markets.ts.
    robots: marketRobots(MARKET),
    alternates: { canonical: M.path, languages: PILOT_HREFLANG },
    openGraph: await resolvePageOpenGraph(parent, {
      title,
      description,
      url: M.path,
      locale: "en",
      ogLocale: M.ogLocale,
    }),
  };
}

export default function UsPilotPage() {
  setRequestLocale("en");
  return <VariantLanding locale="en" market={MARKET} />;
}
