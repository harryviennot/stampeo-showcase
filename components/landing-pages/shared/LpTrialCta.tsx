import { RegionText } from "@/components/market/RegionText";
import { Container } from "@/components/ui/Container";
import type { CTALocation } from "@/lib/analytics";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { LpTrialButton } from "./LpTrialButton";

/** The trial button between two sections, centred, with the hero's reassurance line under it. */
export function LpTrialCta({ location }: Readonly<{ location: CTALocation }>) {
  const { SHARED } = useLandingCopy().shared;

  return (
    <Container className="relative z-10 -mt-8 lg:-mt-12">
      <div className="flex flex-col items-center gap-3">
        <LpTrialButton location={location} />
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          <RegionText raw={SHARED.reassurance} />
        </p>
      </div>
    </Container>
  );
}
