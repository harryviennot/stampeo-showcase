import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { HeroWords } from "../../platform/HeroWords";
import { LpCtaPair } from "../../platform/LpCtaPair";
import { LpSection } from "../../shared/LpSection";
import { ReskinCards } from "./ReskinCards";

/**
 * The card design preview's hero: the headline and sub over one wallet card that takes on the look of six
 * shops in turn, then the trial and the jump to the designer. Centred, in that order, on a phone and a laptop.
 */
export function ReskinHero() {
  const { reskin, designerLink } = CARD_DESIGN_PREVIEW;

  return (
    <LpSection section="hero" bare>
      <section className="relative pt-24 pb-10 lg:pt-24 lg:pb-14">
        <Container>
          <HeroWords slug="platform/card-design" look="fan" />
        </Container>

        <Container className="mt-6 lg:mt-8">
          <ReskinCards captions={reskin.captions} alt={reskin.alt} />
        </Container>

        <Container className="relative z-10 mt-6 lg:mt-6">
          <div className="flex flex-col items-center gap-3">
            <LpCtaPair location="hero" secondary={{ label: designerLink, href: "#playground" }} />
            <p className="text-sm font-medium text-[var(--muted-foreground)]">
              <RegionText raw={SHARED.reassurance} />
            </p>
          </div>
        </Container>
      </section>
    </LpSection>
  );
}
