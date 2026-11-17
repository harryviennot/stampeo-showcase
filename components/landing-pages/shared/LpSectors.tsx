import { getLocale, getTranslations } from "next-intl/server";
import { SectorCarousel } from "@/components/landing-variant/SectorCarousel";
import { SECTOR_DISPLAY_ORDER, SECTOR_THEMES } from "@/components/landing-variant/sector-themes";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { fillSectorMoney, orderSectorSlides, type SectorCopy } from "@/lib/landing/sector-slides";
import { MARKETS, type Market } from "@/lib/markets";
import { LpHeading, LpSection } from "./LpSection";

/**
 * "Stampeo adapts to your business": the carousel of sample shops, in the money of
 * the page's `market`, under the catalog's own heading. Its slides are made-up shops, so it is never
 * labelled as customers; `eyebrow` is for a page that puts a small label above.
 */
export async function LpSectors({ eyebrow, market }: Readonly<{ eyebrow?: string; market: Market }>) {
  const t = await getTranslations("landing.sectorCards");
  const tc = await getTranslations("common");
  const locale = await getLocale();

  const currency = MARKETS[market].currency.code;
  const sectors = (t.raw("sectors") as SectorCopy[]).map((sector) => fillSectorMoney(sector, currency, locale));
  const slides = orderSectorSlides(sectors, SECTOR_THEMES, SECTOR_DISPLAY_ORDER);

  return (
    <LpSection section="sectors" bare>
      <section className="relative py-16 lg:py-24">
        <Container className="mb-14">
          <ScrollReveal>
            <LpHeading
              align="center"
              eyebrow={eyebrow}
              title={t.rich("title", {
                br: () => <br className="hidden md:block" />,
                mbr: () => <br className="md:hidden" />,
              })}
              lead={t.rich("subtitle", {
                br: () => <br className="hidden md:block" />,
              })}
            />
          </ScrollReveal>
        </Container>

        {/* The carousel sits outside the Container: edge to edge, the side slides peek in. */}
        <ScrollReveal delay={150}>
          <SectorCarousel
            slides={slides}
            engineLabels={{ stamp: tc("stamps"), points: tc("points") }}
            controls={{ prev: t("carousel.prev"), next: t("carousel.next") }}
          />
        </ScrollReveal>
      </section>
    </LpSection>
  );
}
