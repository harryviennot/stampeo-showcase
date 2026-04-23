import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { PricingPageContent } from "@/components/pricing/PricingPageContent";

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
      canonical: locale === "fr" ? "/pricing" : `/${locale}/pricing`,
      languages: {
        "x-default": "/pricing",
        fr: "/pricing",
        en: "/en/pricing",
      },
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
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main>
        <PricingPageContent />
      </main>
      <Footer />
    </div>
  );
}
