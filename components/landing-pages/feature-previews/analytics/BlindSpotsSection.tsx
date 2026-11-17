import { BlindSpotCards } from "@/components/features/analytics/BlindSpotCards";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { LpSection } from "../../shared/LpSection";

/** Production's six blind-spot cards, each turning from its question to ???, under the preview's own heading. */
export function BlindSpotsSection() {
  const { eyebrow, title, lead, questions, noAnswer } = useLandingCopy().previews.analytics.ANALYTICS_PREVIEW.blindSpots;

  return (
    <LpSection section="blind_spots" tinted eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className="mx-auto max-w-[1040px]">
        <BlindSpotCards questions={questions} noAnswer={noAnswer} bare />
      </div>
    </LpSection>
  );
}
