import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { FounderProgramPage } from "@/components/features/programme-fondateur/FounderProgramPage";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  // EN uses /founding-partner route
  if (locale === "en") return {};

  const t = await getTranslations({ locale, namespace: "metadata.features" });

  return {
    title: t("programme-fondateur.title"),
    description: t("programme-fondateur.description"),
    alternates: {
      canonical: "/programme-fondateur",
      languages: {
        "x-default": "/programme-fondateur",
        fr: "/programme-fondateur",
        en: "/en/founding-partner",
      },
    },
  };
}

export default async function ProgrammeFondateurPage({ params }: PageProps) {
  const { locale } = await params;

  // EN users visiting /en/programme-fondateur → redirect to /en/founding-partner
  if (locale === "en") {
    permanentRedirect("/en/founding-partner");
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
