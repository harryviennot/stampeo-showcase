/**
 * Public changelog data for the showcase timeline.
 *
 * The changelog is the first dynamic-from-backend page (the blog is filesystem
 * MDX). We fetch published releases from the public API with ISR (revalidate),
 * and resolve each bilingual field to the viewer's locale (EN -> FR fallback).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ChangelogCategory = "feature" | "improvement" | "fix";
export const CATEGORY_ORDER: ChangelogCategory[] = ["feature", "improvement", "fix"];

export interface ChangelogArea {
  slug: string;
  label_fr: string;
  label_en: string;
  label_es: string | null;
  color: string;
  sort_order: number;
}

export interface ChangelogItem {
  id: string;
  category: ChangelogCategory;
  area: string | null;
  affects: string[];
  title_fr: string;
  title_en: string | null;
  title_es: string | null;
  body_fr: string | null;
  body_en: string | null;
  body_es: string | null;
  sort_order: number;
}

export interface ChangelogRelease {
  id: string;
  version: string | null;
  title_fr: string | null;
  title_en: string | null;
  title_es: string | null;
  body_fr: string | null;
  body_en: string | null;
  body_es: string | null;
  image_url_fr: string | null;
  image_url_en: string | null;
  image_url_es: string | null;
  published_at: string | null;
  changelog_items: ChangelogItem[];
}

export interface ChangelogResponse {
  releases: ChangelogRelease[];
  areas: ChangelogArea[];
}

/** Resolve a localized triple to the viewer's locale (ES → EN → FR fallback). */
export function resolve(
  fr: string | null | undefined,
  en: string | null | undefined,
  es: string | null | undefined,
  locale: string
): string {
  if (locale === "es") return (es && es.trim()) || (en && en.trim()) || fr || "";
  if (locale === "en") return (en && en.trim()) || fr || "";
  return fr || "";
}

export function areaLabel(area: ChangelogArea, locale: string): string {
  if (locale === "es") return area.label_es || area.label_en || area.label_fr;
  if (locale === "en") return area.label_en || area.label_fr;
  return area.label_fr;
}

export async function getPublicChangelog(area?: string): Promise<ChangelogResponse> {
  if (!API_URL) return { releases: [], areas: [] };
  const qs = area ? `?area=${encodeURIComponent(area)}` : "";
  try {
    // Live fetch (no ISR cache): a changelog should show a release the moment it
    // publishes, and caching an empty response before any release exists would
    // otherwise strand the page on "no updates yet" for the whole revalidate
    // window.
    const res = await fetch(`${API_URL}/public/changelog${qs}`, {
      cache: "no-store",
    });
    if (!res.ok) return { releases: [], areas: [] };
    return (await res.json()) as ChangelogResponse;
  } catch {
    return { releases: [], areas: [] };
  }
}

export interface PlatformVersion {
  platform: string | null;
  scanner: string | null;
}

/** Latest published platform version (drives the footer "v…" label). */
export async function getPlatformVersion(): Promise<PlatformVersion> {
  if (!API_URL) return { platform: null, scanner: null };
  try {
    const res = await fetch(`${API_URL}/public/version`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return { platform: null, scanner: null };
    return (await res.json()) as PlatformVersion;
  } catch {
    return { platform: null, scanner: null };
  }
}

/** Date formatted in the viewer's locale, e.g. "11 juin 2026" / "June 11, 2026". */
export function formatReleaseDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(
      locale === "fr" ? "fr-FR" : locale === "es" ? "es-ES" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    );
  } catch {
    return "";
  }
}

/** Narrow releases to items of one area (dropping releases left empty), or
 *  return them as-is when no area is selected. Pure — used by the changelog
 *  page for the ?area= filter. */
export function filterReleasesByArea(
  releases: ChangelogRelease[],
  area: string | undefined
): ChangelogRelease[] {
  if (!area) return releases;
  return releases
    .map((r) => ({
      ...r,
      changelog_items: r.changelog_items.filter((i) => i.area === area),
    }))
    .filter((r) => r.changelog_items.length > 0);
}
