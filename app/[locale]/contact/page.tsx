import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ContactPageClient } from "@/components/contact/ContactFormClient";

export default async function ContactPage({
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
        <ContactPageClient />
      </Suspense>
      <Footer />
    </div>
  );
}
