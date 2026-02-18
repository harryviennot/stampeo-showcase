import { ImageResponse } from "next/og";
import {
  OG_WIDTH,
  OG_HEIGHT,
  BRAND_ORANGE,
  OGLayout,
  loadFonts,
  truncate,
} from "@/lib/og/shared";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";

export const alt = "Stampeo Blog";
export const size = { width: OG_WIDTH, height: OG_HEIGHT };
export const contentType = "image/png";

export function generateStaticParams() {
  const slugs = getAllSlugs("fr");
  return slugs.map((slug) => ({ locale: "fr", slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const fonts = await loadFonts();

  // Blog is fr-only currently, fall back
  const post = getPostBySlug(slug, locale) ?? getPostBySlug(slug, "fr");
  if (!post) {
    return new ImageResponse(
      (
        <OGLayout>
          <div style={{ fontSize: 48, fontWeight: 700, color: "white", display: "flex" }}>
            Blog Stampeo
          </div>
        </OGLayout>
      ),
      {
        ...size,
        fonts,
      }
    );
  }

  const title = truncate(post.title, 80);

  return new ImageResponse(
    (
      <OGLayout>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 900 }}>
          {/* Category badge */}
          <div style={{ display: "flex", marginBottom: 20 }}>
            <div
              style={{
                display: "flex",
                padding: "6px 16px",
                borderRadius: 20,
                background: `${BRAND_ORANGE}20`,
                border: `1px solid ${BRAND_ORANGE}40`,
                fontSize: 16,
                color: BRAND_ORANGE,
                fontWeight: 400,
              }}
            >
              {post.category}
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              marginBottom: 24,
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Author + reading time */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 20, color: "#d4d4d8", display: "flex" }}>
              {post.author}
            </span>
            <span style={{ fontSize: 20, color: "#52525b", display: "flex" }}>
              &bull;
            </span>
            <span style={{ fontSize: 20, color: "#71717a", display: "flex" }}>
              {post.readingTime}
            </span>
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
