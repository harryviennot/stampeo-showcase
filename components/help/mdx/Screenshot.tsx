import Image from "next/image";
import { inferDevice, readHelpImage, type ScreenshotDevice } from "@/lib/help/screenshot";

/**
 * A screenshot at its own proportions, never cropped. The size is read from the
 * file when the page is built, so the box is reserved before the image loads.
 * A phone capture is narrow and centred; a desktop one fills the column.
 */
export function Screenshot({ src, alt = "", device }: { src: string; alt?: string; device?: ScreenshotDevice }) {
  const size = readHelpImage(src);
  const frame = device ?? inferDevice(size);
  const phone = frame === "phone";

  // A span, not a figure: a Markdown image sits inside a paragraph.
  return (
    <span className={`help-shot not-prose my-6 block ${phone ? "mx-auto max-w-[300px]" : ""}`}>
      <Image
        src={src}
        alt={alt}
        width={size.width}
        height={size.height}
        sizes={phone ? "300px" : "(min-width: 1024px) 704px, 100vw"}
        className={`h-auto w-full border border-[var(--border)] ${phone ? "rounded-2xl shadow-sm" : "rounded-xl"}`}
      />
    </span>
  );
}
