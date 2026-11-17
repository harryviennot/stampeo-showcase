import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomePage } from "@/components/landing-pages/pages/HomePage";
import { homepageMetadata } from "@/lib/landing-pages/live-metadata";
import { imageQuery } from "@/lib/og/metadata";

/**
 * UK English pilot, served at /uk by a proxy rewrite to this route: Platform in the international English, in
 * euros with a 30-day trial. Its own URL for hreflang en-GB; it stays noindex while `MARKETS.uk.indexable` is false.
 */
export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const { openGraph } = await parent;
  return homepageMetadata("en", "uk", imageQuery(openGraph?.images));
}

export default function UkPilotPage() {
  setRequestLocale("en");
  return <HomePage market="uk" />;
}
