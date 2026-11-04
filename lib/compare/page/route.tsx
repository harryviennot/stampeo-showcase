import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { resolvePageOpenGraph } from "@/lib/og/metadata";
import type { LoaderOptions } from "../content";
import type { Market } from "../types";
import { comparisonSlugs, loadComparison } from "./load";
import { comparisonMetadata, comparisonOpenGraphPage } from "./metadata";

type Props = { params: Promise<{ locale: string; competitor: string }> };

/** The language each market's pages are written in: a page opened in any other is a 404. */
const LOCALE: Record<Market, string> = { us: "en", fr: "fr" };

/**
 * The route module of one market's comparisons (`/us/vs/<slug>`, `/comparatif/<slug>`):
 * its prerendered params, its head and its page. Drafts are prerendered and open by URL.
 */
export function comparisonRoute(market: Market, options: LoaderOptions = {}) {
  return {
    async generateStaticParams() {
      return comparisonSlugs(market, options).map((competitor) => ({ locale: LOCALE[market], competitor }));
    },

    async generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
      const { locale, competitor } = await params;
      const loaded = loadComparison({ market, locale, slug: competitor }, options);
      if (!loaded) return {};

      return comparisonMetadata(loaded.page, await resolvePageOpenGraph(parent, comparisonOpenGraphPage(loaded.page)));
    },

    async Page({ params }: Props) {
      const { locale, competitor } = await params;
      const loaded = loadComparison({ market, locale, slug: competitor }, options);
      if (!loaded) notFound();

      setRequestLocale(locale);
      return <ComparisonPage loaded={loaded} />;
    },
  };
}
