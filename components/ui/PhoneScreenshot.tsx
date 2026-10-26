import Image from "next/image";
import { PhoneMockup } from "./PhoneMockup";

/**
 * The page colour of the dashboard captures. The status bar behind the frame,
 * the loading placeholder and the bottom fade all use it, so the screen reads
 * as one surface; change it with the captures.
 */
const SCREEN = "var(--paper-hover)";

/**
 * A real dashboard capture in the phone frame, cropped from the bottom with a
 * soft edge. `eager` is for a capture above the fold (it may be the page's
 * largest paint); everything else loads lazily.
 */
export function PhoneScreenshot({
  src,
  alt,
  sizes = "260px",
  eager = false,
}: Readonly<{ src: string; alt: string; sizes?: string; eager?: boolean }>) {
  return (
    <PhoneMockup screenBackground={SCREEN}>
      <div className="relative w-full h-full" style={{ backgroundColor: SCREEN }}>
        <Image
          src={src}
          fill
          alt={alt}
          sizes={sizes}
          className="object-cover object-top"
          {...(eager ? { loading: "eager", fetchPriority: "high" } : {})}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[var(--paper-hover)] to-transparent"
        />
      </div>
    </PhoneMockup>
  );
}
