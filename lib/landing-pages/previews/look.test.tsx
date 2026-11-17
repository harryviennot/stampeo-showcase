/**
 * The look the US landing pages share: clean surfaces (frosted glass, hairlines, soft shadows) with the site's
 * orange on a section's plain uppercase label, and a keycap for the trial button. What every other page of the
 * site renders without the landing-page props is pinned in `../default-renders.test.tsx` and `../shared-sections.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { GlassCard } from "@/components/landing-pages/platform/GlassCard";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LpCtaPair } from "@/components/landing-pages/platform/LpCtaPair";
import { IconTile } from "@/components/landing-pages/shared/IconTile";
import { LpTrialButton } from "@/components/landing-pages/shared/LpTrialButton";
import { CTAButton } from "@/components/ui/CTAButton";
import { localePath } from "../../hreflang";
import { ROOT, read } from "../../testing/jsx-source";
import { renderPreviewPage } from "../../testing/preview-page";
import { renderEn, textOf } from "../../testing/render-en";
import { PREVIEW_SHARED } from "../copy/previews/shared";
import { LANDING_PAGES, PREVIEW_SLUGS } from "../pages";
import { previewLink } from "../preview-nav";

/** The body of every rule that opens with `header` (a selector or an at-rule) in a stylesheet. */
function blocks(sheet: string, header: string): string[] {
  const found: string[] = [];
  for (let open = sheet.indexOf(`${header} {`); open !== -1; open = sheet.indexOf(`${header} {`, open + 1)) {
    let depth = 0;
    const start = sheet.indexOf("{", open);
    for (let i = start; i < sheet.length; i++) {
      if (sheet[i] === "{") depth++;
      if (sheet[i] === "}" && --depth === 0) {
        found.push(sheet.slice(start + 1, i));
        break;
      }
    }
  }
  return found;
}

const block = (sheet: string, header: string): string => blocks(sheet, header)[0] ?? "";

const INK = "var(--near-black)";

describe("the keycap: a button with the house ink frame and a ledge that presses flat", () => {
  const sheet = read(join(ROOT, "app", "globals.css"));

  test("at rest it has the ink frame and the straight-down ledge of the site's stamped cards", () => {
    const rest = block(sheet, ".keycap");

    expect(rest).toContain(`border: 1.5px solid ${INK}`);
    expect(rest).toContain(`box-shadow: 0 3px 0 ${INK}`);
  });

  test("a pointer that can hover lifts it a pixel with a taller ledge, and pressing sinks it onto the page", () => {
    const hover = block(blocks(sheet, "@media (hover: hover)").find((rules) => rules.includes(".keycap:hover")) ?? "", ".keycap:hover");
    const press = block(sheet, ".keycap:active");

    expect(hover).toContain("translateY(-1px)");
    expect(hover).toContain(`0 4px 0 ${INK}`);
    expect(press).toContain("translateY(3px)");
    expect(press).toContain(`0 0 0 ${INK}`);
    expect(block(sheet, ".keycap")).toContain("80ms");
  });

  test("the outline variant has no ledge until it is hovered or pressed", () => {
    expect(block(sheet, ".keycap-flat")).toContain(`box-shadow: 0 0 0 ${INK}`);
    expect(sheet.indexOf(".keycap-flat {")).toBeGreaterThan(sheet.indexOf(".keycap {"));
  });

  test("for a reader who asks for less motion nothing moves: the lift and the press are gone", () => {
    const calm = blocks(sheet, "@media (prefers-reduced-motion: reduce)").find((rules) => rules.includes(".keycap")) ?? "";

    expect(calm).toContain(".keycap:hover");
    expect(calm).toContain(".keycap:active");
    expect(calm).toContain("transform: none");
  });

  test("CTAButton is a keycap only when asked, and every other caller keeps its soft orange button", () => {
    const plain = renderEn(<CTAButton label="Start" trackAs="hero" />);
    const key = renderEn(<CTAButton label="Start" trackAs="hero" keycap />);

    expect(plain).not.toContain("keycap");
    expect(plain).toContain("shadow-md");
    expect([plain, renderEn(<CTAButton label="Start" trackAs="hero" variant="outline" size="md" />)]).toMatchSnapshot();
    expect(key).toMatch(/class="[^"]*\bkeycap\b/);
    expect(key).toContain("bg-[var(--accent)]");
  });
});

describe("the trial button is a keycap", () => {
  const trial = (html: string) => html.match(/<a [^>]*href="\/en\/onboarding"[^>]*>/)?.[0] ?? "";

  test("the pair's trial button is the keycap", () => {
    const html = renderEn(<LpCtaPair location="hero" />, { us: true });

    expect(trial(html)).toMatch(/class="[^"]*\bkeycap\b/);
  });

  test("the closing band's trial button is the keycap", () => {
    expect(trial(renderEn(<LpAccentBand />, { us: true }))).toMatch(/class="[^"]*\bkeycap\b/);
  });

  test("a preview's hero carries the keycap through its pair", () => {
    const html = renderEn(<PreviewHero slug="platform/mobile-scanner" visual={<i>phone</i>} />, { us: true });

    expect(trial(html)).toMatch(/class="[^"]*\bkeycap\b/);
  });

  test("the trial offered between a page's sections is a keycap, not an outline pill", () => {
    const button = trial(renderEn(<LpTrialButton location="platform_apps" />, { us: true }));

    expect(button).toMatch(/class="[^"]*\bkeycap\b/);
    expect(button).toContain("bg-[var(--accent)]");
    expect(button).not.toMatch(/border-2|bg-transparent/);
  });
});

describe("the surfaces are clean: no preview page has an ink frame", () => {
  test.each(PREVIEW_SLUGS)("%s", async (slug) => {
    expect(await renderPreviewPage(slug)).not.toContain("card-stamp");
  });

  test("a floating card drifts only when asked", () => {
    expect(renderEn(<GlassCard float>body</GlassCard>)).toContain("lp-float");
    expect(renderEn(<GlassCard title="A card">body</GlassCard>)).not.toContain("lp-float");
  });

  test("an icon tile can take the site's orange tone, and no other tone does", () => {
    const tile = (tone: "brand" | "white" | "subtle" | "accent") => renderEn(<IconTile tone={tone}>x</IconTile>);

    expect(tile("brand")).toContain("bg-[var(--accent)]/10");
    expect(tile("brand")).toContain("text-[var(--accent)]");
    for (const tone of ["white", "subtle", "accent"] as const) expect(tile(tone)).not.toContain("bg-[var(--accent)]/10");
  });
});

describe("the links a preview closes with", () => {
  const html = (slug: "platform/card-design" | "platform/geolocation" = "platform/card-design", title?: string) =>
    renderEn(<RelatedPreviews slug={slug} title={title} />);

  test("they are three tiles under the page's own title, with no label above it", () => {
    const related = html();
    const tiles = [...related.matchAll(/<a [^>]*class="([^"]*)"/g)];

    expect(tiles).toHaveLength(3);
    expect(related).toContain(PREVIEW_SHARED.related.title);
    expect(textOf(related)).not.toMatch(/Keep exploring/);
    expect(related).not.toMatch(/uppercase/);
  });

  test("a page can name them its own way: geolocation sends a visitor on to the ways to bring people back today", () => {
    const geolocation = html("platform/geolocation", "Bring them back today.");
    const hrefs = [...geolocation.matchAll(/<a [^>]*href="([^"]+)"/g)].map((match) => match[1]);

    expect(textOf(geolocation)).toContain("Bring them back today.");
    expect(textOf(geolocation)).not.toContain(PREVIEW_SHARED.related.title);
    expect(hrefs).toEqual(LANDING_PAGES["platform/geolocation"].related?.map((slug) => localePath("en", previewLink(slug, "en").href)));
    expect(hrefs).toEqual(["/en/features/push-notifications", "/en/features/promotional-campaigns", "/en/features/analytics"]);
  });

  test("the geolocation card says what it will do, and that it is coming", () => {
    const { geolocation } = PREVIEW_SHARED.related.cards;

    expect(geolocation.title).toBe("Geolocation");
    expect(geolocation.line).toMatch(/^Coming soon\b/);
  });
});
