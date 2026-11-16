import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { PreviewHero } from "../PreviewHero";
import { ReskinCards } from "./ReskinCards";

/**
 * The card design preview's hero: the headline, the sub and the trial on the left, and on the right one wallet
 * card that takes on the look of six shops in turn, with a button either side and a dot for each shop. The second
 * button jumps to the anatomy of the card.
 */
export function ReskinHero() {
  const { reskin, hero } = CARD_DESIGN_PREVIEW;

  return (
    <PreviewHero
      slug="platform/card-design"
      secondary={{ label: hero.secondary, href: "#anatomy" }}
      visual={
        <ReskinCards
          captions={reskin.captions}
          alt={reskin.alt}
          labels={{ previous: reskin.previous, next: reskin.next, dot: reskin.dot }}
        />
      }
    />
  );
}
