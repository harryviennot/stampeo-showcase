import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CTAButton } from "../ui/CTAButton";
import { Container } from "../ui/Container";
import { FanParallax } from "./FanParallax";
import { HeroCardFan } from "./HeroCardFan";
import { walletBadges } from "@/lib/store-badges";

export async function VariantHero() {
  const t = await getTranslations("variant.hero");
  const locale = await getLocale();
  const badges = walletBadges(locale);

  return (
    /* The header is fixed, so the hero needs to clear it by more than a normal
       section's top padding or the arch sits right under the nav. */
    <section className="relative pt-24 lg:pt-28 pb-16 lg:pb-24">
      <FanParallax>
        <HeroCardFan />
      </FanParallax>

      {/* The copy rises into the arch so the lower cards flank the headline.
          Its wrapper spans the full width, so it has to stay transparent to
          the pointer or it would eat hover on the cards behind it. */}
      <Container className="relative z-10 pointer-events-none -mt-10 lg:-mt-14 xl:-mt-24">
        <ScrollReveal className="pointer-events-auto mx-auto max-w-2xl text-center flex flex-col items-center gap-7">
          <div>
            <h1 className="text-display mb-5">
              {t.rich("title", {
                accent: (chunks) => <span className="text-[var(--accent)]">{chunks}</span>,
              })}
            </h1>

            <p className="text-lead text-[var(--muted-foreground)]">
              {t("subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-4 items-center justify-center">
            <CTAButton label={t("primaryCta")} trackAs="hero" />
            {/* The real interactive demo lives further down; this jumps to it. */}
            <a
              href="#try-it"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              {t("tryDemoCta")}
              <svg
                className="w-4 h-4 group-hover:translate-y-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </a>
          </div>

          <div className="flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badges.apple} alt="Apple Wallet" className="h-10 w-auto" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={badges.google} alt="Google Wallet" className="h-10 w-auto" />
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
