import { HeroCardStack } from "@/components/card/HeroCardStack";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { otherComparisons } from "@/lib/compare/page/load";
import { compileComparisonMDX } from "@/lib/compare/page/mdx";
import { pageSetup } from "@/lib/compare/page/setup";
import type { LoadedComparison } from "@/lib/compare/page/view";
import { getStampeoColumn } from "@/lib/compare/stampeo";
import { ComparisonArticle } from "./ComparisonArticle";

/**
 * A comparison page: the landing's paper background, the header and footer of
 * the page's market, and the article. Stampeo's column is priced in the page's
 * own currency, and nothing here swaps it for the visitor's.
 */
export async function ComparisonPage({ loaded }: { loaded: LoadedComparison }) {
  const view = { ...loaded, stampeo: await getStampeoColumn(loaded.page.market) };
  const { verdict, body } = await compileComparisonMDX(view);
  const { siteMarket } = pageSetup(view.page.market);

  return (
    <div className="paper-grain min-h-screen bg-[var(--cream)]">
      <Header market={siteMarket} />
      <ComparisonArticle view={view} verdict={verdict} body={body} others={otherComparisons(view)} heroVisual={<HeroCardStack showQR />} />
      <Footer market={siteMarket} />
    </div>
  );
}
