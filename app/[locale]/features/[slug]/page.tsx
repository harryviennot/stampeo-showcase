import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { AnalyticsPageContent } from "@/components/features/analytics/AnalyticsPageContent";
import { NotificationsPushPage } from "@/components/features/notifications-push/NotificationsPushPage";
import { CardDesignPageContent } from "@/components/features/design-de-carte/CardDesignPageContent";
import { ScannerMobilePage } from "@/components/features/scanner-mobile/ScannerMobilePage";
import { GeofencingPage } from "@/components/features/geolocalisation/GeofencingPage";
import {
  type FeatureSlug,
  isValidSlug,
  generateFeatureStaticParams,
} from "@/lib/feature-slugs";

const FEATURE_COMPONENTS: Record<FeatureSlug, React.ComponentType> = {
  "design-de-carte": CardDesignPageContent,
  "scanner-mobile": ScannerMobilePage,
  "notifications-push": NotificationsPushPage,
  analytiques: AnalyticsPageContent,
  geolocalisation: GeofencingPage,
};

export function generateStaticParams() {
  return generateFeatureStaticParams();
}

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

const DEFAULT_LOCALE = "fr";

function featureUrl(slug: string, locale: string) {
  return locale === DEFAULT_LOCALE
    ? `/features/${slug}`
    : `/${locale}/features/${slug}`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;

  if (!isValidSlug(slug)) {
    return { title: "Not Found" };
  }

  const t = await getTranslations({ locale, namespace: "metadata.features" });
  const title = t(`${slug}.title`);
  const description = t(`${slug}.description`);

  return {
    title,
    description,
    alternates: {
      canonical: featureUrl(slug, locale),
      languages: {
        fr: `/features/${slug}`,
        en: `/en/features/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: featureUrl(slug, locale),
      type: "website",
    },
  };
}

export default async function FeaturePage({ params }: PageProps) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    notFound();
  }

  const FeatureContent = FEATURE_COMPONENTS[slug];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="relative">
        <FeatureContent />
      </main>
      <Footer />
    </div>
  );
}
