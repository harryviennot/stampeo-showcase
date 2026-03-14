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
import {
  FEATURES,
  isValidSlug,
  generateFeatureStaticParams,
} from "@/lib/feature-slugs";

export const alt = "Stampeo Feature";
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";

export function generateStaticParams() {
  return generateFeatureStaticParams();
}

const STAMPEO_SUFFIX = / [|\-–] Stampeo$/i;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.features" });
  const fonts = await loadFonts();

  const titleRaw = t.has(`${slug}.title`)
    ? t(`${slug}.title`).replace(STAMPEO_SUFFIX, "")
    : slug;
  const title = truncate(titleRaw, 60);
  const description = t.has(`${slug}.description`)
    ? truncate(t(`${slug}.description`), 120)
    : "";

  const iconPath = isValidSlug(slug) ? FEATURES[slug].icon : undefined;

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
