/** Parsing what a crawler reads out of raw HTML: head metadata, structured data and visible text. */

const BRAND = /stampeo/gi;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const point = code[1] === "x" || code[1] === "X" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
  });
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const body = tag.replace(/^<[a-z]+/i, "").replace(/\/?>$/, "");
  for (const match of body.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attributes;
}

/** The markup a crawler parses as elements: scripts, styles and inline SVGs removed. */
function markup(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, "")
    .replace(/<svg\b[\s\S]*?<\/svg\s*>/gi, "");
}

function tags(html: string, name: string): Record<string, string>[] {
  return [...markup(html).matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => parseAttributes(m[0]));
}

/** The page text without tags, entities decoded and every no-break space made a plain space. */
export function visibleText(html: string): string {
  return decodeEntities(markup(html).replace(/<[^>]*>/g, "")).replace(/[\u00a0\u202f\u2009]/g, " ");
}

/** The path of an absolute or relative URL, without a trailing slash (except `/`). */
export function pathOf(url: string): string {
  const path = new URL(url, "https://stampeo.app").pathname;
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export function parseTitle(html: string): string | null {
  const match = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(markup(html));
  return match ? decodeEntities(match[1]).trim() : null;
}

export function parseMetaDescription(html: string): string | null {
  const meta = tags(html, "meta").find((attrs) => attrs.name?.toLowerCase() === "description");
  return meta?.content ?? null;
}

function linksWithRel(html: string, rel: string): Record<string, string>[] {
  return tags(html, "link").filter((attrs) => (attrs.rel ?? "").toLowerCase().split(/\s+/).includes(rel));
}

export function parseCanonical(html: string): string | null {
  return linksWithRel(html, "canonical")[0]?.href ?? null;
}

/** hreflang → href, as written in the page. Alternates without hreflang (RSS) are skipped. */
export function parseAlternates(html: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const attrs of linksWithRel(html, "alternate")) {
    if (attrs.hreflang && attrs.href) map[attrs.hreflang] = attrs.href;
  }
  return map;
}

export type JsonLdBlock =
  | { ok: true; raw: string; data: unknown }
  | { ok: false; raw: string; error: string };

/**
 * Every real `<script type="application/ld+json">` element. Script bodies are
 * consumed whole, so the RSC flight payload (which mentions the same type
 * inside an escaped string) never counts.
 */
export function parseJsonLdBlocks(html: string): JsonLdBlock[] {
  const blocks: JsonLdBlock[] = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    const type = parseAttributes(`<script${match[1]}>`).type?.trim().toLowerCase();
    if (type !== "application/ld+json") continue;
    const raw = match[2];
    try {
      blocks.push({ ok: true, raw, data: JSON.parse(raw) });
    } catch (error) {
      blocks.push({ ok: false, raw, error: error instanceof Error ? error.message : String(error) });
    }
  }
  return blocks;
}

export function countBrand(title: string): number {
  return title.match(BRAND)?.length ?? 0;
}
