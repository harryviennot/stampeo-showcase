import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LoyaltyLivePage } from "@/components/landing-pages/pages/LoyaltyLivePage";
import { loyaltyPageMetadata } from "@/lib/landing-pages/live-metadata";
import { loyaltyPath } from "@/lib/loyalty-routes";

const NATIVE = "en";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== NATIVE) return {};
  const t = await getTranslations({ locale, namespace: "metadata.loyaltyPrograms" });
  return loyaltyPageMetadata(locale, t("keywords"));
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  // A visitor of another language who lands on this slug is sent to their own.
  if (locale !== NATIVE) permanentRedirect(loyaltyPath(locale));
  return <LoyaltyLivePage locale={locale} />;
}
