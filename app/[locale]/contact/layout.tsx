import type { Metadata, ResolvingMetadata } from "next";
import { getTranslations } from "next-intl/server";
import { localeAlternates, localePath } from "@/lib/hreflang";
import { resolvePageOpenGraph } from "@/lib/og/metadata";

export async function generateMetadata(
  {
    params,
  }: {
    params: Promise<{ locale: string }>;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.contact" });

  const baseUrl = "https://stampeo.app";
  const canonical = `${baseUrl}${localePath(locale, "/contact")}`;

  return {
    title: t("title"),
    description: t("description"),
    openGraph: await resolvePageOpenGraph(parent, {
      title: t("title"),
      description: t("description"),
      url: canonical,
      locale,
    }),
    alternates: {
      canonical,
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
