import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { PhoneCrop } from "./PhoneCrop";

const shot = landingShot("en", "phone");

/**
 * The dashboard capture on a phone, cropped on a phone-sized screen. The
 * "Sample data" caption sits under the crop, never inside it: the capture shows
 * a sample café's numbers and must not read as a promise.
 */
export function SampleCapture({ alt }: Readonly<{ alt: string }>) {
  return (
    <figure className="flex w-full flex-col items-center lg:w-auto">
      <PhoneCrop>
        <PhoneScreenshot src={shot.src} alt={alt} />
      </PhoneCrop>
      <figcaption className="mt-4 text-sm text-[var(--muted-foreground)]">{SHARED.sampleData}</figcaption>
    </figure>
  );
}
