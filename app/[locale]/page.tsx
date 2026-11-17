import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PkceCallbackHandler } from "@/components/auth/PkceCallbackHandler";
import { HomePage } from "@/components/landing-pages/pages/HomePage";
import { homepageMetadata } from "@/lib/landing-pages/live-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return homepageMetadata(locale, "int");
}

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PkceCallbackHandler />
      <HomePage market="int" />
    </>
  );
}
