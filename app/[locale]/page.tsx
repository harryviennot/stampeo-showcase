import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { localePath } from "@/lib/hreflang";
import { PILOT_HREFLANG } from "@/lib/markets";
import { ogLocaleFor } from "@/lib/og/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  const title = t("title");
  const description = t("description");

  return {
    alternates: {
      canonical: localePath(locale, "/"),
      // PILOT_HREFLANG, not localeAlternates: the homepage has to advertise the
      // live country pilots back. hreflang must be RECIPROCAL — /us declares
      // `en-US -> /us`, and if the homepage does not declare it in return Google
      // drops the annotation and crawls /us and /en as two competing English
      // pages.
      languages: PILOT_HREFLANG,
    },
    openGraph: {
      type: "website",
      siteName: "Stampeo",
      locale: ogLocaleFor(locale),
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VariantLanding locale={locale} />;
}
