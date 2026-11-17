import type { Metadata, ResolvingMetadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { HomePage } from "@/components/landing-pages/pages/HomePage";
import { homepageMetadata } from "@/lib/landing-pages/live-metadata";
import { imageQuery } from "@/lib/og/metadata";

/**
 * US English pilot, served at /us by a proxy rewrite to this route: Platform in dollars, a 14-day trial and
 * "punch card". Its own URL so it ranks apart from the international English homepage via hreflang en-US;
 * whether Google may index it is `MARKETS.us.indexable`, the flag that also puts it in the homepage's cluster.
 */
export async function generateMetadata(_props: unknown, parent: ResolvingMetadata): Promise<Metadata> {
  const { openGraph } = await parent;
  return homepageMetadata("en", "us", imageQuery(openGraph?.images));
}

export default function UsPilotPage() {
  setRequestLocale("en");
  return <HomePage market="us" />;
}
