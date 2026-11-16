import type { ReactNode } from "react";
import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import type { PreviewSlug } from "@/lib/landing-pages/pages";
import { HeroWords } from "../platform/hero/HeroWords";
import { LpCtaPair, type SecondaryAction } from "../platform/LpCtaPair";
import { LpSection } from "../shared/LpSection";

/**
 * The hero of a feature preview: the headline with its accent, the sub, the trial and second actions and their
 * reassurance on the left, the page's `visual` on the right. On a phone they run in that order, centred; from
 * `lg` the words are left-aligned beside the visual. The second action is "Try it on your phone" to the demo
 * unless the page names its own or passes `null`.
 */
export function PreviewHero({
  slug,
  visual,
  secondary,
}: Readonly<{
  slug: PreviewSlug;
  visual: ReactNode;
  secondary?: SecondaryAction | null;
}>) {
  return (
    <LpSection section="hero" bare>
      <section className="relative pt-24 pb-10 lg:pt-28 lg:pb-14">
        <Container>
          <div className="grid gap-y-8 lg:grid-cols-12 lg:items-center lg:gap-x-12">
            <div className="text-center lg:col-span-6 lg:text-left">
              <HeroWords slug={slug} look="column" />

              <div className="mt-7 flex flex-col items-center gap-3 lg:items-start">
                <div className="w-full lg:[&>div]:justify-start">
                  <LpCtaPair location="hero" secondary={secondary} />
                </div>
                <p className="text-sm font-medium text-[var(--muted-foreground)]">
                  <RegionText raw={SHARED.reassurance} />
                </p>
              </div>
            </div>

            <div className="flex min-w-0 justify-center lg:col-span-6">{visual}</div>
          </div>
        </Container>
      </section>
    </LpSection>
  );
}
