import { LiveActivityFeed } from "@/components/features/analytics/LiveActivityFeed";
import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpSpotlight } from "../shared/LpSpotlight";
import { PhoneCrop } from "../shared/PhoneCrop";

/**
 * The top of the Analytics page on a phone (the every-plan charts), with the live feed floating over its lower
 * half, and "Sample data" under both. The feed overlaps the faded cut on a
 * phone and hangs off the phone's lower left from `lg`.
 */
function LayeredCapture() {
  const shot = landingShot("en", "phone");

  return (
    <figure className="flex w-full flex-col items-center lg:w-auto">
      <div className="relative flex w-full flex-col items-center lg:w-[420px] lg:pb-16 lg:pl-24">
        <PhoneCrop height={360}>
          <PhoneScreenshot src={shot.src} alt={FEATURES.analytics.alt} />
        </PhoneCrop>
        <div className="relative z-10 -mt-24 w-full max-w-[340px] lg:absolute lg:bottom-0 lg:left-0 lg:mt-0 lg:w-[340px]">
          <LiveActivityFeed cardOnly stillWhenReduced />
        </div>
      </div>
      <figcaption className="mt-4 text-sm text-[var(--muted-foreground)]">{SHARED.sampleData}</figcaption>
    </figure>
  );
}

/** See who keeps coming back: the layered capture beside its heading. */
export function AnalyticsSpotlight() {
  return (
    <LpSpotlight
      section="spotlight_analytics"
      title={FEATURES.analytics.title}
      lead={FEATURES.analytics.lead}
      visual={<LayeredCapture />}
      tinted
    />
  );
}
