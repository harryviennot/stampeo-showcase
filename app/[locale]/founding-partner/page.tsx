import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { permanentRedirect, redirect } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { FounderProgramPage } from "@/components/features/programme-fondateur/FounderProgramPage";
import { isFoundingProgramOpen } from "@/lib/pricing";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  // Only EN uses this route; FR should use /programme-fondateur
  if (locale === "fr") return {};

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

  // FR users should use the French URL
  if (locale === "fr") {
    permanentRedirect("/programme-fondateur");
  }

  // Founding partner program is closed → send visitors to the regular pricing page.
  if (!isFoundingProgramOpen()) {
    redirect(`/${locale}/pricing`);
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
