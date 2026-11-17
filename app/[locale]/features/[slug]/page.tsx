import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/JsonLd";
import { AnalyticsPreviewPage } from "@/components/landing-pages/pages/AnalyticsPreviewPage";
import { CardDesignPreviewPage } from "@/components/landing-pages/pages/CardDesignPreviewPage";
import { GeolocationPreviewPage } from "@/components/landing-pages/pages/GeolocationPreviewPage";
import { MobileScannerPreviewPage } from "@/components/landing-pages/pages/MobileScannerPreviewPage";
import { PromotionalCampaignsPreviewPage } from "@/components/landing-pages/pages/PromotionalCampaignsPreviewPage";
import { PushNotificationsPreviewPage } from "@/components/landing-pages/pages/PushNotificationsPreviewPage";
import {
  type FeatureSlug,
  generateFeatureStaticParams,
  getLocalizedSlug,
  isCorrectSlugForLocale,
  resolveToCanonicalSlug,
} from "@/lib/feature-slugs";
import { routing } from "@/i18n/routing";
import { localePath } from "@/lib/hreflang";
import { featurePageMetadata } from "@/lib/landing-pages/live-metadata";
import { breadcrumbJsonLd } from "@/lib/structured-data";

const FEATURE_PAGES: Record<FeatureSlug, typeof CardDesignPreviewPage> = {
  "design-de-carte": CardDesignPreviewPage,
  "scanner-mobile": MobileScannerPreviewPage,
  "notifications-push": PushNotificationsPreviewPage,
  analytiques: AnalyticsPreviewPage,
  geolocalisation: GeolocationPreviewPage,
  "campagnes-promotionnelles": PromotionalCampaignsPreviewPage,
};

export function generateStaticParams() {
  return generateFeatureStaticParams();
}

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  return featurePageMetadata(slug, locale);
}

export default async function FeaturePage({ params }: PageProps) {
  const { slug, locale } = await params;

  const feature = resolveToCanonicalSlug(slug);
  if (!feature) notFound();

  // A slug of another language redirects to this language's own (/en/features/design-de-carte -> /en/features/card-design).
  const own = getLocalizedSlug(feature, locale);
  if (!isCorrectSlugForLocale(slug, locale)) permanentRedirect(localePath(locale, `/features/${own}`));

  const Page = FEATURE_PAGES[feature];
  const t = await getTranslations({ locale, namespace: "metadata.features" });
  const homeUrl = locale === routing.defaultLocale ? "" : `/${locale}`;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Stampeo", url: homeUrl },
          { name: t(`${feature}.title`), url: localePath(locale, `/features/${own}`) },
        ])}
      />
      <Page market="int" />
    </>
  );
}
