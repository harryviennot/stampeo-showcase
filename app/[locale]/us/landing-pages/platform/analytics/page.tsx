import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AnalyticsPreviewPage } from "@/components/landing-pages/pages/AnalyticsPreviewPage";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The analytics preview in US English, noindex, rewritten from /us/landing-pages/platform/analytics.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/analytics", "en", "us");
}

export default function Page() {
  setRequestLocale("en");

  return <AnalyticsPreviewPage market="us" />;
}
