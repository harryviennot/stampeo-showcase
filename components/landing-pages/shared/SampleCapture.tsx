import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { landingShot, type ShotView } from "@/lib/landing/dashboard-shots";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { PhoneCrop, type PhoneCropHeight } from "./PhoneCrop";

/**
 * A capture of the dashboard on a phone (`view`: the top of Analytics, how
 * often customers come, or the busiest times), cropped on a phone at `crop`
 * px, with "Sample data" under it so it never reads as a promise.
 */
export function SampleCapture({
  alt,
  view = "phone",
  crop = 440,
}: Readonly<{ alt: string; view?: Exclude<ShotView, "desktop">; crop?: PhoneCropHeight }>) {
  const shot = landingShot("en", view);

  return (
    <figure className="flex w-full flex-col items-center lg:w-auto">
      <PhoneCrop height={crop}>
        <PhoneScreenshot src={shot.src} alt={alt} />
      </PhoneCrop>
      <figcaption className="mt-4 text-sm text-[var(--muted-foreground)]">{SHARED.sampleData}</figcaption>
    </figure>
  );
}
