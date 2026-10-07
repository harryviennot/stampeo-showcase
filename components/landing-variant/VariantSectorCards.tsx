import { getTranslations } from "next-intl/server";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { SectorCarousel } from "./SectorCarousel";
import { SECTOR_DISPLAY_ORDER, SECTOR_THEMES } from "./sector-themes";
import { orderSectorSlides } from "@/lib/landing/sector-slides";

export async function VariantSectorCards() {
  const t = await getTranslations("landing.sectorCards");
  const tc = await getTranslations("common");

  const sectors = t.raw("sectors") as Array<{
    name: string;
    quote: string;
    reward: string;
    advantage: string;
    fields?: Array<{ label: string; value: string }>;
    link: string;
    linkLabel: string;
  }>;

  const slides = orderSectorSlides(sectors, SECTOR_THEMES, SECTOR_DISPLAY_ORDER);

  return (
    <section className="py-16 lg:py-24 relative">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-h2 text-[var(--foreground)]">
            {t.rich("title", {
              br: () => <br className="hidden md:block" />,
              mbr: () => <br className="md:hidden" />,
            })}
          </h2>
          <p className="mt-5 text-lead text-[var(--muted-foreground)]">
            {t.rich("subtitle", {
              br: () => <br className="hidden md:block" />,
            })}
          </p>
        </ScrollReveal>
      </Container>

      {/* Carousel sits outside the Container: edge-to-edge, side slides peek in */}
      <ScrollReveal delay={150}>
        <SectorCarousel
          slides={slides}
          engineLabels={{ stamp: tc("stamps"), points: tc("points") }}
          controls={{ prev: t("carousel.prev"), next: t("carousel.next") }}
        />
      </ScrollReveal>
    </section>
  );
}
