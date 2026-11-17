import { join, sep } from "node:path";
import { PREVIEW_SLUGS, type LandingSlug, type PreviewSlug } from "../landing-pages/pages";
import { ROOT, code, importedFiles, literalAttr, openingTags, read, sourceFiles } from "./jsx-source";

/**
 * Where the landing pages live, and the walks over their source that the registry,
 * shared-section and page-visual tests share. A page is the file that holds its sections:
 * a component of `components/landing-pages/pages/` that the routes render.
 */

/** The site's own components and routes: where a shared component's other callers live. */
export const SITE_SOURCE_DIRS = [join(ROOT, "components"), join(ROOT, "app")];

export const COMPONENTS_DIR = join(ROOT, "components", "landing-pages");
export const SHARED_DIR = join(COMPONENTS_DIR, "shared");
/** The code only the six feature previews use; the pieces they share with Platform are in `platform/` and `shared/`. */
export const PREVIEWS_DIR = join(COMPONENTS_DIR, "feature-previews");

/** The component that holds the sections of Platform and each preview, by slug. */
export const PAGE_COMPONENTS = {
  platform: "PlatformPage",
  "platform/card-design": "CardDesignPreviewPage",
  "platform/mobile-scanner": "MobileScannerPreviewPage",
  "platform/push-notifications": "PushNotificationsPreviewPage",
  "platform/analytics": "AnalyticsPreviewPage",
  "platform/promotional-campaigns": "PromotionalCampaignsPreviewPage",
  "platform/geolocation": "GeolocationPreviewPage",
  "platform/loyalty-programs": "LoyaltyProgramsPreviewPage",
} as const satisfies Record<LandingSlug, string>;

/** The file that holds a page's sections. */
export const pageFile = (slug: LandingSlug) => join(COMPONENTS_DIR, "pages", `${PAGE_COMPONENTS[slug]}.tsx`);

/** A file of one of the six feature previews: its page, or a component of `feature-previews/`. */
export const isPreviewFile = (file: string) =>
  file.startsWith(PREVIEWS_DIR + sep) || PREVIEW_SLUGS.some((slug) => file === pageFile(slug));

/** A file of a Platform-style page: Platform's own page and components, or a preview's. */
export const isPlatformStyleFile = (file: string) =>
  file === pageFile("platform") || file.startsWith(join(COMPONENTS_DIR, "platform") + sep) || isPreviewFile(file);

/**
 * The code of a preview's page (no `name`) or of one of its components, by file
 * name: `previewSource("platform/analytics", "ActivitySection")`.
 */
export function previewSource(slug: PreviewSlug, name?: string): string {
  return name ? code(join(PREVIEWS_DIR, slug.replace("platform/", ""), `${name}.tsx`)) : code(pageFile(slug));
}

/** A component of `components/landing-pages/shared/`. */
export const shared = (name: string) => join(SHARED_DIR, `${name}.tsx`);

/** A component of a page's own folder, `components/landing-pages/<folder>/`. */
export const pageComponent = (folder: string, name: string) => join(COMPONENTS_DIR, folder, `${name}.tsx`);

/** Every component of the pages: Platform's and the seven previews'. */
export const lpFiles = () => sourceFiles(COMPONENTS_DIR);

/** Every file the page renders through `components/landing-pages/`, itself included. */
export function landingTree(file: string, seen = new Set<string>()): Set<string> {
  if (seen.has(file)) return seen;
  seen.add(file);
  for (const target of importedFiles(file, read(file)).values()) {
    if (target.startsWith(COMPONENTS_DIR)) landingTree(target, seen);
  }
  return seen;
}

/**
 * The section ids a file renders, in document order. A tag that names its
 * section (`section="x"`) counts as that section; one that does not is a
 * landing-pages component, and the sections inside it count at its position.
 */
export function renderedSections(file: string, trail: string[] = []): string[] {
  const source = read(file);
  const components = importedFiles(file, source);
  const ids: string[] = [];
  for (const tag of openingTags(source)) {
    const id = literalAttr(tag.attrs, "section") ?? literalAttr(tag.attrs, "data-landing-section");
    const target = components.get(tag.name);
    if (id) ids.push(id);
    else if (target?.startsWith(COMPONENTS_DIR) && !trail.includes(target)) {
      ids.push(...renderedSections(target, [...trail, file]));
    }
  }
  return ids;
}

/** The code of the file that renders the section `id` on the page; empty when none does. */
export function sectionSource(slug: LandingSlug, id: string): string {
  const file = [...landingTree(pageFile(slug))].find((candidate) =>
    openingTags(read(candidate)).some((tag) => literalAttr(tag.attrs, "section") === id),
  );
  return file ? code(file) : "";
}

/**
 * Every opening tag of `component` (the one defined in `ownFile`, found through
 * the import that brings it in) in the site's own source, the landing pages'
 * components apart: the call sites that existed before these pages and
 * must render as they did, whatever props the pages add.
 */
export function otherCallers(component: string, ownFile: string): Array<{ file: string; attrs: string }> {
  return SITE_SOURCE_DIRS.flatMap((dir) => sourceFiles(dir))
    .filter((file) => file !== ownFile && !file.startsWith(COMPONENTS_DIR))
    .flatMap((file) => {
      const source = read(file);
      const imports = importedFiles(file, source);

      return openingTags(source)
        .filter((tag) => tag.name === component && imports.get(component) === ownFile)
        .map((tag) => ({ file, attrs: tag.attrs }));
    });
}

/** The dashboard-capture views a source asks for: `landingShot(locale, "x")`. */
export function shotViews(source: string): string[] {
  return [...source.matchAll(/\blandingShot\(\s*[^,()]+(?:\s+as\s+\w+)?\s*,\s*"([\w-]+)"/g)].map((match) => match[1]);
}
