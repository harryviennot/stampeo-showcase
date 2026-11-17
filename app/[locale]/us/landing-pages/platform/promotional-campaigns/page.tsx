import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PromotionalCampaignsPreviewPage } from "@/components/landing-pages/pages/PromotionalCampaignsPreviewPage";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The campaigns preview in US English, noindex, rewritten from /us/landing-pages/platform/promotional-campaigns.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/promotional-campaigns", "en", "us");
}

export default function Page() {
  setRequestLocale("en");

  return <PromotionalCampaignsPreviewPage market="us" />;
}
