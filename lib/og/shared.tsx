import { readFile } from "fs/promises";
import { join } from "path";
import type { ReactNode } from "react";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
export const BRAND_ORANGE = "#f97316";
export const DARK_BG = "#0a0a0a";
export const DARK_BG_END = "#1a1020";

// Asterisk SVG path extracted from public/icon.svg
export const STAMPEO_ICON_PATH =
  "M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z";

let regularCache: ArrayBuffer | null = null;
let boldCache: ArrayBuffer | null = null;

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  const ab = new ArrayBuffer(buf.byteLength);
  const view = new Uint8Array(ab);
  view.set(new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength));
  return ab;
}

export async function loadFonts(): Promise<
  { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[]
> {
  if (!regularCache) {
    regularCache = toArrayBuffer(
      await readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf"))
    );
  }
  if (!boldCache) {
    boldCache = toArrayBuffer(
      await readFile(join(process.cwd(), "assets/fonts/Geist-Bold.ttf"))
    );
  }
  return [
    { name: "Geist", data: regularCache, weight: 400, style: "normal" },
    { name: "Geist", data: boldCache, weight: 700, style: "normal" },
  ];
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "\u2026";
}

export function OGLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${DARK_BG} 0%, ${DARK_BG_END} 100%)`,
      }}
    >
      {/* Radial orange glow */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${BRAND_ORANGE}18 0%, transparent 70%)`,
          display: "flex",
        }}
      />

      {/* Large faded asterisk, bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: -40,
          right: -20,
          display: "flex",
          opacity: 0.08,
        }}
      >
        <svg width="280" height="280" viewBox="0 0 48 48" fill="none">
          <path d={STAMPEO_ICON_PATH} fill={BRAND_ORANGE} fillRule="evenodd" />
        </svg>
      </div>

      {/* Top-left brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "40px 48px 0",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
          <path d={STAMPEO_ICON_PATH} fill={BRAND_ORANGE} fillRule="evenodd" />
        </svg>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.02em",
          }}
        >
          Stampeo
        </span>
      </div>

      {/* Main content area */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 48px",
        }}
      >
        {children}
      </div>

      {/* Bottom orange gradient bar */}
      <div
        style={{
          height: 4,
          width: "100%",
          background: `linear-gradient(90deg, ${BRAND_ORANGE} 0%, ${BRAND_ORANGE}40 100%)`,
          display: "flex",
        }}
      />
    </div>
  );
}
