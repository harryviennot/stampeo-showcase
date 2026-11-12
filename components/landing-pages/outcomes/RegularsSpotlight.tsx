import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { LpSpotlight } from "../shared/LpSpotlight";
import { SampleCapture } from "../shared/SampleCapture";

/** See your return rate: the capture, then the worked example on one line under the lead, labelled as one. */
export function RegularsSpotlight() {
  const { title, lead, example } = OUTCOMES.regulars;

  return (
    <LpSpotlight
      section="outcome_regulars"
      title={title}
      lead={lead}
      visual={<SampleCapture alt={OUTCOMES.regulars.alt} />}
    >
      <p className="mt-6 max-w-xl text-pretty text-base text-[var(--foreground)]">
        <span className="mr-2 inline-block rounded-full bg-[var(--blog-bg)] px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-[var(--border)]">
          {example.label}
        </span>
        {example.text}
      </p>
    </LpSpotlight>
  );
}
