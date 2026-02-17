import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { FounderProgramPage } from "@/components/features/programme-fondateur/FounderProgramPage";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.features" });

  return {
    title: t("programme-fondateur.title"),
    description: t("programme-fondateur.description"),
    alternates: {
      canonical: locale === "fr" ? "/programme-fondateur" : `/${locale}/programme-fondateur`,
      languages: {
        fr: "/programme-fondateur",
        en: "/en/programme-fondateur",
      },
    },
  };
}

export default function ProgrammeFondateurPage() {
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
