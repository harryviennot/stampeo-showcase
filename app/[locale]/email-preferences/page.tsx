import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { EmailPreferencesClient } from "@/components/email-preferences/EmailPreferencesClient";
import { NOINDEX } from "@/lib/seo/page-robots";

export function generateMetadata(): Metadata {
  return { robots: NOINDEX };
}

export default async function EmailPreferencesPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <Suspense fallback={<div className="pt-32 pb-20 min-h-[60vh]" />}>
        <EmailPreferencesClient />
      </Suspense>
      <Footer />
    </div>
  );
}
