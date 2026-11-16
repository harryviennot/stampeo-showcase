import type { CSSProperties, ReactNode } from "react";
import { IPhone } from "@/components/ui/IPhone";

/**
 * The Scanner app's own colours (scanner-app `src/constants/colors.ts`, the auth
 * tokens, and the sample café's brand as the Scanner loop shows it), for the
 * screens drawn on this page.
 */
export const APP = {
  surface: "#f6f4f5",
  paper: "#f0efe9",
  field: "#faf9f6",
  ink: "#2d3436",
  muted: "#6b7280",
  faint: "#9ca3af",
  line: "#ddd9d0",
  /** Aurevo's brand, the action colour inside the café's own screens. */
  brand: "#492c2a",
  /** Stampeo's orange, the one action on a screen shown before a business is chosen. */
  orange: "#f97316",
  amber: "#d97706",
  amberTint: "rgba(245, 158, 11, 0.16)",
} as const;

/** A screen cut short with a fade, on the same iPhone as the Scanner loop: a toggle pane's picture. */
export function PhoneScreen({
  label,
  background = APP.surface,
  children,
}: Readonly<{ label: string; background?: string; children: ReactNode }>) {
  return (
    <div
      role="img"
      aria-label={label}
      className="-mx-6 -mt-6 flex max-h-[404px] w-[calc(100%+3rem)] justify-center overflow-hidden px-6 pt-6 [mask-image:linear-gradient(to_bottom,#000_82%,transparent)]"
    >
      <IPhone width={270} statusBar="light" screenBackground={background}>
        <div aria-hidden className="px-4" style={{ paddingTop: "calc(var(--iphone-safe-top) + 14px)" } as CSSProperties}>
          {children}
        </div>
      </IPhone>
    </div>
  );
}
