import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { MobileScannerPreviewPage } from "@/components/landing-pages/pages/MobileScannerPreviewPage";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The scanner preview in US English, noindex, rewritten from /us/landing-pages/platform/mobile-scanner.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/mobile-scanner", "en", "us");
}

export default function Page() {
  setRequestLocale("en");

  return <MobileScannerPreviewPage market="us" />;
}
