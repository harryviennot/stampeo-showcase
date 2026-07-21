import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CenterCarousel, type CarouselItem } from "@/components/ui/CenterCarousel";
import { CTAButton } from "@/components/ui/CTAButton";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { STAMP_SAMPLES, POINTS_SAMPLES } from "@/lib/loyalty-samples";

function GallerySlide({
  badge,
  accent,
  caption,
  children,
}: {
  badge: string;
  accent: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col items-center gap-3 px-1 pt-2 pb-1">
      <div className="w-full">{children}</div>
      <span
        className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
        style={{ backgroundColor: accent }}
      >
        {badge}
      </span>
      <p className="text-sm text-[var(--muted-foreground)] text-center">
        {caption}
      </p>
    </div>
  );
}

export async function CardStyleGallery() {
  const t = await getTranslations("features.design-de-carte.gallery");
  const tc = await getTranslations("common");
  const stampCaptions = t.raw("stamps") as string[];
  const pointCaptions = t.raw("points") as string[];

  // Per-card fields (localized), zipped by index like the captions. `main`
  // fills the secondary-field row, `aux` the smaller auxiliary row — so the
  // gallery shows the real variable options an owner can put on a card.
  type Field = { label: string; value: string };
  type CardFieldSet = { main?: Field[]; aux?: Field[] };
  const cardFields = t.raw("cardFields") as {
    stamps: CardFieldSet[];
    points: CardFieldSet[];
  };
  const withFields = (
    design: (typeof STAMP_SAMPLES)[number]["design"],
    set: CardFieldSet | undefined
  ) => ({
    ...design,
    secondary_fields: (set?.main ?? []).map((f, k) => ({ key: `m${k}`, ...f })),
    auxiliary_fields: (set?.aux ?? []).map((f, k) => ({ key: `a${k}`, ...f })),
  });

  // Interleave stamp and points samples so a swipe alternates between the two
  // program types instead of grouping them.
  const items: CarouselItem[] = [];
  const count = Math.max(STAMP_SAMPLES.length, POINTS_SAMPLES.length);
  for (let i = 0; i < count; i++) {
    const s = STAMP_SAMPLES[i];
    if (s) {
      items.push({
        key: s.id,
        label: stampCaptions[i] ?? s.id,
        node: (
          <GallerySlide
            badge={tc("stamps")}
            accent="#f97316"
            caption={stampCaptions[i] ?? ""}
          >
            <ScaledCardWrapper baseWidth={280}>
              <WalletCard
                design={withFields(s.design, cardFields?.stamps?.[i])}
                stamps={s.stamps}
                showQR={false}
              />
            </ScaledCardWrapper>
          </GallerySlide>
        ),
      });
    }
    const p = POINTS_SAMPLES[i];
    if (p) {
      items.push({
        key: p.id,
        label: pointCaptions[i] ?? p.id,
        node: (
          <GallerySlide
            badge={tc("points")}
            accent="#8b5cf6"
            caption={pointCaptions[i] ?? ""}
          >
            <ScaledCardWrapper baseWidth={280}>
              <WalletCard
                design={withFields(p.design, cardFields?.points?.[i])}
                pointsBalance={p.pointsBalance}
                pointsRewards={p.pointsRewards}
                showQR={false}
              />
            </ScaledCardWrapper>
          </GallerySlide>
        ),
      });
    }
  }

  return (
    <section className="py-20 sm:py-28 bg-[var(--blog-bg-alt)]">
      <Container>
        <ScrollReveal className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--foreground)]">
            {t("title")}
          </h2>
          <p className="mt-5 text-lg text-[var(--muted-foreground)]">{t("subtitle")}</p>
        </ScrollReveal>
      </Container>

      {/* Edge-to-edge carousel: one style in focus, the rest peeking in */}
      <ScrollReveal delay={120}>
        {/* Small slides mean ~5 are visible at once: clones must cover every
            slide beside the center one (or the track edges show and the loop
            reads as finite), and the darkening grades across two slide widths
            instead of maxing out on the immediate neighbor. */}
        <CenterCarousel
          items={items}
          slideClassName="w-[250px] sm:w-[290px]"
          prevLabel={t("prev")}
          nextLabel={t("next")}
          autoPlayMs={6000}
          clones={5}
          falloffSlides={2.2}
        />
      </ScrollReveal>

      <Container>
        <ScrollReveal delay={160} className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-[var(--muted-foreground)]">{t("ctaLead")}</p>
          <CTAButton label={tc("buttons.startFree")} size="md" />
        </ScrollReveal>
      </Container>
    </section>
  );
}
