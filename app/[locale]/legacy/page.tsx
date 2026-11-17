import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PkceCallbackHandler } from "@/components/auth/PkceCallbackHandler";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";
import { NOINDEX } from "@/lib/seo/page-robots";

export function generateMetadata(): Metadata {
  return { robots: NOINDEX };
}

export default async function LegacyHome({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PkceCallbackHandler />
      <VariantLanding locale={locale} />
    </>
  );
}
