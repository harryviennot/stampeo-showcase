import type { CSSProperties, ReactNode } from "react";
import { ANDROID, androidLayout, type AndroidStatusBar } from "@/lib/devices/android";

/** The frame's finish: a soft warm metal band around black glass. */
const METAL = "linear-gradient(140deg, #f4f1eb 0%, #d5cfc4 28%, #eeeae3 52%, #cbc4b8 78%, #e4dfd6 100%)";
const BUTTON = "linear-gradient(90deg, #bdb6aa, #e2ddd4)";
const GLASS = "#0b0b0c";

const INK: Record<AndroidStatusBar, string> = { light: "#1f1f1f", dark: "#ffffff" };
const GESTURE: Record<AndroidStatusBar, string> = { light: "rgba(0,0,0,0.78)", dark: "rgba(255,255,255,0.85)" };

/** Android's status bar, drawn on the screen's width: the time on the left; Wi-Fi, signal and battery on the right. */
function StatusBar({ tone }: Readonly<{ tone: AndroidStatusBar }>) {
  const { width } = ANDROID.screen;

  return (
    <svg
      data-status-bar=""
      aria-hidden
      viewBox={`0 0 ${width} ${ANDROID.safeTop}`}
      className="pointer-events-none absolute inset-x-0 top-0 z-50 h-auto w-full select-none"
      fill={INK[tone]}
    >
      <text x="30" y="33" fontSize="16" fontWeight="500" letterSpacing="0.2">
        9:30
      </text>
      <path data-glyph="wifi" d="M328 34 L318 22.6 A15 15 0 0 1 338 22.6 Z" />
      <path data-glyph="signal" d="M344 34 H358 V20 Z" />
      <g data-glyph="battery">
        <rect x="366.5" y="18.5" width="4" height="2" rx="0.6" />
        <rect x="364.25" y="20" width="8.5" height="14" rx="1.8" />
      </g>
    </svg>
  );
}

/**
 * A Pixel-like Android phone around whatever the screen shows, with an Android
 * status bar, a centred punch-hole camera and a gesture bar, all drawn here.
 * Children fill the whole screen in CSS px; they clear the status bar and the
 * gesture bar with `var(--android-safe-top)` and `var(--android-safe-bottom)`.
 */
export function AndroidPhone({
  width = 280,
  statusBar = "light",
  screenBackground,
  className = "",
  children,
}: Readonly<{
  width?: number;
  statusBar?: AndroidStatusBar;
  screenBackground?: string;
  className?: string;
  children?: ReactNode;
}>) {
  const { height, scale, body, screen, camera, buttons, safeTop, safeBottom } = androidLayout(width);

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width, height }}>
      {buttons.map((button) => (
        <div
          key={button.top}
          aria-hidden
          className="absolute"
          style={{
            left: body.left + body.width - 2 * scale,
            top: button.top,
            width: 5 * scale,
            height: button.height,
            borderRadius: 2.5 * scale,
            background: BUTTON,
          }}
        />
      ))}
      <div
        aria-hidden
        className="absolute"
        style={{
          left: body.left,
          top: body.top,
          width: body.width,
          height: body.height,
          borderRadius: body.radius,
          background: METAL,
          boxShadow: `0 0 0 ${0.75 * scale}px rgba(60,48,36,0.28), 0 25px 50px -12px rgba(0,0,0,0.4), 0 8px 20px -4px rgba(0,0,0,0.3), inset 0 0 0 ${0.75 * scale}px rgba(255,255,255,0.6)`,
        }}
      >
        <div
          className="absolute"
          style={{ inset: body.band, borderRadius: body.radius - body.band, backgroundColor: GLASS }}
        />
      </div>
      <div
        className="absolute isolate overflow-hidden"
        style={
          {
            left: screen.left,
            top: screen.top,
            width: screen.width,
            height: screen.height,
            borderRadius: screen.radius,
            backgroundColor: screenBackground,
            "--android-safe-top": `${safeTop}px`,
            "--android-safe-bottom": `${safeBottom}px`,
          } as CSSProperties
        }
      >
        {children}
        <StatusBar tone={statusBar} />
        <div
          aria-hidden
          className="absolute left-1/2 z-50 -translate-x-1/2 rounded-full"
          style={{
            top: camera.top,
            width: camera.diameter,
            height: camera.diameter,
            background: "radial-gradient(circle at 38% 36%, #2b3140 0%, #0d0f14 42%, #000 72%)",
            boxShadow: `0 0 0 ${1.5 * scale}px #000`,
          }}
        />
        <div
          aria-hidden
          className="absolute left-1/2 z-50 -translate-x-1/2 rounded-full"
          style={{ bottom: 9 * scale, width: 112 * scale, height: 4.5 * scale, backgroundColor: GESTURE[statusBar] }}
        />
      </div>
    </div>
  );
}
