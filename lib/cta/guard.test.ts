/**
 * Every link to the signup or contact page on a marketing page reports its
 * click.
 *
 * An untracked link is silent, and silence is invisible: the ad platforms
 * simply see fewer Leads and Contacts than there were, and campaigns optimise
 * against the remainder. So this reads the source of `components/` and `app/`
 * and fails on any JSX element that points at `/onboarding` or `/contact`
 * without a `trackAs` location.
 *
 * An element points there when:
 * - its `href` or `ctaHref` is a string literal for one of the two pages
 *   (locale prefix, query and hash allowed, so `/contact?type=demo` counts);
 * - it is a `<CTAButton>`, `<TrackedLink>` or `<TrackedAnchor>`, whatever its
 *   href: CTAButton defaults to `/onboarding`, and all three exist to be
 *   tracked CTAs.
 *
 * A dynamic `href={x}` on a plain `<Link>` is beyond a source scan. The
 * components that forward one (`CTAButton`, `TrackedLink`, `TrackedAnchor`,
 * `PricingTierCard`) require `trackAs` in their props instead, which `tsc`
 * enforces.
 *
 * Blog posts are MDX under `content/`, which neither `tsc` nor ESLint reads,
 * which is why this is a source scan rather than a lint rule. A markdown link
 * there renders through the blog's `a` mapping, which tracks signup and
 * contact links; a raw `<a>` or `<Link>` written as JSX bypasses that mapping,
 * so the scan fails on one pointing at either page.
 *
 * Files under a private route segment (`PRIVATE_SEGMENTS`) are exempt: no ad
 * tag runs there.
 */

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PRIVATE_SEGMENTS } from "../consent-routes";

const ROOT = join(import.meta.dir, "..", "..");
const SCANNED_DIRS = ["components", "app"];
const CONTENT_DIR = "content";

const CTA_PATH = /^\/(?:[a-z]{2}\/)*(?:onboarding|contact)(?:[/?#]|$)/;
const ALWAYS_CTA = new Set(["CTAButton", "TrackedLink", "TrackedAnchor"]);
/** JSX in MDX that renders as written, outside the components map. */
const RAW_MDX_LINKS = new Set(["a", "Link"]);

interface Tag {
  name: string;
  attrs: string;
  line: number;
}

/**
 * Block comments and whole-line `//` comments, blanked out with their line
 * breaks kept so line numbers survive. A trailing `//` is left alone because
 * it is indistinguishable from the one inside `"https://…"`.
 */
function stripComments(source: string): string {
  const blank = (text: string) => text.replace(/[^\n]/g, " ");
  return source
    .replace(/\/\*[\s\S]*?\*\//g, blank)
    .replace(/^[ \t]*\/\/.*$/gm, blank);
}

/** Index of the `>` that closes a tag, skipping `{…}` and quoted strings. */
function tagEnd(source: string, from: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = from; i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i;
  }
  return -1;
}

/** Every JSX opening tag, with its raw attribute text. */
function openingTags(source: string): Tag[] {
  const code = stripComments(source);
  const tags: Tag[] = [];
  for (const match of code.matchAll(/<([A-Za-z][\w.]*)(?=[\s/>])/g)) {
    const start = match.index + match[0].length;
    const end = tagEnd(code, start);
    if (end === -1) continue;
    tags.push({
      name: match[1],
      attrs: code.slice(start, end),
      line: code.slice(0, match.index).split("\n").length,
    });
  }
  return tags;
}

/** The literal value of an attribute (`a="x"` or `a={"x"}`), or null. */
function literalAttr(attrs: string, name: string): string | null {
  const match = attrs.match(
    new RegExp(`(?:^|\\s)${name}=(?:"([^"]*)"|'([^']*)'|\\{\\s*["'\`]([^"'\`$]*)["'\`]\\s*\\})`),
  );
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? null;
}

function pointsAtCta(tag: Tag): boolean {
  if (ALWAYS_CTA.has(tag.name)) return true;
  return ["href", "ctaHref"].some((name) => {
    const value = literalAttr(tag.attrs, name);
    return value !== null && CTA_PATH.test(value);
  });
}

/** `file:line <Tag>` for each CTA in `source` that carries no location. */
function untrackedCtas(source: string, file = "source"): string[] {
  return openingTags(source)
    .filter((tag) => pointsAtCta(tag) && !/(?:^|\s)trackAs=/.test(tag.attrs))
    .map((tag) => `${file}:${tag.line} <${tag.name}>`);
}

/** `file:line <Tag>` for each raw JSX link in MDX that points at a CTA page. */
function rawMdxCtas(source: string, file = "source"): string[] {
  return openingTags(source)
    .filter((tag) => RAW_MDX_LINKS.has(tag.name) && pointsAtCta(tag))
    .map((tag) => `${file}:${tag.line} <${tag.name}>`);
}

/** MDX content files, relative to the repo root. */
function mdxContentFiles(): string[] {
  return readdirSync(join(ROOT, CONTENT_DIR), { recursive: true, encoding: "utf-8" })
    .filter((path) => path.endsWith(".mdx"))
    .map((path) => `${CONTENT_DIR}/${path}`);
}

/** Source files on marketing pages, relative to the repo root. */
function marketingSourceFiles(): string[] {
  return SCANNED_DIRS.flatMap((dir) =>
    readdirSync(join(ROOT, dir), { recursive: true, encoding: "utf-8" })
      .map((path) => `${dir}/${path}`)
      .filter((path) => /\.tsx?$/.test(path) && !/\.(test|d)\.ts$/.test(path))
      .filter((path) => !path.split("/").slice(0, -1).some((s) => PRIVATE_SEGMENTS.has(s))),
  );
}

describe("the CTA guard", () => {
  test.each([
    ['<Link href="/onboarding">Start</Link>', true],
    ['<Link href={"/onboarding"} className="x">', true],
    ['<a href="/contact?type=demo">Book a demo</a>', true],
    ['<Link href="/en/contact">', true],
    ['<Link\n  href="/onboarding"\n  onClick={() => close()}\n  className="h-9"\n>', true],
    ['<CTAButton label={t("start")} />', true],
    ['<PricingTierCard cta="Start" ctaHref="/onboarding" />', true],
    ['<TrackedLink trackAs="header" href="/onboarding">', false],
    ['<CTAButton label="Talk to us" href="/contact" trackAs="faq_contact" />', false],
    ['<Link href="/pricing">', false],
    ['<Link href="/contacts">', false],
    ['<Link href={appUrl}>', false],
    ['{/* <Link href="/onboarding"> */}', false],
  ])("%p is untracked: %p", (source, untracked) => {
    expect(untrackedCtas(source).length > 0).toBe(untracked);
  });

  test("the scan reaches the marketing components and their CTAs", () => {
    // Without this, a walk that silently found no files would pass the test
    // below over an empty list.
    const files = marketingSourceFiles();
    expect(files).toContain("components/sections/Header.tsx");
    expect(files).toContain("components/ui/CTAButton.tsx");
    expect(files.some((f) => f.startsWith("app/[locale]/login/"))).toBe(false);

    const ctas = files.flatMap((file) =>
      openingTags(readFileSync(join(ROOT, file), "utf-8")).filter(pointsAtCta),
    );
    expect(ctas.length).toBeGreaterThanOrEqual(20);
  });

  test("every signup and contact link on a marketing page carries a location", () => {
    const untracked = marketingSourceFiles().flatMap((file) =>
      untrackedCtas(readFileSync(join(ROOT, file), "utf-8"), file),
    );

    expect(untracked).toEqual([]);
  });
});

describe("the CTA guard on blog posts", () => {
  test.each([
    ["Read [the setup guide](/en/onboarding).", false],
    ['<a href="/en/onboarding">Start</a>', true],
    ['<a href="/contact">Talk to us</a>', true],
    ['<Link href="/onboarding">Start</Link>', true],
    ['<a href="/en/blog/digital-stamp-card">Guide</a>', false],
    ['<CallToAction\n  title="Ready?"\n  buttonText="Start"\n  href="/onboarding"\n/>', false],
  ])("%p bypasses the tracked mapping: %p", (source, untracked) => {
    expect(rawMdxCtas(source).length > 0).toBe(untracked);
  });

  test("the scan reaches the blog posts", () => {
    const files = mdxContentFiles();
    expect(files).toContain("content/blog/fr/carte-fidelite-boulangerie.mdx");
    expect(files.length).toBeGreaterThanOrEqual(20);
  });

  test("no blog post links to the signup or contact page outside the tracked mapping", () => {
    const untracked = mdxContentFiles().flatMap((file) =>
      rawMdxCtas(readFileSync(join(ROOT, file), "utf-8"), file),
    );

    expect(untracked).toEqual([]);
  });

  test("a markdown link renders through the tracked link for signup and contact pages", async () => {
    const { mdxComponents } = await import("@/components/blog/mdx");
    const { BlogLink } = await import("@/components/blog/mdx/BlogLink");
    const { TrackedAnchor } = await import("@/components/ui/TrackedAnchor");

    expect(mdxComponents.a).toBe(BlogLink);

    const signup = BlogLink({ href: "/en/onboarding", children: "Start" });
    expect(signup.type).toBe(TrackedAnchor);
    expect(signup.props).toMatchObject({ href: "/en/onboarding", trackAs: "blog_link" });

    const contact = BlogLink({ href: "/contact", children: "Talk to us" });
    expect(contact.props).toMatchObject({ href: "/contact", trackAs: "blog_contact" });

    // Every other link renders exactly as written.
    const guide = BlogLink({ href: "/en/blog/digital-stamp-card", children: "Guide" });
    expect(guide.type).toBe("a");
    expect(guide.props).toEqual({ href: "/en/blog/digital-stamp-card", children: "Guide" });
  });
});
