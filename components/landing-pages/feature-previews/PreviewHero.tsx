import type { ReactNode } from "react";
import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import type { PlanChip as Plan } from "@/lib/landing-pages/copy/types";
import type { PreviewSlug } from "@/lib/landing-pages/pages";
import { HeroWords } from "../platform/HeroWords";
import { LpCtaPair, type SecondaryAction } from "../platform/LpCtaPair";
import { LpSection } from "../shared/LpSection";

/**
 * The hero of a feature preview whose picture is not the card fan: a small
 * label, the headline with its accent, the sub, the trial and second actions
 * and their reassurance, then the page's `visual` under them, so on a phone the
 * words come first. The second action is "Try it on your phone" to the demo
 * unless the page names its own or passes `null`; `eyebrowPlan` sets a plan
 * chip beside the label, and `eyebrowChip` a plain one ("Coming soon").
 */
export function PreviewHero({
  slug,
  visual,
  secondary,
  eyebrowPlan,
  eyebrowChip,
}: Readonly<{
  slug: PreviewSlug;
  visual: ReactNode;
  secondary?: SecondaryAction | null;
  eyebrowPlan?: Plan;
  eyebrowChip?: string;
}>) {
  return (
    <LpSection section="hero" bare>
      <section className="relative pt-24 pb-10 lg:pt-28 lg:pb-14">
        <Container>
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <HeroWords slug={slug} look="column" eyebrowPlan={eyebrowPlan} eyebrowChip={eyebrowChip} />

            <div className="mt-7 flex w-full flex-col items-center gap-3">
              <LpCtaPair location="hero" secondary={secondary} />
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                <RegionText raw={SHARED.reassurance} />
              </p>
            </div>
          </div>

          <div className="mt-8 lg:mt-10">{visual}</div>
        </Container>
      </section>
    </LpSection>
  );
}
