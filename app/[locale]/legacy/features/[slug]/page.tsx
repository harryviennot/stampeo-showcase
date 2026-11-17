import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/structured-data";
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
import { legacyPath } from "@/lib/legacy-pages";
import { planMessageArgs } from "@/lib/plans/plan-facts";
import { NOINDEX } from "@/lib/seo/page-robots";

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

const legacyFeaturePath = (slug: string, locale: string) => legacyPath(locale, `/features/${slug}`);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;

  const canonical = resolveToCanonicalSlug(slug);
  if (!canonical) return { title: "Not Found" };

  const t = await getTranslations({ locale, namespace: "metadata.features" });

  return {
    title: t(`${canonical}.title`),
    description: t(`${canonical}.description`, planMessageArgs()),
    robots: NOINDEX,
  };
}

export default async function LegacyFeaturePage({ params }: PageProps) {
  const { slug, locale } = await params;

  const canonical = resolveToCanonicalSlug(slug);
  if (!canonical) notFound();

  // A slug of another language redirects to this language's own, still under /legacy.
  if (!isCorrectSlugForLocale(slug, locale)) {
    permanentRedirect(legacyFeaturePath(getLocalizedSlug(canonical, locale), locale));
  }

  const FeatureContent = FEATURE_COMPONENTS[canonical];

  const t = await getTranslations({ locale, namespace: "metadata.features" });
  const homeUrl = locale === "fr" ? "" : `/${locale}`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Stampeo", url: homeUrl },
          {
            name: t(`${canonical}.title`),
            url: legacyFeaturePath(getLocalizedSlug(canonical, locale), locale),
          },
        ])}
      />
      <Header />
      <main className="relative">
        <FeatureContent />
      </main>
      <Footer />
    </div>
  );
}
