import { Caveat, Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/hreflang";
import { AuthProvider } from "@/lib/supabase/auth-provider";
import { FloatingLanguageSwitcher } from "@/components/ui/FloatingLanguageSwitcher";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ScrollRevealInit } from "@/components/ui/ScrollRevealInit";
import "../globals.css";
import { PILOT_HREFLANG } from "@/lib/markets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

/* Handwriting face for ink annotations only (.ink-note), never for UI text.
   latin-ext covers œ and the Spanish accents. */
const caveat = Caveat({
  variable: "--font-annotation",
  subsets: ["latin", "latin-ext"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** OpenGraph wants a language_TERRITORY tag, so each locale names a region. */
const OG_LOCALES: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  pl: "pl_PL",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  return {
    metadataBase: new URL("https://stampeo.app"),
    title: {
      default: t("title"),
      template: "%s | Stampeo",
    },
    description: t("description"),
    keywords: t("keywords").split(", "),
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      siteName: "Stampeo",
      locale: OG_LOCALES[locale] ?? OG_LOCALES.en,
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    verification: {
      other: {
        "msvalidate.01": "7306B78C81A951C4E332C053B9367FD7",
      },
    },
    alternates: {
      canonical: localePath(locale, "/"),
      // PILOT_HREFLANG, not localeAlternates: the homepage has to advertise the
      // live country pilots back. hreflang must be RECIPROCAL — /us declares
      // `en-US -> /us`, and if the homepage does not declare it in return Google
      // drops the annotation and crawls /us and /en as two competing English
      // pages. That duplicate split is the exact thing a distinct pilot URL
      // exists to avoid, so indexing /us without this would be worse than
      // leaving it noindex.
      languages: PILOT_HREFLANG,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
      >
        <ScrollRevealInit />
        <NextIntlClientProvider>
          <AuthProvider>
            {children}
            <FloatingLanguageSwitcher />
            {/* Last in the tree so it paints over the page, and inside the
                intl provider because its copy is localized. It decides for
                itself whether this route and this visitor need it. */}
            <ConsentBanner />
            {/* Renders nothing. Decides for itself whether this visitor and
                this route allow the pixel, and re-decides on every
                navigation. */}
            <MetaPixel />
            <GoogleAnalytics />
            <AttributionCapture />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
