import { PhoneScreenshot } from "@/components/ui/PhoneScreenshot";
import { landingShot } from "@/lib/landing/dashboard-shots";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { PhoneCrop } from "./PhoneCrop";

const shot = landingShot("en", "phone");

/** The dashboard capture, cropped on a phone, with "Sample data" under the crop so it never reads as a promise. */
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
