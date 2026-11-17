import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CardDesignPreviewPage } from "@/components/landing-pages/pages/CardDesignPreviewPage";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The card design preview in US English, noindex, rewritten from /us/landing-pages/platform/card-design.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/card-design", "en", "us");
}

export default function Page() {
  setRequestLocale("en");

  return <CardDesignPreviewPage market="us" />;
}
