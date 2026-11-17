import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { GeolocationPreviewPage } from "@/components/landing-pages/pages/GeolocationPreviewPage";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The geolocation preview in US English, noindex, rewritten from /us/landing-pages/platform/geolocation.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/geolocation", "en", "us");
}

export default function Page() {
  setRequestLocale("en");

  return <GeolocationPreviewPage market="us" />;
}
