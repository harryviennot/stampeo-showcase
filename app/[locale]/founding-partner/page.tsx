import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { permanentRedirect } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { FounderProgramPage } from "@/components/features/programme-fondateur/FounderProgramPage";
import { isFoundingProgramOpen } from "@/lib/pricing";
import { localePath } from "@/lib/hreflang";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  // Only EN uses this route; FR uses /programme-fondateur, ES has no founding page
  if (locale !== "en") return {};

  const t = await getTranslations({ locale, namespace: "metadata.features" });

  return {
    title: t("programme-fondateur.title"),
    description: t("programme-fondateur.description"),
    alternates: {
      canonical: `/${locale}/founding-partner`,
      languages: {
        "x-default": "/programme-fondateur",
        fr: "/programme-fondateur",
        en: "/en/founding-partner",
      },
    },
  };
}

export default async function FoundingPartnerPage({ params }: PageProps) {
  const { locale } = await params;

  // The programme is closed: one permanent hop to this locale's pricing page.
  if (!isFoundingProgramOpen()) {
    permanentRedirect(localePath(locale, "/pricing"));
  }

  // FR users should use the French URL
  if (locale === "fr") {
    permanentRedirect("/programme-fondateur");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="relative">
        <FounderProgramPage />
      </main>
      <Footer />
    </div>
  );
}
