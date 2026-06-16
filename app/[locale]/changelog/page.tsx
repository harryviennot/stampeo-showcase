import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Sparkle, ArrowUp, Bug } from "@phosphor-icons/react/dist/ssr";

import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/ui/Container";
import { ChangelogAccordion } from "@/components/ui/ChangelogAccordion";
import {
  type ChangelogArea,
  type ChangelogCategory,
  type ChangelogItem,
  type ChangelogRelease,
  CATEGORY_ORDER,
  areaLabel,
  formatReleaseDate,
  getPublicChangelog,
  resolve,
} from "@/lib/changelog";
import { areaDotHex } from "@/lib/changelog-areas";

// Render on demand: the page fetches the changelog live (no ISR cache) so a
// newly published release shows immediately and an empty response is never
// stranded in the cache.
export const dynamic = "force-dynamic";

const CATEGORY_ICON: Record<ChangelogCategory, typeof Sparkle> = {
  feature: Sparkle,
  improvement: ArrowUp,
  fix: Bug,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "changelog" });
  const canonical = locale === "fr" ? "/changelog" : `/${locale}/changelog`;
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: {
      canonical,
      languages: { fr: "/changelog", en: "/en/changelog" },
    },
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
    },
  };
}

/** Trusted (superadmin-authored) Markdown — used for both the release article
 *  body and per-item details (bold, links, lists, embedded images, inline HTML
 *  like <u>). Falls back to plain text if MDX compilation chokes on stray
 *  syntax. `className` styles the prose; `fallbackClassName` the plain-text
 *  fallback (so a compact item body and a full article body can share it). */
async function MarkdownBody({
  source,
  className = "prose prose-sm sm:prose-base mt-3 max-w-none text-[var(--foreground)]/75 prose-headings:text-[var(--foreground)] prose-a:text-[var(--accent)]",
  fallbackClassName = "mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--foreground)]/75",
}: {
  source: string;
  className?: string;
  fallbackClassName?: string;
}) {
  if (!source.trim()) return null;
  let content: React.ReactNode = null;
  let failed = false;
  try {
    const compiled = await compileMDX({
      source,
      options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
    });
    content = compiled.content;
  } catch {
    failed = true;
  }
  if (failed) {
    return <p className={fallbackClassName}>{source}</p>;
  }
  return <div className={className}>{content}</div>;
}

/** Linear-style area tag: a neutral pill with a small colored dot. */
function AreaChip({
  area,
  locale,
  size = "md",
}: {
  area: ChangelogArea;
  locale: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--foreground)]/10 bg-[var(--foreground)]/[0.04] font-medium text-[var(--foreground)]/75 ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: areaDotHex(area.color) }}
      />
      {areaLabel(area, locale)}
    </span>
  );
}

function ItemRow({
  item,
  area,
  locale,
  forTeamLabel,
}: {
  item: ChangelogItem;
  area: ChangelogArea | undefined;
  locale: string;
  forTeamLabel: string;
}) {
  const title = resolve(item.title_fr, item.title_en, locale);
  const body = resolve(item.body_fr, item.body_en, locale);
  const teamOnly = (item.affects ?? []).includes("scanner") &&
    !(item.affects ?? []).includes("owner");
  return (
    <li className="flex flex-col items-start gap-1.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3">
      {area && <AreaChip area={area} locale={locale} size="sm" />}
      <div className="min-w-0">
        <span className="text-[15px] font-medium text-[var(--foreground)]">
          {title}
        </span>
        {teamOnly && (
          <span className="ml-2 text-[11px] font-medium text-[var(--accent)]">
            {forTeamLabel}
          </span>
        )}
        {body && (
          <MarkdownBody
            source={body}
            className="prose prose-sm mt-0.5 max-w-none text-[14px] leading-relaxed text-[var(--foreground)]/65 prose-p:my-1 prose-headings:text-[var(--foreground)] prose-a:text-[var(--accent)]"
            fallbackClassName="mt-0.5 text-[14px] leading-relaxed text-[var(--foreground)]/65"
          />
        )}
      </div>
    </li>
  );
}

/** One category block. "New Features" stays open and prominent; Improvements
 *  and Fixes collapse into a native <details> accordion (server-friendly — no
 *  client JS), collapsed by default, Linear-style. */
function CategoryGroup({
  cat,
  list,
  areaBySlug,
  locale,
  t,
}: {
  cat: ChangelogCategory;
  list: ChangelogItem[];
  areaBySlug: Map<string, ChangelogArea>;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const Icon = CATEGORY_ICON[cat];
  const itemList = (
    <ul className="mt-1 divide-y divide-[var(--foreground)]/[0.06]">
      {list.map((item) => (
        <ItemRow
          key={item.id}
          item={item}
          area={item.area ? areaBySlug.get(item.area) : undefined}
          locale={locale}
          forTeamLabel={t("forTeam")}
        />
      ))}
    </ul>
  );

  if (cat === "feature") {
    return (
      <div>
        <div className="flex items-center gap-2">
          <Icon weight="bold" className="h-4 w-4 text-[var(--foreground)]/45" />
          <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground)]/55">
            {t(`categories.${cat}`)}
          </h3>
        </div>
        {itemList}
      </div>
    );
  }

  return (
    <ChangelogAccordion
      label={t(`categories.${cat}`)}
      count={list.length}
      icon={<Icon weight="bold" className="h-4 w-4 text-[var(--foreground)]/45" />}
    >
      {itemList}
    </ChangelogAccordion>
  );
}

function ReleaseEntry({
  release,
  areaBySlug,
  locale,
  t,
  isLast,
}: {
  release: ChangelogRelease;
  areaBySlug: Map<string, ChangelogArea>;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
  isLast: boolean;
}) {
  const items = release.changelog_items;
  const title = resolve(release.title_fr, release.title_en, locale);
  const body = resolve(release.body_fr, release.body_en, locale);
  const heroSrc = resolve(release.image_url_fr, release.image_url_en, locale);
  const date = formatReleaseDate(release.published_at, locale);

  // Distinct area chips for the entry header (union of its items' areas).
  const distinctAreas: ChangelogArea[] = [];
  const seen = new Set<string>();
  for (const it of items) {
    if (it.area && !seen.has(it.area)) {
      const a = areaBySlug.get(it.area);
      if (a) {
        seen.add(it.area);
        distinctAreas.push(a);
      }
    }
  }

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    list: items.filter((i) => i.category === cat),
  })).filter((g) => g.list.length > 0);

  return (
    <article className="relative grid grid-cols-1 gap-x-10 md:grid-cols-[150px_minmax(0,1fr)]">
      {/* Desktop: sticky date rail — date only, no version code */}
      <div className="hidden md:block">
        <time
          dateTime={release.published_at ?? undefined}
          className="sticky top-28 block text-sm font-semibold text-[var(--foreground)]/55"
        >
          {date}
        </time>
      </div>

      {/* Content column carries the connecting timeline spine + accent dot. The
          bottom padding lives here (not on the article) so the border-l runs
          unbroken into the next entry. */}
      <div
        className={`relative border-l pb-12 pl-7 sm:pb-16 sm:pl-10 ${
          isLast ? "border-l-transparent" : "border-[var(--foreground)]/12"
        }`}
      >
        <span
          aria-hidden
          className="absolute left-0 top-[7px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[var(--accent)] ring-4 ring-[var(--paper)]"
        />

        {/* Mobile: inline date (the rail is hidden < md) */}
        <time
          dateTime={release.published_at ?? undefined}
          className="block text-sm font-semibold text-[var(--foreground)]/55 md:hidden"
        >
          {date}
        </time>

        {distinctAreas.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5 md:mt-0">
            {distinctAreas.map((a) => (
              <AreaChip key={a.slug} area={a} locale={locale} />
            ))}
          </div>
        )}

        {title && (
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-[28px]">
            {title}
          </h2>
        )}

        {heroSrc && (
          <div className="mt-5 overflow-hidden rounded-xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/[0.03]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSrc}
              alt={title || "Changelog"}
              loading="lazy"
              className="aspect-video w-full object-cover"
            />
          </div>
        )}

        {body && <MarkdownBody source={body} />}

        {byCategory.length > 0 && (
          <div className="mt-6 space-y-5">
            {byCategory.map(({ cat, list }) => (
              <CategoryGroup
                key={cat}
                cat={cat}
                list={list}
                areaBySlug={areaBySlug}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

export default async function ChangelogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ area?: string }>;
}) {
  const { locale } = await params;
  const { area: activeArea } = await searchParams;
  const t = await getTranslations({ locale, namespace: "changelog" });

  const { releases, areas } = await getPublicChangelog();
  const areaBySlug = new Map(areas.map((a) => [a.slug, a]));

  const usedSlugs = new Set<string>();
  for (const r of releases) {
    for (const it of r.changelog_items) if (it.area) usedSlugs.add(it.area);
  }
  const filterAreas = areas.filter((a) => usedSlugs.has(a.slug));

  const displayReleases: ChangelogRelease[] = activeArea
    ? releases
        .map((r) => ({
          ...r,
          changelog_items: r.changelog_items.filter(
            (i) => i.area === activeArea
          ),
        }))
        .filter((r) => r.changelog_items.length > 0)
    : releases;

  const base = locale === "fr" ? "/changelog" : `/${locale}/changelog`;

  // SEO: CollectionPage + ItemList of releases so search engines understand the
  // page as a dated list of product updates (rich-result eligible).
  const siteUrl = "https://stampeo.app";
  const canonicalUrl = `${siteUrl}${locale === "fr" ? "" : `/${locale}`}/changelog`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("meta.title"),
    description: t("meta.description"),
    url: canonicalUrl,
    inLanguage: locale,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: displayReleases.slice(0, 20).map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "TechArticle",
          headline: resolve(r.title_fr, r.title_en, locale) || t("title"),
          ...(r.published_at ? { datePublished: r.published_at } : {}),
          url: canonicalUrl,
        },
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="pt-32 pb-24">
        <Container className="max-w-4xl">
          {/* Hero */}
          <div className="mb-10 text-center sm:mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--foreground)]/70">
              {t("subtitle")}
            </p>
          </div>

          {/* Filter chips */}
          {filterAreas.length > 0 && (
            <div className="mb-12 flex flex-wrap justify-center gap-2">
              <Link
                href={base}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  !activeArea
                    ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--paper)]"
                    : "border-[var(--foreground)]/15 text-[var(--foreground)]/70 hover:border-[var(--foreground)]/30"
                }`}
              >
                {t("filterAll")}
              </Link>
              {filterAreas.map((a) => {
                const isActive = a.slug === activeArea;
                return (
                  <Link
                    key={a.slug}
                    href={`${base}?area=${a.slug}`}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-[var(--foreground)]/30 bg-[var(--foreground)]/[0.06] text-[var(--foreground)]"
                        : "border-[var(--foreground)]/15 text-[var(--foreground)]/70 hover:border-[var(--foreground)]/30"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: areaDotHex(a.color) }}
                    />
                    {areaLabel(a, locale)}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Timeline */}
          {displayReleases.length === 0 ? (
            <p className="py-20 text-center text-[var(--foreground)]/50">
              {t("empty")}
            </p>
          ) : (
            <div>
              {displayReleases.map((release, i) => (
                <ReleaseEntry
                  key={release.id}
                  release={release}
                  areaBySlug={areaBySlug}
                  locale={locale}
                  t={t}
                  isLast={i === displayReleases.length - 1}
                />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
