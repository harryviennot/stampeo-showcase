import { FEATURES } from "@/lib/landing-pages/copy/features";
import { LpSpotlight } from "../shared/LpSpotlight";
import { SampleCapture } from "../shared/SampleCapture";

/** The dashboard's Analytics page on a phone, beside its heading. */
export function AnalyticsSpotlight() {
  return (
    <LpSpotlight
      section="spotlight_analytics"
      title={FEATURES.analytics.title}
      lead={FEATURES.analytics.lead}
      side="left"
      visual={<SampleCapture alt={FEATURES.analytics.alt} />}
    />
  );
}
