import { getTranslations } from "next-intl/server";
import { localeAlternates, localePath } from "@/lib/hreflang";

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
      canonical: `${baseUrl}${localePath(locale, "/contact")}`,
      languages: localeAlternates("/contact", { baseUrl }),
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
