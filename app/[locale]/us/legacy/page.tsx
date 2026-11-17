import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { marketPriceArgs } from "@/lib/plan-catalog";
import { NOINDEX } from "@/lib/seo/page-robots";

/** The legacy US homepage, served at /us/legacy by the pilot rewrite. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "variant.us.meta" });
  const args = await marketPriceArgs("us", "en");

  return { title: t("title", args), description: t("description", args), robots: NOINDEX };
}

export default function UsLegacyPage() {
  setRequestLocale("en");
  return <VariantLanding locale="en" market="us" />;
}
