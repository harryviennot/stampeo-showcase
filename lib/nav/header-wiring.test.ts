import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "..", "..");
const source = (path: string) => readFileSync(join(ROOT, path), "utf8");

/**
 * How the header decides which phone menu to draw. The pages that ask for the new one are in
 * `lib/landing-pages/preview-nav.test.ts`; what is checked here is that every other page keeps today's.
 */
describe("the header's phone menu", () => {
  const header = source("components/sections/Header.tsx");

  test("the new menu is drawn only where the page asked for it, and today's panel only where it did not", () => {
    expect(header).toMatch(/\{mobileMenu === "v2" \? \(\s*<MenuBurger/);
    expect(header).toMatch(/\{mobileMenu === "v2" && \(\s*<MobileMenu/);
    expect(header).toMatch(/\{mobileMenuOpen && mobileMenu !== "v2" && \(/);
  });

  test("the new menu is a chunk of its own, fetched by no page that keeps today's", () => {
    expect(header).toMatch(/const MobileMenu = dynamic\(\(\) => import\("\.\/MobileMenu"\)/);
    expect(header).not.toMatch(/^import .* from "\.\/MobileMenu(?:Drill|Parts)?";$/m);
  });

  test("the new menu is handed the header's own links, so a feature is linked one way in the bar and in the menu", () => {
    const menu = /<MobileMenu\b[\s\S]*?\/>/.exec(header)?.[0] ?? "";

    for (const prop of ["featureLinks={featureLinks}", "navItems={navItems}", "resourceItems={resourceItems}", "pathname={pathname}"]) {
      expect(menu).toContain(prop);
    }
  });

  test("the menu keeps today's page-scroll lock and Escape, and the bar goes solid cream behind it only on a phone", () => {
    expect(header).toContain("lockBodyScroll()");
    expect(header).toMatch(/e\.key === "Escape" && mobileMenuOpen/);
    expect(header).toContain('mobileMenu === "v2" && mobileMenuOpen ? " max-lg:bg-[var(--cream)] max-lg:border-[var(--border)]" : ""');
  });

  test("the language row is the header's own switcher, and the other pages' switcher is the picker as it was", () => {
    expect(header).toContain('language={<LanguageSwitcher variant="row" />}');
    expect(source("components/ui/LanguageSwitcher.tsx")).toContain('variant = "picker"');
  });

  test("the query string is read without useSearchParams, so no page loses its static render: the server and the first paint draw the sheet", () => {
    const files = ["Header", "MobileMenu", "MobileMenuParts", "MobileMenuDrill", "MenuBurger"].map((name) => source(`components/sections/${name}.tsx`));

    for (const file of files) expect(file).not.toContain("useSearchParams");
    expect(source("components/sections/MobileMenu.tsx")).toMatch(/useSyncExternalStore\(\s*subscribe,\s*\(\) => menuVariant\(new URLSearchParams\(window\.location\.search\)\),\s*\(\) => "sheet",\s*\)/);
  });
});
