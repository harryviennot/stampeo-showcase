import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { MARKETS, PILOT_HREFLANG } from "@/lib/markets";

/**
 * UK English pilot (served at /uk via the middleware rewrite, and directly at
 * /en/uk). Distinct URL so it can rank independently of the generic English
 * homepage via hreflang en-GB.
 *
 * NOINDEX while we validate the copy — flip `robots.index` to true and wire
 * PILOT_HREFLANG into the homepage `alternates` to go live.
 */
const M = MARKETS.uk;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "metadata.home" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: true },
    alternates: { canonical: M.path, languages: PILOT_HREFLANG },
    openGraph: { locale: M.ogLocale },
  };
}

export default function UkPilotPage() {
  setRequestLocale("en");
  return <VariantLanding locale="en" market="uk" />;
}
