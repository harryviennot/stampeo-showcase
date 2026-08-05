import { getTranslations } from "next-intl/server";

import { FAN_SLOTS, resolveFanCard, slotStyle } from "@/lib/hero-fan";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { WalletCard } from "../card/WalletCard";
import { InkArrow, InkNote } from "../ui/InkAnnotation";

/**
 * The hero's arch of cards: seven real sample designs from the brand bank,
 * dealt out from the middle. Decoration — the headline in front of it carries
 * the message — so the whole strip is aria-hidden.
 *
 * Deliberately not <ScrollReveal>: that would add a second opacity/translate
 * on top of the deal-in. The `data-sr` attribute is all ScrollRevealInit needs
 * to hand the strip its `.revealed` class.
 *
 * No interactive3D on these — its mouse-tilt writes a transform straight onto
 * the card element, which would fight the fan's rotation. The tilt stays on
 * the demo card further down the page.
 */
export async function HeroCardFan() {
  const t = await getTranslations("variant.hero");

  return (
    <div
      data-sr
      aria-hidden="true"
      /* `@container` makes this the box the slots measure their drop against
         (1cqw = 1% of this width), which is what holds the arc to a circle at
         every viewport. The height sets where the copy starts, so it has to
         clear the inner pair; the outer pairs hang below it on purpose, down
         the flanks of the headline. */
      className="@container relative z-0 mx-auto max-w-[1800px] select-none h-[clamp(240px,62vw,280px)] sm:h-[clamp(320px,41vw,360px)] lg:h-[clamp(380px,30vw,470px)]"
    >
      {FAN_SLOTS.map((slot) => {
        const card = resolveFanCard(slot.cardId);
        return (
          <div
            key={slot.index}
            className={`fan-slot ${slot.visibility}`}
            style={slotStyle(slot)}
          >
            <div className="fan-deal">
              <div className="fan-tilt">
                <ScaledCardWrapper minScale={0.3}>
                  {card.kind === "stamps" ? (
                    <WalletCard
                      design={card.sample.design}
                      stamps={card.sample.stamps}
                      showQR={false}
                    />
                  ) : (
                    <WalletCard
                      design={card.sample.design}
                      pointsBalance={card.sample.pointsBalance}
                      pointsRewards={card.sample.pointsRewards}
                      showQR={false}
                    />
                  )}
                </ScaledCardWrapper>
              </div>
            </div>
          </div>
        );
      })}

      {/* Margin note on the right wing of the arch, pointing down at the cards.
          Only where there is room beside the copy, and only once the deal has
          finished. */}
      {/* <div className="hidden xl:flex absolute top-6 right-[3%] z-40 flex-col items-start pointer-events-none">
        <InkNote rotate={4}>{t("annotation")}</InkNote>
        <InkArrow variant="downLeft" className="w-10 mt-1 ml-3" delay={1.1} />
      </div> */}
    </div>
  );
}
