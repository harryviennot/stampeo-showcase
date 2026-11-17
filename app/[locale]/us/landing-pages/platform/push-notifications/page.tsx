import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PushNotificationsPreviewPage } from "@/components/landing-pages/pages/PushNotificationsPreviewPage";
import { landingPageMetadata } from "@/lib/landing-pages/pages";

// The notifications preview in US English, noindex, rewritten from /us/landing-pages/platform/push-notifications.
export function generateStaticParams() {
  return [{ locale: "en" }];
}

export function generateMetadata(): Metadata {
  return landingPageMetadata("platform/push-notifications", "en", "us");
}

export default function Page() {
  setRequestLocale("en");

  return <PushNotificationsPreviewPage market="us" />;
}
