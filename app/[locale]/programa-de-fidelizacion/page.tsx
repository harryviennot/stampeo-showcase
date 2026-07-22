import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoyaltyRouteView } from "@/components/loyalty/LoyaltyRouteView";
import { LOYALTY_LANGUAGES, loyaltyPath } from "@/lib/loyalty-routes";

const CANONICAL = "es";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== CANONICAL) return {};
  const t = await getTranslations({ locale, namespace: "metadata.loyaltyPrograms" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: { canonical: loyaltyPath(CANONICAL), languages: LOYALTY_LANGUAGES },
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  // Non-ES visitors land on the ES slug → send them to their native slug.
  if (locale !== CANONICAL) permanentRedirect(loyaltyPath(locale));
  return <LoyaltyRouteView locale={locale} />;
}
