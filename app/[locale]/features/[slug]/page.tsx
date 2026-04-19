import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { AnalyticsPageContent } from "@/components/features/analytics/AnalyticsPageContent";
import { NotificationsPushPage } from "@/components/features/notifications-push/NotificationsPushPage";
import { CardDesignPageContent } from "@/components/features/design-de-carte/CardDesignPageContent";
import { ScannerMobilePage } from "@/components/features/scanner-mobile/ScannerMobilePage";
import { GeofencingPage } from "@/components/features/geolocalisation/GeofencingPage";
import { BroadcastsPage } from "@/components/features/broadcasts/BroadcastsPage";
import {
  type FeatureSlug,
  generateFeatureStaticParams,
  resolveToCanonicalSlug,
  isCorrectSlugForLocale,
  getLocalizedSlug,
} from "@/lib/feature-slugs";

const FEATURE_COMPONENTS: Record<FeatureSlug, React.ComponentType> = {
  "design-de-carte": CardDesignPageContent,
  "scanner-mobile": ScannerMobilePage,
  "notifications-push": NotificationsPushPage,
  analytiques: AnalyticsPageContent,
  geolocalisation: GeofencingPage,
  "campagnes-promotionnelles": BroadcastsPage,
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

  const canonical = resolveToCanonicalSlug(slug);
  if (!canonical) return { title: "Not Found" };

  // Use canonical (FR) slug for translation keys
  const t = await getTranslations({ locale, namespace: "metadata.features" });
  const title = t(`${canonical}.title`);
  const description = t(`${canonical}.description`);

  const frSlug = canonical;
  const enSlug = getLocalizedSlug(canonical, "en");

  return {
    title,
    description,
    alternates: {
      canonical: featureUrl(getLocalizedSlug(canonical, locale), locale),
      languages: {
        "x-default": `/features/${frSlug}`,
        fr: `/features/${frSlug}`,
        en: `/en/features/${enSlug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: featureUrl(getLocalizedSlug(canonical, locale), locale),
      type: "website",
    },
  };
}

export default async function FeaturePage({ params }: PageProps) {
  const { slug, locale } = await params;

  const canonical = resolveToCanonicalSlug(slug);
  if (!canonical) notFound();

  // Redirect to the correct locale-specific slug (e.g., /en/features/design-de-carte → /en/features/card-design)
  if (!isCorrectSlugForLocale(slug, locale)) {
    const correctSlug = getLocalizedSlug(canonical, locale);
    permanentRedirect(featureUrl(correctSlug, locale));
  }

  const FeatureContent = FEATURE_COMPONENTS[canonical];

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
