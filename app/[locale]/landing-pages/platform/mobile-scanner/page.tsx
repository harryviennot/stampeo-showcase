import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MobileScannerPreviewPage } from "@/components/landing-pages/pages/MobileScannerPreviewPage";
import { routing } from "@/i18n/routing";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The scanner preview in every language of the international site, noindex.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Readonly<{ params: Promise<{ locale: string }> }>): Promise<Metadata> {
  const { locale } = await params;

  return landingPageMetadata("platform/mobile-scanner", locale, "int");
}

export default async function Page({ params }: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MobileScannerPreviewPage market="int" />;
}
