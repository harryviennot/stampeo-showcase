import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { NOINDEX } from "@/lib/seo/page-robots";

/** The legacy UK homepage, served at /uk/legacy by the pilot rewrite. */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: "en", namespace: "metadata.home" });

  return { title: { absolute: t("title") }, description: t("description"), robots: NOINDEX };
}

export default function UkLegacyPage() {
  setRequestLocale("en");
  return <VariantLanding locale="en" market="uk" />;
}
