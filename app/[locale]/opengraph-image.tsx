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

export const alt = "Stampeo";
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  const fonts = await loadFonts();

  const title = truncate(
    t("title").replace(" - Stampeo", "").replace(" | Stampeo", "").replace("Stampeo - ", ""),
    80
  );
  const description = t("description");

  return new ImageResponse(
    (
      <OGLayout>
        {/* Decorative overlapping card shapes */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
          }}
        >
          <div
            style={{
              width: 200,
              height: 130,
              borderRadius: 16,
              border: `2px solid ${BRAND_ORANGE}30`,
              position: "absolute",
              top: -20,
              left: 20,
              transform: "rotate(6deg)",
              display: "flex",
            }}
          />
          <div
            style={{
              width: 200,
              height: 130,
              borderRadius: 16,
              border: `2px solid ${BRAND_ORANGE}50`,
              position: "absolute",
              top: 10,
              left: -10,
              transform: "rotate(-3deg)",
              display: "flex",
            }}
          />
        </div>

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
          <div
            style={{
              fontSize: 22,
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
