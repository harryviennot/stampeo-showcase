import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PlatformPage } from "@/components/landing-pages/pages/PlatformPage";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The Platform landing page in US English, noindex, rewritten from /us/landing-pages/platform.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform", "en", "us");
}

export default function Page() {
  setRequestLocale("en");

  return <PlatformPage market="us" />;
}
