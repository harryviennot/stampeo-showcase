import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { otherComparisons } from "@/lib/compare/page/load";
import { compileComparisonMDX } from "@/lib/compare/page/mdx";
import { pageSetup } from "@/lib/compare/page/setup";
import type { LoadedComparison } from "@/lib/compare/page/view";
import { getStampeoColumn } from "@/lib/compare/stampeo";
import { ComparisonArticle } from "./ComparisonArticle";

/**
 * A comparison page: the blog's reading shell (its background, the header and
 * footer of the page's market) around the article. Stampeo's column is priced
 * in the page's own currency, and nothing here swaps it for the visitor's.
 */
export async function ComparisonPage({ loaded }: { loaded: LoadedComparison }) {
  const view = { ...loaded, stampeo: await getStampeoColumn(loaded.page.market) };
  const { verdict, body } = await compileComparisonMDX(view);
  const { siteMarket } = pageSetup(view.page.market);

  return (
    <div className="min-h-screen bg-[var(--blog-bg)]">
      <Header market={siteMarket} />
      <ComparisonArticle view={view} verdict={verdict} body={body} others={otherComparisons(view)} />
      <Footer market={siteMarket} />
    </div>
  );
}
