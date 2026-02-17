import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { FeaturePageLayout } from "@/components/features/FeaturePageLayout";
import { AnalyticsPageContent } from "@/components/features/analytics/AnalyticsPageContent";
import { NotificationsPushPage } from "@/components/features/notifications-push/NotificationsPushPage";
import { CardDesignPageContent } from "@/components/features/design-de-carte/CardDesignPageContent";
import { ScannerMobilePage } from "@/components/features/scanner-mobile/ScannerMobilePage";
import { GeofencingPage } from "@/components/features/geolocalisation/GeofencingPage";

const FEATURE_SLUGS = [
  "design-de-carte",
  "scanner-mobile",
  "notifications-push",
  "analytiques",
  "geolocalisation",
  "programme-fondateur",
] as const;

type FeatureSlug = (typeof FEATURE_SLUGS)[number];

function isValidSlug(slug: string): slug is FeatureSlug {
  return (FEATURE_SLUGS as readonly string[]).includes(slug);
}

export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }));
}

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;

  if (!isValidSlug(slug)) {
    return { title: "Not Found" };
  }

  const t = await getTranslations({ locale, namespace: "metadata.features" });

  return {
    title: t(`${slug}.title`),
    description: t(`${slug}.description`),
    alternates: {
      canonical: locale === "fr" ? `/features/${slug}` : `/${locale}/features/${slug}`,
      languages: {
        fr: `/features/${slug}`,
        en: `/en/features/${slug}`,
      },
    },
  };
}

export default async function FeaturePage({ params }: PageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="relative">
        {slug === "design-de-carte" ? (
          <CardDesignPageContent />
        ) : slug === "scanner-mobile" ? (
          <ScannerMobilePage />
        ) : slug === "notifications-push" ? (
          <NotificationsPushPage />
        ) : slug === "analytiques" ? (
          <AnalyticsPageContent />
        ) : slug === "geolocalisation" ? (
          <GeofencingPage />
        ) : (
          <FeaturePageLayout slug={slug} />
        )}
      </main>
      <Footer />
    </div>
  );
}
