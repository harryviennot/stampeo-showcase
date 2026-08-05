import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "../ui/Container";
import { ScrollReveal } from "../ui/ScrollReveal";
import { InkArrow, InkNote } from "../ui/InkAnnotation";
import { ArrowRightIcon } from "../icons";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { STAMP_SAMPLES, POINTS_SAMPLES } from "@/lib/loyalty-samples";
import { getLocalizedSlug } from "@/lib/feature-slugs";

/**
 * Compact bridge to the card-design feature page. The loyalty page's job is
 * the stamps-vs-points decision; styling the card is the designer page's job,
 * so this section only teases it: a small fan of sample cards and one link.
 */
export async function DesignTeaser() {
  const t = await getTranslations("loyalty.designTeaser");
  const locale = await getLocale();
  const designerHref = `/features/${getLocalizedSlug("design-de-carte", locale)}`;

  const stamp = STAMP_SAMPLES.find((s) => s.id === "aurevo") ?? STAMP_SAMPLES[0];
  const points = POINTS_SAMPLES[0];
  const ring = POINTS_SAMPLES.find((p) => p.id === "salon") ?? POINTS_SAMPLES[1];

  return (
    <section className="py-20 sm:py-28 bg-[var(--blog-bg-alt)] overflow-hidden">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto">
          <h2 className="text-h2 text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-5 text-lead text-[var(--muted-foreground)]">{t("subtitle")}</p>
        </ScrollReveal>

        {/* Fan of sample cards, pure decoration for the link below */}
        <ScrollReveal delay={120}>
          <div className="relative mt-12">
            {/* Margin note over the fan, tying back to the 3-minute promise. */}
            <div className="hidden sm:flex absolute -top-6 right-[6%] lg:right-[22%] flex-col items-start z-20">
              <InkNote rotate={3}>{t("annotation")}</InkNote>
              <InkArrow variant="downLeft" className="w-9 mt-1 ml-2" delay={0.4} />
            </div>
            <div
              className="flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-[135px] sm:w-[230px] -mr-12 -rotate-6 translate-y-3 opacity-90">
                <ScaledCardWrapper baseWidth={230}>
                  <WalletCard
                    design={ring.design}
                    pointsBalance={ring.pointsBalance}
                    pointsRewards={ring.pointsRewards}
                    showQR={false}
                  />
                </ScaledCardWrapper>
              </div>
              <div className="w-[180px] sm:w-[250px] relative z-10">
                <ScaledCardWrapper baseWidth={250}>
                  <WalletCard design={stamp.design} stamps={stamp.stamps} showQR={false} />
                </ScaledCardWrapper>
              </div>
              <div className="w-[135px] sm:w-[230px] -ml-12 rotate-6 translate-y-3 opacity-90">
                <ScaledCardWrapper baseWidth={230}>
                  <WalletCard
                    design={points.design}
                    pointsBalance={points.pointsBalance}
                    pointsRewards={points.pointsRewards}
                    showQR={false}
                  />
                </ScaledCardWrapper>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={160} className="mt-10 text-center">
          <Link
            href={designerHref as "/features/design-de-carte"}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-6 py-3 font-bold text-[var(--foreground)] shadow-sm transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] hover:shadow-md"
          >
            {t("cta")}
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </Container>
    </section>
  );
}
