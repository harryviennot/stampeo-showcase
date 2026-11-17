import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import type { Market } from "@/lib/markets";
import { PreviewHero } from "../PreviewHero";
import { ReskinCards } from "./ReskinCards";

/**
 * The card design preview's hero: the headline, the sub and the trial on the left, and on the right one wallet
 * card that takes on the look of six shops in turn, with a button either side and a dot for each shop. The second
 * button jumps to the anatomy of the card.
 */
export function ReskinHero({ market }: Readonly<{ market: Market }>) {
  const { reskin, hero, cardFields } = useLandingCopy().previews.cardDesign.CARD_DESIGN_PREVIEW;

  return (
    <PreviewHero
      slug="platform/card-design"
      market={market}
      secondary={{ label: hero.secondary, href: "#anatomy" }}
      visual={
        <ReskinCards
          captions={reskin.captions}
          words={cardFields}
          alt={reskin.alt}
          labels={{ previous: reskin.previous, next: reskin.next, dot: reskin.dot }}
        />
      }
    />
  );
}
