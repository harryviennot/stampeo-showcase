import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { comparisonSlugs, loadComparison } from "@/lib/compare/page/load";
import { comparisonMetadata, comparisonOpenGraphPage } from "@/lib/compare/page/metadata";
import { resolvePageOpenGraph } from "@/lib/og/metadata";

/**
 * A US comparison ("Stampeo vs <competitor>"), served at /us/vs/<slug> by the
 * proxy's rewrite of /us/* to this route. English only: another language is a 404.
 */
const MARKET = "us";

type Props = { params: Promise<{ locale: string; competitor: string }> };

export async function generateStaticParams() {
  return comparisonSlugs(MARKET).map((competitor) => ({ locale: "en", competitor }));
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const { locale, competitor } = await params;
  const loaded = loadComparison({ market: MARKET, locale, slug: competitor });
  if (!loaded) return {};

  return comparisonMetadata(loaded.page, await resolvePageOpenGraph(parent, comparisonOpenGraphPage(loaded.page)));
}

export default async function UsComparisonPage({ params }: Props) {
  const { locale, competitor } = await params;
  const loaded = loadComparison({ market: MARKET, locale, slug: competitor });
  if (!loaded) notFound();

  setRequestLocale(locale);
  return <ComparisonPage loaded={loaded} />;
}
