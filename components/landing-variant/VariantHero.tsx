import { getLocale, getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CTAButton } from "../ui/CTAButton";
import { Container } from "../ui/Container";
import { HeroWalletCard } from "./HeroWalletCard";

/** Apple and Google publish these badges per language; use their art, not ours. */
function walletBadges(locale: string) {
  if (locale === "fr") {
    return { apple: "/AppleWalletFR.svg", google: "/GoogleWalletFR.svg" };
  }
  if (locale === "es") {
    return { apple: "/AppleWalletES.svg", google: "/GoogleWalletES.svg" };
  }
  return { apple: "/AppleWallet.svg", google: "/GoogleWallet.svg" };
}

export async function VariantHero() {
  const t = await getTranslations("variant.hero");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const badges = walletBadges(locale);

  return (
    <section className="relative py-16 lg:py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-16 items-center">
          <ScrollReveal className="flex flex-col gap-8">
            <div>
              <h1 className="text-display mb-5">
                {t.rich("title", {
                  accent: (chunks) => <span className="text-[var(--accent)]">{chunks}</span>,
                })}
              </h1>

              <p className="text-lead text-[var(--muted-foreground)] max-w-xl">
                {t("subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <CTAButton label={t("primaryCta")} trackAs="hero" />
            </div>

            <p className="text-sm text-[var(--muted-foreground)] font-medium">
              {t("reassurance")}
            </p>

            <div className="flex items-center gap-3 pt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={badges.apple} alt="Apple Wallet" className="h-10 w-auto" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={badges.google} alt="Google Wallet" className="h-10 w-auto" />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200} className="flex flex-col items-center gap-6">
            <HeroWalletCard
              organizationName="Stampeo"
              rewardLabel={tCommon("reward")}
              rewardText={tCommon("rewardText")}
            />
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
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
