import { getTranslations } from "next-intl/server";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.terms" });
  return {
    title: t("title"),
    alternates: {
      canonical: locale === "fr" ? "/terms" : `/${locale}/terms`,
      languages: { fr: "/terms", en: "/en/terms" },
    },
  };
}

export default async function TermsPage() {
  const t = await getTranslations("legal.terms");
  const sections = t.raw("sections") as Array<{
    title: string;
    content: string;
  }>;

  return (
    <LegalPageLayout
      title={t("title")}
      lastUpdated={t("lastUpdated")}
      sections={sections}
    />
  );
}
