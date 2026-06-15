import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Sparkle, ArrowUp, Bug } from "@phosphor-icons/react/dist/ssr";

import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/ui/Container";
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
import { areaChipClass } from "@/lib/changelog-areas";

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

/** Article body: trusted (superadmin-authored) Markdown. Falls back to plain
 *  text if MDX compilation ever chokes on stray syntax. */
async function ArticleBody({ source }: { source: string }) {
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
    return (
      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--foreground)]/80">
        {source}
      </p>
    );
  }
  return (
    <div className="prose prose-sm sm:prose-base mt-4 max-w-none text-[var(--foreground)]/80 prose-headings:text-[var(--foreground)] prose-a:text-[var(--accent)]">
      {content}
    </div>
  );
}

function AreaChip({
  area,
  locale,
  className = "",
}: {
  area: ChangelogArea;
  locale: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${areaChipClass(
        area.color
      )} ${className}`}
    >
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
  const teamOnly =
    item.affects?.length === 1 && item.affects[0] === "scanner";
  return (
    <li className="flex flex-col gap-1 py-2 sm:flex-row sm:items-baseline sm:gap-3">
      {area && <AreaChip area={area} locale={locale} className="shrink-0 sm:mt-0.5" />}
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
          <p className="mt-0.5 text-[14px] leading-relaxed text-[var(--foreground)]/70">
            {body}
          </p>
        )}
      </div>
    </li>
  );
}

function ReleaseEntry({
  release,
  areaBySlug,
  locale,
  t,
}: {
  release: ChangelogRelease;
  areaBySlug: Map<string, ChangelogArea>;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const items = release.changelog_items;
  const title = resolve(release.title_fr, release.title_en, locale);
  const body = resolve(release.body_fr, release.body_en, locale);

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
    <article className="md:grid md:grid-cols-[170px_1fr] md:gap-10">
      {/* Date rail */}
      <div className="mb-3 md:mb-0 md:text-right">
        <div className="md:sticky md:top-28">
          <time className="text-sm font-medium text-[var(--foreground)]/60">
            {formatReleaseDate(release.published_at, locale)}
          </time>
          {release.version && (
            <div className="mt-1 hidden md:block">
              <span className="inline-flex items-center rounded-md bg-[var(--accent)]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[var(--accent)]">
                v{release.version}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Entry body */}
      <div className="relative border-l-0 pb-14 md:border-l md:border-[var(--foreground)]/10 md:pl-10">
        <span
          aria-hidden
          className="absolute -left-[6.5px] top-1.5 hidden h-3 w-3 rounded-full border-2 border-[var(--accent)] bg-[var(--paper)] md:block"
        />

        <div className="flex flex-wrap items-center gap-2">
          {release.version && (
            <span className="inline-flex items-center rounded-md bg-[var(--accent)]/10 px-2 py-0.5 font-mono text-xs font-semibold text-[var(--accent)] md:hidden">
              v{release.version}
            </span>
          )}
          {distinctAreas.map((a) => (
            <AreaChip key={a.slug} area={a} locale={locale} />
          ))}
        </div>

        {title && (
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[var(--foreground)] sm:text-3xl">
            {title}
          </h2>
        )}

        {release.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={release.image_url}
            alt={title || "Changelog"}
            loading="lazy"
            className="mt-5 w-full rounded-2xl border border-[var(--foreground)]/10 object-cover shadow-sm"
          />
        )}

        {body && <ArticleBody source={body} />}

        {byCategory.length > 0 && (
          <div className="mt-6 space-y-5">
            {byCategory.map(({ cat, list }) => {
              const Icon = CATEGORY_ICON[cat];
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2">
                    <Icon
                      weight="bold"
                      className="h-4 w-4 text-[var(--foreground)]/50"
                    />
                    <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--foreground)]/60">
                      {t(`categories.${cat}`)}
                    </h3>
                  </div>
                  <ul className="mt-1 divide-y divide-[var(--foreground)]/5">
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
                </div>
              );
            })}
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

  // Areas actually used across all items — only those become filter chips.
  const usedSlugs = new Set<string>();
  for (const r of releases) {
    for (const it of r.changelog_items) if (it.area) usedSlugs.add(it.area);
  }
  const filterAreas = areas.filter((a) => usedSlugs.has(a.slug));

  // Filter to the selected area: keep only matching items, drop empty releases.
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

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--paper)] pt-28 pb-24 sm:pt-32">
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
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  !activeArea
                    ? "border-[var(--accent)] bg-[var(--accent)] text-white"
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
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                      isActive
                        ? `${areaChipClass(a.color)} border-current`
                        : "border-[var(--foreground)]/15 text-[var(--foreground)]/70 hover:border-[var(--foreground)]/30"
                    }`}
                  >
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
            <div className="space-y-2">
              {displayReleases.map((release) => (
                <ReleaseEntry
                  key={release.id}
                  release={release}
                  areaBySlug={areaBySlug}
                  locale={locale}
                  t={t}
                />
              ))}
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
