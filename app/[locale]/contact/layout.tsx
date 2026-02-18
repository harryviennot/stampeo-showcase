import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.contact" });

  const baseUrl = "https://stampeo.app";

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
    },
    alternates: {
      canonical: locale === "fr" ? `${baseUrl}/contact` : `${baseUrl}/${locale}/contact`,
      languages: {
        "x-default": `${baseUrl}/contact`,
        fr: `${baseUrl}/contact`,
        en: `${baseUrl}/en/contact`,
      },
    },
  };
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
