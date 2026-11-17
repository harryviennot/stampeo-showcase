import { ImageResponse } from "next/og";
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
  resolveToCanonicalSlug,
  generateFeatureStaticParams,
} from "@/lib/feature-slugs";
import { pageWords } from "@/lib/landing-pages/pages";
import { FEATURE_PREVIEWS } from "@/lib/landing-pages/preview-nav";

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
  const fonts = await loadFonts();

  // The page's own head words, so the share card says what the page's title says.
  const canonical = resolveToCanonicalSlug(slug);
  const meta = canonical ? pageWords(FEATURE_PREVIEWS[canonical], locale, "int").meta : null;
  const title = truncate((meta?.title ?? slug).replace(STAMPEO_SUFFIX, ""), 60);
  const description = meta ? truncate(meta.description, 120) : "";

  const iconPath = canonical ? FEATURES[canonical].icon : undefined;

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
