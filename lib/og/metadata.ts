import type { Metadata, ResolvingMetadata } from "next";
import { localePath } from "@/lib/hreflang";
import { OG_HEIGHT, OG_WIDTH } from "./shared";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/** OpenGraph wants a language_TERRITORY tag, so each locale names a region. */
const OG_LOCALES: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  pl: "pl_PL",
};

/** The OpenGraph locale tag for a site locale. */
export function ogLocaleFor(locale: string): string {
  return OG_LOCALES[locale] ?? OG_LOCALES.en;
}

const OG_IMAGE_ROUTE = "/opengraph-image";

/**
 * Path of the site card rendered by `app/[locale]/opengraph-image.tsx`.
 * French is unprefixed; the proxy serves Next's `/fr/opengraph-image` as is.
 * `query` is the content hash Next appends to bust caches.
 */
export function ogImagePath(locale: string, query = ""): string {
  return `${localePath(locale, OG_IMAGE_ROUTE)}${query}`;
}

/** The `?hash` on the OG image Next resolved for the layout, or "". */
export function imageQuery(images: unknown): string {
  const first = Array.isArray(images) ? images[0] : images;
  const raw = typeof first === "object" && first !== null && "url" in first ? first.url : first;
  if (typeof raw !== "string" && !(raw instanceof URL)) return "";
  const url = new URL(String(raw), "https://stampeo.app");
  return url.pathname.endsWith(OG_IMAGE_ROUTE) ? url.search : "";
}

interface PageOpenGraph {
  title: string;
  description: string;
  /** The page's canonical URL. */
  url: string;
  /** Site locale the page renders in; picks the image and the default OG locale. */
  locale: string;
  /** Overrides the OG locale, for a market page (en_GB on /uk). */
  ogLocale?: string;
}

/**
 * A complete OpenGraph block for a page that sets its own. A page-level
 * `openGraph` replaces the layout's whole block, image included, so every
 * field is restated here.
 */
export function pageOpenGraph(page: PageOpenGraph, query = ""): OpenGraph {
  return {
    title: page.title,
    description: page.description,
    siteName: "Stampeo",
    type: "website",
    locale: page.ogLocale ?? ogLocaleFor(page.locale),
    url: page.url,
    images: [
      {
        url: ogImagePath(page.locale, query),
        width: OG_WIDTH,
        height: OG_HEIGHT,
        alt: "Stampeo",
        type: "image/png",
      },
    ],
  };
}

/** `pageOpenGraph`, carrying the image hash from the parent segment's metadata. */
export async function resolvePageOpenGraph(
  parent: ResolvingMetadata,
  page: PageOpenGraph
): Promise<OpenGraph> {
  const { openGraph } = await parent;
  return pageOpenGraph(page, imageQuery(openGraph?.images));
}
