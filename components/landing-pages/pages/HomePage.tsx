import { JsonLd } from "@/components/JsonLd";
import { VariantDevToggle } from "@/components/landing-variant/VariantDevToggle";
import { PlatformPage } from "@/components/landing-pages/pages/PlatformPage";
import { MARKETS, type Market } from "@/lib/markets";
import { getPlanCatalog } from "@/lib/plan-catalog";
import { organizationJsonLd, softwareApplicationJsonLd, webSiteJsonLd } from "@/lib/structured-data";

/**
 * The homepage of a market: Platform, the structured data a homepage carries (the organisation, the site and the
 * software with the market's own ladder) and the development switcher between the markets. Platform has no FAQ, so it
 * states none.
 */
export async function HomePage({ market }: Readonly<{ market: Market }>) {
  const pricing = await getPlanCatalog(MARKETS[market].currency.code.toLowerCase());

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={webSiteJsonLd()} />
      <JsonLd data={softwareApplicationJsonLd(pricing)} />
      <PlatformPage market={market} />
      <VariantDevToggle />
    </>
  );
}
