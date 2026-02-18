import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import {
  OG_WIDTH,
  OG_HEIGHT,
  OGLayout,
  loadFonts,
} from "@/lib/og/shared";

export const alt = "Blog Stampeo";
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <OGLayout>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 800 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              marginBottom: 16,
              display: "flex",
            }}
          >
            Le Blog Stampeo
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#a1a1aa",
              lineHeight: 1.4,
              display: "flex",
            }}
          >
            {t("description")}
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
