/* eslint-disable @next/next/no-img-element */
import { getTranslations } from "next-intl/server";
import { CTAButton } from "@/components/ui/CTAButton";
import { ChevronDownIcon } from "@/components/icons";
import { RegionText } from "@/components/market/RegionText";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { splitAccent } from "@/lib/landing-pages/accent";
import { LANDING_PAGES, hasDemoSection, type LandingSlug } from "@/lib/landing-pages/pages";
import { proofFigures } from "@/lib/landing-pages/proof";
import { walletBadges } from "@/lib/store-badges";
import { DashboardDuo } from "./DashboardDuo";
import { LpSection } from "./LpSection";

/**
 * The hero the three argument pages share, centred at every width: H1, sub,
 * trial CTA, demo link, reassurance and proof line, then the official wallet
 * badges and the dashboard on a computer and a phone. The pages differ only by
 * their words.
 */
export async function LpHero({ slug }: Readonly<{ slug: LandingSlug }>) {
  const { hero } = LANDING_PAGES[slug];
  const { before, accent, after } = splitAccent(hero.h1, hero.accent);
  const metrics = await getTranslations("variant.metrics");
  const { businesses, countries } = proofFigures(
    metrics.raw("items") as Array<{ value: string; label: string }>,
  );
  const badges = walletBadges("en");

  return (
    <LpSection section="hero" padding="heroDuo">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h1 className="text-hero text-balance">
          {before}
          <span className="text-[var(--accent)]">{accent}</span>
          {after}
        </h1>
        {hero.sub && (
          <p className="mt-4 max-w-2xl text-pretty text-lead text-[var(--muted-foreground)]">{hero.sub}</p>
        )}

        <div className="mt-7 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6">
          <CTAButton label={SHARED.cta} trackAs="hero" className="w-full sm:w-auto" />
          {hasDemoSection(slug) && (
            // A plain anchor: the click is a scroll, not a contact.
            <a
              href="#demo"
              className="order-3 inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline sm:order-2"
            >
              {SHARED.demoLink}
              <ChevronDownIcon size={16} weight="bold" aria-hidden />
            </a>
          )}
          <p className="order-2 text-sm font-medium text-[var(--muted-foreground)] sm:order-3 sm:basis-full">
            <RegionText raw={SHARED.reassurance} />
          </p>
        </div>

        <p className="mt-5 text-sm text-[var(--muted-foreground)]">{SHARED.proof(businesses, countries)}</p>
      </div>

      {/* The badges are the official artwork, not links: as on /us, they say where the card lives. */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <img src={badges.apple} alt="Apple Wallet" className="h-10 w-auto" />
        <img src={badges.google} alt="Google Wallet" className="h-10 w-auto" />
      </div>

      <div className="mt-8 lg:mt-10">
        <DashboardDuo priority />
      </div>
    </LpSection>
  );
}
