import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { StampeoLogo } from "@/components/logo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata.onboarding");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function OnboardingLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Minimal header with just logo */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <Link href="/" className="inline-block group">
          <div className="flex items-center gap-2 transition-transform group-hover:scale-105">
            <StampeoLogo />
            <span className="text-2xl font-bold gradient-text">
              Stampeo
            </span>
          </div>
        </Link>
      </header>

      {/* Main content */}
      <main className="pt-20 pb-12 px-4">{children}</main>
    </div>
  );
}
