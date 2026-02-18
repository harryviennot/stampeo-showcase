import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/lib/supabase/auth-provider";
import { FloatingLanguageSwitcher } from "@/components/ui/FloatingLanguageSwitcher";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      siteName: "Stampeo",
      locale: locale === "fr" ? "fr_FR" : "en_US",
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
      canonical: locale === "fr" ? "/" : `/${locale}`,
      languages: {
        fr: "/",
        en: "/en",
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
      <head>
        <Script
          defer
          src="https://plausible.io/js/pa-pXu4f9v9uRQS6_NVEJeTK.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <AuthProvider>
            {children}
            <FloatingLanguageSwitcher />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
