import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import { MarketPricingPage } from "@/components/pricing/MarketPricingPage";
import { localePath, marketAlternates } from "@/lib/hreflang";
import { resolvePageOpenGraph } from "@/lib/og/metadata";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ locale: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricingPage.meta" });
  const canonical = localePath(locale, "/pricing");
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical,
      // One cluster with the market pricing pages (/us/pricing as en-US).
      languages: marketAlternates("/pricing"),
    },
    openGraph: await resolvePageOpenGraph(parent, {
      title: t("title"),
      description: t("description"),
      url: canonical,
      locale,
    }),
  };
}

export default async function PricingPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // /pricing is the international page. The US and UK markets have their own
  // routes so their nav and their ladder cannot disagree.
  return <MarketPricingPage locale={locale} market="int" />;
}
