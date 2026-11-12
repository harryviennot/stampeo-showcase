import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { FEATURES } from "@/lib/landing-pages/copy/features";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpSpotlight } from "../shared/LpSpotlight";
import { CroppedPhone } from "./CroppedPhone";

const shot = landingShot("en", "phone");

/**
 * The dashboard's Analytics page on a phone, beside its heading. Only the
 * phone is cropped on a phone-sized screen; the "Sample data" caption sits
 * below the crop, because the capture shows a sample café's numbers and must
 * not read as a promise.
 */
export function AnalyticsSpotlight() {
  return (
    <LpSpotlight
      section="spotlight_analytics"
      title={FEATURES.analytics.title}
      lead={FEATURES.analytics.lead}
      side="left"
      visual={
        <figure className="flex w-full flex-col items-center lg:mx-auto lg:w-auto">
          <CroppedPhone>
            <PhoneScreenshot src={shot.src} alt={FEATURES.analytics.alt} />
          </CroppedPhone>
          <figcaption className="mt-4 text-sm text-[var(--muted-foreground)]">{SHARED.sampleData}</figcaption>
        </figure>
      }
    />
  );
}
