import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import {
  OG_WIDTH,
  OG_HEIGHT,
  BRAND_ORANGE,
  STAMPEO_ICON_PATH,
  OGLayout,
  loadFonts,
  truncate,
} from "@/lib/og/shared";

/** Shared OpenGraph image for the three localized loyalty-programs routes. */
export async function loyaltyOgImage(locale: string) {
  const t = await getTranslations({ locale, namespace: "metadata.loyaltyPrograms" });
  const fonts = await loadFonts();
  const title = truncate(t("title"), 64);
  const description = truncate(t("description"), 120);

  return new ImageResponse(
    (
      <OGLayout>
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
          <svg width="240" height="240" viewBox="0 0 48 48" fill="none">
            <path d={STAMPEO_ICON_PATH} fill={BRAND_ORANGE} />
          </svg>
        </div>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 780 }}>
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
          <div style={{ fontSize: 24, color: "#a1a1aa", lineHeight: 1.4, display: "flex" }}>
            {description}
          </div>
        </div>
      </OGLayout>
    ),
    { width: OG_WIDTH, height: OG_HEIGHT, fonts }
  );
}
