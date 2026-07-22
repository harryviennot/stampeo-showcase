import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { ScrollReveal } from "../ui/ScrollReveal";

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
    <section id="try-it" className="relative py-24 lg:py-32 scroll-mt-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text on the left */}
          <ScrollReveal className="flex flex-col gap-4">
            <span className="inline-block self-start px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold">
              {t("eyebrow")}
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
              {t("title")}
            </h2>
            <p className="text-[var(--muted-foreground)] text-lg max-w-xl">
              {t("subtitle")}
            </p>
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
