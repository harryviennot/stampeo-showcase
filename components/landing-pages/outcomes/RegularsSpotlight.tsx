import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpSpotlight } from "../shared/LpSpotlight";

const shot = landingShot("en", "phone");

/**
 * The dashboard capture, cut at 420px on a phone with its "Sample data"
 * caption under the cut (so the caption is never cropped away), then the
 * worked example on one line under the lead.
 */
function RegularsCapture() {
  return (
    <figure className="flex flex-col items-center">
      <div className="max-h-[420px] overflow-hidden lg:max-h-none lg:overflow-visible">
        <PhoneScreenshot src={shot.src} alt={OUTCOMES.regulars.alt} />
      </div>
      <figcaption className="mt-3 text-center text-sm text-[var(--muted-foreground)]">{SHARED.sampleData}</figcaption>
    </figure>
  );
}

/** See your return rate: the capture, then the example, labelled as one. */
export function RegularsSpotlight() {
  const { title, lead, example } = OUTCOMES.regulars;

  return (
    <LpSpotlight section="outcome_regulars" title={title} lead={lead} visual={<RegularsCapture />}>
      <p className="mt-6 max-w-xl text-pretty text-base text-[var(--foreground)]">
        <span className="mr-2 inline-block rounded-full bg-[var(--blog-bg)] px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-[var(--border)]">
          {example.label}
        </span>
        {example.text}
      </p>
    </LpSpotlight>
  );
}
