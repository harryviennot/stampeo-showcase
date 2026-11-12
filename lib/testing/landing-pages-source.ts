import { join } from "node:path";
import { LANDING_SLUGS, type LandingSlug } from "../landing-pages/pages";
import { ROOT, code, importedFiles, literalAttr, openingTags, read, sourceFiles } from "./jsx-source";

/**
 * Where the `/us/landing-pages/*` pages live, and the walks over their source
 * that the registry, shared-section and page-visual tests share.
 */

export const PAGES_DIR = join(ROOT, "app", "[locale]", "us", "landing-pages");
export const COMPONENTS_DIR = join(ROOT, "components", "landing-pages");
export const SHARED_DIR = join(COMPONENTS_DIR, "shared");

export const pageFile = (slug: LandingSlug) => join(PAGES_DIR, slug, "page.tsx");

/** A component of `components/landing-pages/shared/`. */
export const shared = (name: string) => join(SHARED_DIR, `${name}.tsx`);

/** Every component of the pages, and the three page files. */
export const lpFiles = () => [...sourceFiles(COMPONENTS_DIR), ...LANDING_SLUGS.map(pageFile)];

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

/** The `<PlanLine>…</PlanLine>` that holds `needle`: the paragraph a broadcast claim shares with its plans label. */
export function planLineWith(source: string, needle: string): string {
  const at = source.indexOf(needle);
  const open = source.lastIndexOf("<PlanLine", at);
  const close = source.indexOf("</PlanLine>", at);
  return at === -1 || open === -1 || close === -1 ? "" : source.slice(open, close);
}
