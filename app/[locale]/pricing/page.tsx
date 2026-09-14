import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPlanCatalog } from "@/lib/plan-catalog";
import { MARKETS } from "@/lib/markets";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";
import { localeAlternates, localePath } from "@/lib/hreflang";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricingPage.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: localePath(locale, "/pricing"),
      languages: localeAlternates("/pricing"),
    },
  };
}

export default async function PricingPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  // /pricing is the international page, so it quotes the default market. The
  // US market has its own route (/us) with its own currency.
  const pricing = await getPlanCatalog(MARKETS.int.currency.code.toLowerCase());
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        <PricingPageContent pricing={pricing} />
      </main>
      <Footer />
    </div>
  );
}
