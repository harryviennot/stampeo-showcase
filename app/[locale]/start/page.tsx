import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { StartForwarder } from "@/components/onboarding/StartForwarder";
import { Footer } from "@/components/sections/Footer";
import { NOINDEX } from "@/lib/seo/page-robots";

export const metadata: Metadata = { robots: NOINDEX };

// The ad click is recorded here, so the page carries the footer's privacy control like any landing page.
export default async function StartPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-[var(--background)]">
      <StartForwarder />
      <Footer />
    </div>
  );
}
