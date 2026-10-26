import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { IPHONE, STATUS_BARS, iphoneLayout, type StatusBar } from "@/lib/devices/iphone";

/**
 * Apple's iPhone 17 Pro around whatever the screen shows, with a real iOS
 * status bar. Children fill the whole screen in CSS px; they clear the status
 * bar and the bottom edge with `var(--iphone-safe-top)` and
 * `var(--iphone-safe-bottom)`. `eager` is for the phone in a page's hero,
 * which is likely its largest paint; every other phone loads lazily.
 */
export function IPhone({
  width = 280,
  statusBar = "light",
  screenBackground,
  eager = false,
  className = "",
  children,
}: Readonly<{
  width?: number;
  statusBar?: StatusBar;
  screenBackground?: string;
  eager?: boolean;
  className?: string;
  children?: ReactNode;
}>) {
  const { height, screen, body, safeTop, safeBottom } = iphoneLayout(width);
  const load = eager ? ({ loading: "eager", fetchPriority: "high" } as const) : {};

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width, height }}>
      {/* The shadow sits under the device body: the bezel itself is never filtered. */}
      <div
        aria-hidden
        className="absolute"
        style={{
          left: body.left,
          top: body.top,
          width: body.width,
          height: body.height,
          borderRadius: body.radius,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.4), 0 8px 20px -4px rgba(0,0,0,0.3)",
        }}
      />
      <div
        className="absolute overflow-hidden isolate"
        style={
          {
            left: screen.left,
            top: screen.top,
            width: screen.width,
            height: screen.height,
            borderRadius: screen.radius,
            backgroundColor: screenBackground,
            "--iphone-safe-top": `${safeTop}px`,
            "--iphone-safe-bottom": `${safeBottom}px`,
          } as CSSProperties
        }
      >
        {children}
        <Image
          src={STATUS_BARS[statusBar]}
          alt=""
          aria-hidden
          width={IPHONE.screen.width * 3}
          height={IPHONE.safeTop * 3}
          sizes={`${Math.ceil(screen.width)}px`}
          className="absolute inset-x-0 top-0 z-50 w-full h-auto pointer-events-none select-none"
          {...load}
        />
      </div>
      <Image
        src={IPHONE.bezel.src}
        alt=""
        aria-hidden
        width={IPHONE.bezel.width}
        height={IPHONE.bezel.height}
        sizes={`${width}px`}
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        {...load}
      />
    </div>
  );
}
