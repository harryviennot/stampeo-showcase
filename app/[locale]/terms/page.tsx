import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { getLegalContent } from "@/lib/legal";
import { compileLegalMDX } from "@/lib/legal/mdx";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const legal = getLegalContent("terms", locale);
  if (!legal) return {};

  return {
    title: legal.title,
    alternates: {
      canonical: locale === "fr" ? "/terms" : `/${locale}/terms`,
      languages: { fr: "/terms", en: "/en/terms" },
    },
  };
}

export default async function TermsPage() {
  const locale = await getLocale();
  const legal = getLegalContent("terms", locale);
  if (!legal) notFound();

  const content = await compileLegalMDX(legal.content);

  return (
    <LegalPageLayout title={legal.title} lastUpdated={legal.lastUpdated}>
      {content}
    </LegalPageLayout>
  );
}
