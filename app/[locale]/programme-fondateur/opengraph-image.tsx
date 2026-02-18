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

export const alt = "Programme Fondateur Stampeo";
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.features" });
  const fonts = await loadFonts();

  const titleRaw = t("programme-fondateur.title")
    .replace(" - Stampeo", "")
    .replace(" | Stampeo", "");
  const title = truncate(titleRaw, 60);
  const description = truncate(t("programme-fondateur.description"), 120);

  return new ImageResponse(
    (
      <OGLayout>
        {/* Stronger orange glow for promotional feel */}
        <div
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BRAND_ORANGE}25 0%, transparent 60%)`,
            display: "flex",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 800 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: 24,
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Highlighted badge */}
          <div style={{ display: "flex", marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: 24,
                background: `${BRAND_ORANGE}20`,
                border: `2px solid ${BRAND_ORANGE}`,
                fontSize: 22,
                fontWeight: 700,
                color: BRAND_ORANGE,
              }}
            >
              3 mois gratuits
            </div>
          </div>

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
        </div>
      </OGLayout>
    ),
    {
      ...size,
      fonts,
    }
  );
}
