import { Caveat, Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { ogLocaleFor } from "@/lib/og/metadata";
import { AuthProvider } from "@/lib/supabase/auth-provider";
import { FloatingLanguageSwitcher } from "@/components/ui/FloatingLanguageSwitcher";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ScrollRevealInit } from "@/components/ui/ScrollRevealInit";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

// Only Geist is preloaded. The mono and handwriting faces are secondary, so
// they load when first used instead of competing with the first paint.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

/* Handwriting face for ink annotations only (.ink-note), never for UI text.
   latin-ext covers œ and the Spanish accents. */
const caveat = Caveat({
  variable: "--font-annotation",
  subsets: ["latin", "latin-ext"],
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
    // No title or description here: Next fills the OpenGraph and Twitter ones
    // from each page's own. No `alternates` either, so a page that declares no
    // canonical inherits none.
    openGraph: {
      type: "website",
      siteName: "Stampeo",
      locale: ogLocaleFor(locale),
    },
    twitter: {
      card: "summary_large_image",
    },
    verification: {
      other: {
        "msvalidate.01": "7306B78C81A951C4E332C053B9367FD7",
      },
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
            {/* Must stay AFTER {children}: its landing-context snapshot reads
                body.dataset.landingVariant, which LandingTracker (inside the
                page subtree) stamps in an effect that has to fire first. */}
            <AttributionCapture />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
