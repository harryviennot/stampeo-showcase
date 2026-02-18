import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import {
  OG_WIDTH,
  OG_HEIGHT,
  BRAND_ORANGE,
  OGLayout,
  loadFonts,
  truncate,
} from "@/lib/og/shared";

export const alt = "Stampeo Feature";
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";

const FEATURE_SLUGS = [
  "design-de-carte",
  "scanner-mobile",
  "notifications-push",
  "analytiques",
  "geolocalisation",
] as const;

export function generateStaticParams() {
  return FEATURE_SLUGS.map((slug) => ({ slug }));
}

// Simple SVG icon paths per feature
const FEATURE_ICONS: Record<string, string> = {
  "design-de-carte":
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  "scanner-mobile":
    "M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM7 4V3h10v1H7zm0 2h10v12H7V6zm0 14h10v1H7v-1z",
  "notifications-push":
    "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  analytiques:
    "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
  geolocalisation:
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
};

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.features" });
  const fonts = await loadFonts();

  const titleRaw = t.has(`${slug}.title`)
    ? t(`${slug}.title`).replace(" - Stampeo", "").replace(" | Stampeo", "")
    : slug;
  const title = truncate(titleRaw, 60);
  const description = t.has(`${slug}.description`)
    ? truncate(t(`${slug}.description`), 120)
    : "";

  const iconPath = FEATURE_ICONS[slug];

  return new ImageResponse(
    (
      <OGLayout>
        {/* Large faded feature icon */}
        {iconPath && (
          <div
            style={{
              position: "absolute",
              right: 80,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              opacity: 0.1,
            }}
          >
            <svg width="220" height="220" viewBox="0 0 24 24" fill="none">
              <path d={iconPath} fill={BRAND_ORANGE} />
            </svg>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 750 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: 16,
              display: "flex",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                fontSize: 24,
                color: "#a1a1aa",
                lineHeight: 1.4,
                display: "flex",
              }}
            >
              {description}
            </div>
          )}
        </div>
      </OGLayout>
    ),
    {
      ...size,
      fonts,
    }
  );
}
