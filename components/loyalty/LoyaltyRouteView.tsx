import { getTranslations } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { LoyaltyProgramsPage } from "./LoyaltyProgramsPage";
import { JsonLd } from "@/components/JsonLd";
import { faqPageJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import { loyaltyPath } from "@/lib/loyalty-routes";

/** Shared render for the three localized loyalty-programs route folders. */
export async function LoyaltyRouteView({ locale }: { locale: string }) {
  const t = await getTranslations("loyalty");
  const faqItems = t.raw("faq.items") as Array<{ question: string; answer: string }>;
  const homeUrl = locale === "fr" ? "" : `/${locale}`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <JsonLd data={faqPageJsonLd(faqItems)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Stampeo", url: homeUrl },
          { name: t("hero.badge"), url: loyaltyPath(locale) },
        ])}
      />
      <Header />
      <main className="relative">
        <LoyaltyProgramsPage />
      </main>
      <Footer />
    </div>
  );
}
