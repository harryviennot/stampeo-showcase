import { getTranslations } from "next-intl/server";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  return {
    title: t("title"),
    alternates: {
      canonical: locale === "fr" ? "/privacy" : `/${locale}/privacy`,
      languages: { fr: "/privacy", en: "/en/privacy" },
    },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("legal.privacy");
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
