import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoyaltyRouteView } from "@/components/loyalty/LoyaltyRouteView";
import { legacyPath } from "@/lib/seo/legacy-pages";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import { NOINDEX } from "@/lib/seo/page-robots";

const NATIVE = "pl";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== NATIVE) return {};
  const t = await getTranslations({ locale, namespace: "metadata.loyaltyPrograms" });
  return { title: t("title"), description: t("description"), keywords: t("keywords"), robots: NOINDEX };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  // A visitor of another language is sent to their own legacy page.
  if (locale !== NATIVE) permanentRedirect(legacyPath(locale, LOYALTY_SLUGS[locale as keyof typeof LOYALTY_SLUGS]));
  return <LoyaltyRouteView locale={locale} />;
}
