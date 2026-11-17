import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LoyaltyProgramsPreviewPage } from "@/components/landing-pages/pages/LoyaltyProgramsPreviewPage";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The loyalty programs preview in US English, noindex, rewritten from /us/landing-pages/platform/loyalty-programs.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/loyalty-programs", "en", "us");
}

export default function Page() {
  setRequestLocale("en");

  return <LoyaltyProgramsPreviewPage market="us" />;
}
