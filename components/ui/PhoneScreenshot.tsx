import Image from "next/image";
import { IPhone } from "./IPhone";

/**
 * The page colour of the dashboard captures: the status bar sits on it, and it
 * is what shows while the capture loads, so the screen reads as one surface.
 */
const SCREEN = "var(--paper-hover)";

/**
 * A real dashboard capture on Apple's iPhone, below the status bar like a web
 * app on the home screen; the screen's bottom edge cuts it, as on a phone.
 */
export function PhoneScreenshot({
  src,
  alt,
  sizes = "250px",
  eager = false,
}: Readonly<{ src: string; alt: string; sizes?: string; eager?: boolean }>) {
  return (
    <IPhone statusBar="light" screenBackground={SCREEN} eager={eager}>
      <div className="absolute inset-x-0 bottom-0" style={{ top: "var(--iphone-safe-top)" }}>
        <Image
          src={src}
          fill
          alt={alt}
          sizes={sizes}
          className="object-cover object-top"
          {...(eager ? { loading: "eager", fetchPriority: "high" } : {})}
        />
      </div>
    </IPhone>
  );
}
