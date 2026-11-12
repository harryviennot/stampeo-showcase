import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { CTAButton } from "@/components/ui/CTAButton";
import { ChevronDownIcon } from "@/components/icons";
import { RegionText } from "@/components/market/RegionText";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { splitAccent } from "@/lib/landing-pages/accent";
import { LANDING_PAGES, hasDemoSection, type LandingSlug } from "@/lib/landing-pages/pages";
import { proofFigures } from "@/lib/landing-pages/proof";
import { LpSection } from "./LpSection";

/** The hero every page shares: H1, sub, trial CTA, reassurance, proof line and the page's visual. */
export async function LpHero({
  slug,
  visual,
  crop = false,
}: Readonly<{ slug: LandingSlug; visual?: ReactNode; crop?: boolean }>) {
  const { hero } = LANDING_PAGES[slug];
  const { before, accent, after } = splitAccent(hero.h1, hero.accent);
  const metrics = await getTranslations("variant.metrics");
  const { businesses, countries } = proofFigures(
    metrics.raw("items") as Array<{ value: string; label: string }>,
  );

  return (
    <LpSection section="hero" padding={crop ? "heroCropped" : "hero"}>
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="max-w-2xl lg:col-span-7 lg:max-w-none">
          <h1 className="text-hero text-balance">
            {before}
            <span className="text-[var(--accent)]">{accent}</span>
            {after}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-lead text-[var(--muted-foreground)]">{hero.sub}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
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

        {visual && (
          <div
            className={`flex justify-center lg:col-span-5 lg:justify-end ${
              crop ? "max-h-[340px] overflow-hidden lg:max-h-none lg:overflow-visible" : ""
            }`}
          >
            {visual}
          </div>
        )}
      </div>
    </LpSection>
  );
}
