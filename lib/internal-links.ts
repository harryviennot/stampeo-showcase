import { routing } from "@/i18n/routing";
import { BLOG_LOCALES } from "@/lib/blog/locales";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import { MARKETING_SEGMENTS, PRIVATE_SEGMENTS } from "@/lib/consent-routes";
import {
  getLocalizedSlug,
  isCorrectSlugForLocale,
  resolveToCanonicalSlug,
} from "@/lib/feature-slugs";

/**
 * Internal-link integrity.
 *
 * Two link conventions coexist in this repo, and both are correct in their own
 * place. `localePrefix: "as-needed"` with `defaultLocale: "fr"` means next-intl's
 * `Link` prepends the locale itself:
 *
 *   `Link` from `@/i18n/navigation`  ->  href must be locale-AGNOSTIC  (`/onboarding`)
 *   raw `<a>` / markdown `[](…)`     ->  href must be locale-PREFIXED  (`/es/onboarding`)
 *
 * Handing a prefixed href to the prefixing `Link` produced `/en/en/onboarding`
 * on all 11 English posts and `/es/es/onboarding` on all 5 Spanish ones (STA-355).
 * French never showed it, because French is the unprefixed default locale — the
 * bug was invisible in the locale the team reads most.
 *
 * Nothing could have caught it earlier. `messages/*.json` link values are read at
 * RUNTIME, so next-intl's typed hrefs cannot narrow them, and the call sites
 * defeat the check anyway with casts (`href={feature.link as "/features/…"}`).
 * Removing those casts would not help: a string read from JSON cannot become a
 * literal union without a full next-intl `pathnames` map. Resolving every authored
 * link against the real route inventory is the only guard that works, so this
 * module is it, and `internal-links.test.ts` runs it over the real files.
 *
 * Pure by design (no `fs`): the test walks the filesystem and feeds the results
 * in, the same split `consent-routes.ts` uses.
 *
 * What this does NOT cover, so the next person does not mistake green for safe:
 *
 * - **Components.** `Header.tsx` and `Footer.tsx` use BOTH conventions in one
 *   file, and build their raw-anchor hrefs by string concatenation, so no parser
 *   can check them. A footer regression would hit every page on the site, far
 *   worse than the 16 blog posts. Covered by IL-09 in
 *   `docs/qa/seo-internal-links.md`, against rendered HTML, which is the only
 *   place those hrefs exist.
 * - **Path depth below the first segment.** `/pricing/plans` resolves here and
 *   404s in the app: only the first segment is matched against the route tree.
 * - **Link shapes.** Only `<CallToAction href="…">` (the one MDX component that
 *   takes an href) and markdown `[](/…)`. Not `href={expr}`, not raw `<a>` in
 *   JSX, not reference-style or relative markdown links.
 * - **Catalog keys.** Only `link` and `href`. The allowlist is load-bearing: it
 *   is what keeps `"perMonth": "/mes"` in `pricing.json` out of the walk.
 * - **Backend-authored copy.** Changelog bodies arrive from the API and cannot
 *   be checked from this repo at all.
 */

/**
 * Routes served outside the `[locale]` tree. `middleware.ts` excludes them from
 * the matcher, so they take no locale prefix: `/go/app` is right and
 * `/es/go/app` does not exist. Listed here so a link to one resolves instead of
 * false-alarming as `unknown-route`.
 */
const NON_LOCALE_SEGMENTS: ReadonlySet<string> = new Set([
  "api",
  "auth",
  "go",
  "internal",
  "join",
]);

/**
 * Real routes that always answer with a redirect, so linking to one costs a hop
 * even though it never 404s. The founding program closed on 2026-08-04 and both
 * its routes send visitors to /pricing; `app/sitemap.ts` drops them for the same
 * reason. This is group (E)'s defect class — a valid URL that is still the wrong
 * thing to link to — so the guard has to know about it by name.
 */
const REDIRECTING_SEGMENTS: ReadonlySet<string> = new Set([
  "founding-partner",
  "programme-fondateur",
]);

export type LinkKind = "localized-link" | "raw-anchor";

export type LinkProblem =
  /** A prefixed href handed to the prefixing `Link` -> `/en/en/…`. */
  | "double-prefix"
  /** A raw `<a>` missing the prefix -> resolves to the wrong locale. */
  | "missing-prefix"
  /** `/blog/<slug>` where that locale has no such article. */
  | "missing-post"
  /** A real slug, but another locale's -> the route 308s before arriving. */
  | "wrong-locale-slug"
  /** A real route that always answers with a redirect -> a wasted hop. */
  | "always-redirects"
  /** Resolves to no route at all. */
  | "unknown-route";

export type LinkVerdict =
  | { ok: true; resolved: string }
  | { ok: false; problem: LinkProblem; resolved: string; detail: string };

/** Blog slugs per locale, as `getAllSlugs` returns them. */
export type BlogInventory = Readonly<Record<string, readonly string[]>>;

const LOCALES: readonly string[] = routing.locales;
const DEFAULT_LOCALE = routing.defaultLocale;

/** A link we do not own and cannot resolve: external, anchor, mail, tel. */
export function isInternalHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

/** Strip query and hash, and any trailing slash except on the bare root. */
function normalizePath(href: string): string {
  const path = href.split(/[?#]/)[0];
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/** The locale prefix at the head of a path, or null. */
function leadingLocale(path: string): string | null {
  const first = path.split("/")[1];
  return first && LOCALES.includes(first) ? first : null;
}

/**
 * Resolve a locale-free path against the route inventory.
 *
 * Order matters: the feature and loyalty checks must run before the generic
 * segment allowlist, because `features` and `programme-fidelite` are both IN
 * that allowlist — a bare segment match would wave through every wrong-locale
 * slug beneath them, which is exactly bug (E) in the failure report.
 */
function classifyLocaleFreePath(
  path: string,
  locale: string,
  blog: BlogInventory
): { problem: LinkProblem; detail: string } | null {
  if (path === "/") return null;

  const segments = path.split("/").filter(Boolean);
  const [head, ...rest] = segments;

  if (head === "blog") {
    if (!(BLOG_LOCALES as readonly string[]).includes(locale)) {
      return {
        problem: "unknown-route",
        detail: `locale "${locale}" has no blog`,
      };
    }
    if (rest.length === 0) return null;
    const slug = rest[0];
    if ((blog[locale] ?? []).includes(slug)) return null;

    // Naming the locales that DO have it turns "404" into "someone translated
    // the slug but never the article", which is the whole STA-355 story.
    const elsewhere = Object.keys(blog).filter(
      (l) => l !== locale && (blog[l] ?? []).includes(slug)
    );
    return {
      problem: "missing-post",
      detail: elsewhere.length
        ? `no "${slug}.mdx" in content/blog/${locale}/ (exists in: ${elsewhere.join(", ")})`
        : `no "${slug}.mdx" in content/blog/${locale}/`,
    };
  }

  if (head === "features") {
    if (rest.length === 0) return null;
    const slug = rest[0];
    const canonical = resolveToCanonicalSlug(slug);
    if (!canonical) {
      return {
        problem: "unknown-route",
        detail: `"${slug}" is in no map in lib/feature-slugs.ts -> notFound()`,
      };
    }
    if (!isCorrectSlugForLocale(slug, locale)) {
      return {
        problem: "wrong-locale-slug",
        detail: `${locale} uses "${getLocalizedSlug(canonical, locale)}" for this feature -> "${slug}" 308s before arriving`,
      };
    }
    return null;
  }

  // The loyalty page is four sibling folders, one per locale, so a valid slug
  // from the wrong locale is a redirect rather than a 404.
  const loyaltyOwner = (Object.keys(LOYALTY_SLUGS) as Array<keyof typeof LOYALTY_SLUGS>).find(
    (l) => LOYALTY_SLUGS[l] === path
  );
  if (loyaltyOwner) {
    return loyaltyOwner === locale
      ? null
      : {
          problem: "wrong-locale-slug",
          detail: `"${path}" is the ${loyaltyOwner} loyalty slug; ${locale} uses "${LOYALTY_SLUGS[locale as keyof typeof LOYALTY_SLUGS] ?? "?"}"`,
        };
  }

  if (REDIRECTING_SEGMENTS.has(head)) {
    return {
      problem: "always-redirects",
      detail: `"/${head}" always redirects (the founding program closed); link to its destination instead`,
    };
  }

  if (MARKETING_SEGMENTS.has(head) || PRIVATE_SEGMENTS.has(head)) return null;

  return {
    problem: "unknown-route",
    detail: `no route owns "/${head}" (it would fall through to the /{businessSlug} enrollment page)`,
  };
}

/**
 * Classify one authored link.
 *
 * `locale` is the locale of the file the link was authored in, NOT the locale of
 * the href — that is the point: a localized `Link` is handed a locale-free path
 * and supplies the locale itself.
 */
export function classifyLink(
  href: string,
  locale: string,
  kind: LinkKind,
  blog: BlogInventory
): LinkVerdict {
  const path = normalizePath(href);
  const prefix = leadingLocale(path);

  // Outside the locale tree, so the locale rules below do not apply in either
  // direction: these take no prefix, from a localized Link or a raw <a> alike.
  const head = path.split("/")[1];
  if (NON_LOCALE_SEGMENTS.has(head)) return { ok: true, resolved: path };
  if (prefix && NON_LOCALE_SEGMENTS.has(path.split("/")[2])) {
    return {
      ok: false,
      problem: "unknown-route",
      resolved: path,
      detail: `"/${path.split("/")[2]}" is served outside the [locale] tree; drop the "/${prefix}" prefix`,
    };
  }

  if (kind === "localized-link") {
    if (prefix) {
      const doubled =
        prefix === DEFAULT_LOCALE ? path.slice(prefix.length + 1) || "/" : `/${prefix}${path}`;
      return {
        ok: false,
        problem: "double-prefix",
        resolved: doubled,
        detail: `next-intl's Link prepends the locale; "${href}" renders as "${doubled}"`,
      };
    }
    const resolved = locale === DEFAULT_LOCALE ? path : `/${locale}${path === "/" ? "" : path}`;
    const bad = classifyLocaleFreePath(path, locale, blog);
    return bad ? { ok: false, resolved, ...bad } : { ok: true, resolved };
  }

  // raw-anchor: rendered verbatim, so it must carry the prefix itself — except
  // in the default locale, which is unprefixed.
  if (locale === DEFAULT_LOCALE) {
    if (prefix) {
      return {
        ok: false,
        problem: "double-prefix",
        resolved: path,
        detail: `${DEFAULT_LOCALE} is the unprefixed default locale; "/${prefix}…" 307s to the bare path`,
      };
    }
    const bad = classifyLocaleFreePath(path, locale, blog);
    return bad ? { ok: false, resolved: path, ...bad } : { ok: true, resolved: path };
  }

  if (prefix !== locale) {
    return {
      ok: false,
      problem: "missing-prefix",
      resolved: path,
      detail: prefix
        ? `authored in ${locale} but prefixed "/${prefix}"`
        : `a raw <a> is rendered verbatim, so it needs the "/${locale}" prefix`,
    };
  }

  const localeFree = path.slice(prefix.length + 1) || "/";
  const bad = classifyLocaleFreePath(localeFree, locale, blog);
  return bad ? { ok: false, resolved: path, ...bad } : { ok: true, resolved: path };
}

// ---------------------------------------------------------------------------
// Extractors. Pure string -> links, so the test can feed them real file bodies.
// ---------------------------------------------------------------------------

export interface FoundLink {
  href: string;
  /** 1-indexed, so a failure message can be pasted straight into an editor. */
  line: number;
}

const lineOf = (source: string, index: number) =>
  source.slice(0, index).split("\n").length;

/**
 * `<CallToAction … href="…" />` in MDX. Authored both inline and across several
 * lines, so this scans each tag body rather than matching a single-line shape.
 */
export function extractCtaHrefs(source: string): FoundLink[] {
  const found: FoundLink[] = [];
  const tag = /<CallToAction\b/g;
  let open: RegExpExecArray | null;
  while ((open = tag.exec(source)) !== null) {
    const end = source.indexOf("/>", open.index);
    if (end === -1) continue;
    const body = source.slice(open.index, end);
    const href = /href=["']([^"']*)["']/.exec(body);
    if (href) found.push({ href: href[1], line: lineOf(source, open.index) });
  }
  return found;
}

/**
 * Markdown links in article prose. These render as a BARE `<a>` — `a` is not
 * overridden in the MDX component map at `components/blog/mdx/index.ts` — which
 * is why they carry the locale prefix while `CallToAction` must not.
 */
export function extractMarkdownLinks(source: string): FoundLink[] {
  const found: FoundLink[] = [];
  // `![alt](/x.png)` shares this shape and is not a link. content/docs/ is full
  // of them, so the exclusion matters the moment another surface is walked.
  const link = /(!?)\[[^\]]*\]\((\/[^)\s]*)\)/g;
  let match: RegExpExecArray | null;
  while ((match = link.exec(source)) !== null) {
    if (match[1] === "!") continue;
    found.push({ href: match[2], line: lineOf(source, match.index) });
  }
  return found;
}

/** Keys in the message catalogs whose value is fed to a next-intl `Link`. */
const CATALOG_LINK_KEYS = new Set(["link", "href"]);

export interface CatalogLink {
  href: string;
  /** Dotted path to the value, e.g. `variant.sectors.2.link`. */
  at: string;
}

/** Every internal `"link"` / `"href"` value in a parsed message catalog. */
export function extractCatalogLinks(node: unknown, at = ""): CatalogLink[] {
  if (Array.isArray(node)) {
    return node.flatMap((child, i) => extractCatalogLinks(child, at ? `${at}.${i}` : `${i}`));
  }
  if (node && typeof node === "object") {
    return Object.entries(node).flatMap(([key, value]) => {
      const path = at ? `${at}.${key}` : key;
      if (typeof value === "string") {
        return CATALOG_LINK_KEYS.has(key) && isInternalHref(value)
          ? [{ href: value, at: path }]
          : [];
      }
      return extractCatalogLinks(value, path);
    });
  }
  return [];
}
