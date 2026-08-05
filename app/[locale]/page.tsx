import { setRequestLocale } from "next-intl/server";
import { VariantLanding } from "@/components/landing-variant/VariantLanding";

export default async function Home({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VariantLanding locale={locale} />;
}
