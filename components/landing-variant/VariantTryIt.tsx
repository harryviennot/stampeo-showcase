import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { ScrollReveal } from "../ui/ScrollReveal";
import { InkArrow, InkNote } from "../ui/InkAnnotation";

const HeroDemo = dynamic(() => import("../sections/HeroDemo").then((m) => m.HeroDemo));

/**
 * "Try it yourself" — the live, no-signup wallet demo, given its own section
 * after How-It-Works so visitors read the pitch before playing with it. The
 * hero's "Try the live demo" button anchors here (#try-it). `scroll-mt` offsets
 * the sticky header so the heading isn't hidden under it after the jump.
 */
export async function VariantTryIt() {
  const t = await getTranslations("variant.tryIt");

  return (
    <section id="try-it" className="relative py-16 lg:py-24 scroll-mt-24">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text on the left */}
          <ScrollReveal className="flex flex-col gap-4">
            <span className="inline-block self-start px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold">
              {t("eyebrow")}
            </span>
            <h2 className="text-h2">
              {t("title")}
            </h2>
            <p className="text-lead text-[var(--muted-foreground)] max-w-xl">
              {t("subtitle")}
            </p>

            {/* Margin note pointing at the demo: right on desktop, down at
                the stacked card on mobile. */}
            <div className="flex items-end gap-3 mt-1">
              <InkNote rotate={-2}>{t("annotation")}</InkNote>
              <InkArrow variant="right" className="hidden lg:block w-14 mb-1" delay={0.5} />
              <InkArrow variant="down" className="lg:hidden w-7" delay={0.5} />
            </div>
          </ScrollReveal>

          {/* Interactive card on the right */}
          <ScrollReveal delay={150} className="flex flex-col items-center">
            <HeroDemo />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
