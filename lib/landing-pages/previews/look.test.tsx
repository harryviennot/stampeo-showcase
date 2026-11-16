/**
 * The look the US landing pages share: clean surfaces (frosted glass, hairlines, soft shadows) with the site's
 * orange on a section's plain uppercase label, and a keycap for the trial button. What every other page of the
 * site renders without the new props is pinned in `../default-renders.test.tsx` and `../shared-sections.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { PreviewHero } from "@/components/landing-pages/feature-previews/PreviewHero";
import { RelatedPreviews } from "@/components/landing-pages/feature-previews/RelatedPreviews";
import { GlassCard } from "@/components/landing-pages/platform/GlassCard";
import { HeroWords } from "@/components/landing-pages/platform/hero/HeroWords";
import { HoverRows } from "@/components/landing-pages/platform/HoverRows";
import { LpAccentBand } from "@/components/landing-pages/platform/LpAccentBand";
import { LpCtaPair } from "@/components/landing-pages/platform/LpCtaPair";
import { StepsTable } from "@/components/landing-pages/platform/StepsTable";
import { ToggleCard } from "@/components/landing-pages/platform/ToggleCard";
import { TypeMarquee } from "@/components/landing-pages/platform/TypeMarquee";
import { StepHeading } from "@/components/landing-pages/how-it-works/StepHeading";
import { FactList } from "@/components/landing-pages/shared/FactList";
import { IconTile } from "@/components/landing-pages/shared/IconTile";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { LpFinalCta } from "@/components/landing-pages/shared/LpFinalCta";
import { LpHero } from "@/components/landing-pages/shared/LpHero";
import { LpTrialButton } from "@/components/landing-pages/shared/LpTrialButton";
import { EYEBROW, LpHeading } from "@/components/landing-pages/shared/LpSection";
import { CTAButton } from "@/components/ui/CTAButton";
import { FAQList } from "@/components/ui/FAQList";
import { ROOT, filesWith, read } from "../../testing/jsx-source";
import { renderPreviewPage } from "../../testing/preview-page";
import { renderEn, renderEnAsync, textOf } from "../../testing/render-en";
import { PREVIEW_SHARED } from "../copy/previews/shared";
import { LANDING_PAGES } from "../pages";

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

describe("a section's label is plain uppercase text in the site's orange", () => {
  const LABEL = ["uppercase", "tracking-[0.2em]", "font-semibold", "text-[var(--accent)]"];
  const PILL = /rounded-full|bg-\[var\(--accent\)\]\/10|px-4|py-1\.5/;
  const labelTag = (html: string, text: string) => html.match(new RegExp(`<[a-z]+ class="[^"]*">${text}</[a-z]+>`))?.[0] ?? "";

  test("the label class is the small uppercase capitals, and a section's own colour is added to it", () => {
    for (const token of ["text-xs", "font-semibold", "uppercase", "tracking-[0.2em]"]) expect(EYEBROW.split(/\s+/)).toContain(token);
    expect(EYEBROW).not.toMatch(PILL);
  });

  test("a section header prints its label as that text, left or centred, in the site orange and not in a pill", () => {
    for (const align of ["left", "center"] as const) {
      const label = labelTag(renderEn(<LpHeading title="Every part is yours." eyebrow="Every detail" align={align} />), "Every detail");

      for (const token of LABEL) expect(label).toContain(token);
      expect(label).not.toMatch(PILL);
      expect(label).not.toContain("accent-hover");
    }
  });

  test("a step's heading puts its number in a stamp beside the same label", () => {
    const html = renderEn(<StepHeading number={2} label="Step 2" title="Share it" lead="Anywhere." />);
    const heading = html.match(/<p class="([^"]*)">/)?.[1] ?? "";

    for (const token of ["uppercase", "text-[var(--accent)]", "flex", "items-center"]) expect(heading).toContain(token);
    expect(html).not.toMatch(PILL);
    expect(html.indexOf("<svg")).toBeLessThan(html.indexOf("Step 2"));
  });

  test("a hero has no label above its headline", () => {
    const html = renderEn(<HeroWords slug="platform/mobile-scanner" look="column" />);

    expect(html.slice(0, html.indexOf("<h1"))).toBe("");
    expect(html).not.toMatch(PILL);
  });

  test("the labels that name a row or a strip keep their own colours: a row's in the darker orange, the strip's in grey", () => {
    const rows = renderEn(
      <HoverRows items={[{ key: "a", eyebrow: "Reward every visit", title: "Stamps", body: "Add one." }]} visuals={{ a: <i>card</i> }} />,
    );
    const strip = renderEn(<TypeMarquee />);

    expect(labelTag(rows, "Reward every visit")).toContain("uppercase");
    expect(labelTag(rows, "Reward every visit")).toContain("text-[var(--accent-hover)]");
    expect(strip).toMatch(/<p class="[^"]*uppercase[^"]*text-\[var\(--muted-foreground\)\]">Built for/);
  });
});

describe("the trial button is a keycap, and the second action a quiet outline", () => {
  const trial = (html: string) => html.match(/<a [^>]*href="\/en\/onboarding"[^>]*>/)?.[0] ?? "";

  test("the pair's trial button is the keycap, with 3px under it so the stacked pair never touches", () => {
    const html = renderEn(<LpCtaPair location="hero" />, { us: true });

    expect(trial(html)).toMatch(/class="[^"]*\bkeycap\b/);
    expect(trial(html)).toContain("mb-[3px]");
    expect(trial(html)).toContain("sm:mb-0");
  });

  test("the second action is white with a 1.5px ink border and no ledge at rest: it takes the keycap motion, no more", () => {
    const html = renderEn(<LpCtaPair location="hero" />, { us: true });
    const outline = html.match(/<a [^>]*href="#demo"[^>]*>/)?.[0] ?? "";

    expect(outline).toContain("bg-white");
    expect(outline).toContain("border-[1.5px]");
    expect(outline).toContain("border-[var(--near-black)]");
    expect(outline).toMatch(/class="[^"]*\bkeycap keycap-flat\b/);
    expect(outline).not.toMatch(/border-2|hover:bg-\[var\(--foreground\)\]/);
    expect(outline).toContain("h-[52px]");
  });

  test("the closing band stays a clean cream surface: only its button is the keycap", () => {
    const html = renderEn(<LpAccentBand />, { us: true });

    expect(trial(html)).toMatch(/class="[^"]*\bkeycap\b/);
    expect(html).not.toContain("card-stamp");
    expect(html).toContain("bg-[var(--blog-bg)]");
  });

  test("a preview's hero carries the keycap through its pair", () => {
    const html = renderEn(<PreviewHero slug="platform/mobile-scanner" visual={<i>phone</i>} />, { us: true });

    expect(trial(html)).toMatch(/class="[^"]*\bkeycap\b/);
  });

  test("the trial offered between a page's sections is a keycap, not an outline pill", () => {
    const button = trial(renderEn(<LpTrialButton />, { us: true }));

    expect(button).toMatch(/class="[^"]*\bkeycap\b/);
    expect(button).toContain("bg-[var(--accent)]");
    expect(button).not.toMatch(/border-2|bg-transparent/);
  });

  test.each(["how-it-works", "features", "outcomes"] as const)(
    "%s: every trial button of the page, hero to closing ask, is a keycap (the pricing cards' plan buttons are the pricing section's own)",
    async (slug) => {
      const buttons = [...(await renderPreviewPage(slug)).matchAll(/<a class="group inline-flex[^>]*href="\/en\/onboarding"[^>]*>/g)].map((match) => match[0]);

      expect(buttons.length).toBeGreaterThanOrEqual(4);
      expect(buttons.filter((button) => !/class="[^"]*\bkeycap\b/.test(button))).toEqual([]);
    },
  );

  test("the hero's stacked keycap keeps 3px under it for its ledge, as the pair's does, and the closing ask too", async () => {
    const hero = trial(await renderEnAsync(<LpHero slug="how-it-works" />));
    const closing = trial(renderEn(<LpFinalCta slug="how-it-works" />, { us: true }));

    expect(hero).toContain("mb-[3px]");
    expect(hero).toContain("sm:mb-0");
    expect(closing).toContain("mb-[3px]");
  });
});

describe("the surfaces are clean: frosted glass, hairlines and soft shadows, with no ink frame", () => {
  const INK = /card-stamp/;

  test("a floating card is translucent frosted glass with a soft shadow, still drifting when asked", () => {
    const still = renderEn(<GlassCard title="A card">body</GlassCard>);
    const floating = renderEn(<GlassCard float>body</GlassCard>);

    for (const token of ["rounded-[28px]", "bg-white/80", "backdrop-blur-xl", "ring-1", "ring-black/[0.06]"]) expect(still).toContain(token);
    expect(still).not.toMatch(INK);
    expect(floating).toContain("lp-float");
    expect(still).not.toContain("lp-float");
  });

  test("the steps table is one frosted table with a hairline border and hairline rows, and the phones still sink behind it", () => {
    const html = renderEn(<StepsTable cells={[{ title: "Write", body: "A message." }, { title: "Send", body: "Now." }]} visual={<i>phones</i>} />);
    const table = html.match(/<ol class="([^"]*)"/)?.[1] ?? "";

    for (const token of ["rounded-2xl", "border", "border-[var(--border)]", "bg-white/80", "backdrop-blur-xl", "divide-[var(--border)]", "relative", "-mt-10"]) {
      expect(table.split(/\s+/)).toContain(token);
    }
    expect(table).not.toMatch(INK);
  });

  test.each([
    ["two tabs", [{ key: "a", label: "A", title: "One", facts: [], visual: <i>a</i> }, { key: "b", label: "B", title: "Two", facts: [], visual: <i>b</i> }]],
    ["one tab", [{ key: "a", label: "A", title: "One", facts: [], visual: <i>a</i> }]],
  ])("the toggle card's surface is a plain white card with a soft shadow, %s", (_what, tabs) => {
    const html = renderEn(<ToggleCard tabs={tabs} ariaLabel="Panes" />);
    const surface = html.match(/<div class="([^"]*rounded-\[32px\][^"]*)"/)?.[1] ?? "";

    for (const token of ["rounded-[32px]", "bg-white", "ring-1", "ring-black/5"]) expect(surface.split(/\s+/)).toContain(token);
    expect(surface).not.toMatch(INK);
  });

  test("the FAQ table is one white table with a hairline border, while the shared inked cards stay as they are", () => {
    const items = [{ question: "Can I change it?", answer: "Anytime." }];
    const table = renderEn(<FAQList table items={items} />);

    expect(table).toContain('class="divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white"');
    expect(table).not.toMatch(INK);
    expect(renderEn(<FAQList items={items} />)).toContain("blog-card-3d");
  });

  test("a page's own questions get the centred header and the white table, with no label above the title", () => {
    const html = renderEn(<LpFaq faq={{ title: "Card styles, answered", items: [{ question: "Can I change it?", answer: "Anytime." }] }} />, { us: true });

    expect(html).toContain("mx-auto text-center");
    expect(html).toContain("rounded-2xl border border-[var(--border)] bg-white");
    expect(html).not.toMatch(INK);
    expect(html).not.toContain("uppercase");
    expect(html).toContain("min-h-14");
  });

  test("the shared five questions keep the left-aligned header over the inked cards", () => {
    const html = renderEn(<LpFaq />, { us: true });

    expect(html).not.toContain("text-center");
    expect(html).toContain("blog-card-3d");
  });

  test("an icon tile can take the site's orange tone, and no other tone does", () => {
    const tile = (tone: "brand" | "white" | "subtle" | "accent") => renderEn(<IconTile tone={tone}>x</IconTile>);

    expect(tile("brand")).toContain("bg-[var(--accent)]/10");
    expect(tile("brand")).toContain("text-[var(--accent)]");
    for (const tone of ["white", "subtle", "accent"] as const) expect(tile(tone)).not.toContain("bg-[var(--accent)]/10");
  });

  test("a fact's check mark is the darker orange", () => {
    const html = renderEn(<FactList facts={[{ text: "A fact" }]} />);

    expect(html).toContain("text-[var(--accent-hover)]");
    expect(html).not.toContain("text-[var(--accent)]");
  });
});

describe("the links a preview closes with", () => {
  const html = (slug: "platform/card-design" | "platform/geolocation" = "platform/card-design", title?: string) =>
    renderEn(<RelatedPreviews slug={slug} title={title} />);

  test("they are white tiles with a soft shadow, each with a neutral icon tile, and no label above the title", () => {
    const related = html();
    const tiles = [...related.matchAll(/<a [^>]*class="([^"]*)"/g)].map((tile) => tile[1].split(/\s+/));

    expect(tiles).toHaveLength(3);
    for (const tile of tiles) expect(tile).toEqual(expect.arrayContaining(["rounded-2xl", "bg-white", "ring-1", "ring-black/5"]));
    expect(related).not.toMatch(/card-stamp/);
    expect(related).not.toContain("bg-[var(--accent)]/10");
    expect(related).toContain(PREVIEW_SHARED.related.title);
    expect(textOf(related)).not.toMatch(/Keep exploring/);
    expect(related).not.toMatch(/uppercase/);
  });

  test("a page can name them its own way: geolocation sends a visitor on to the ways to bring people back today", () => {
    const geolocation = html("platform/geolocation", "Bring them back today.");
    const hrefs = [...geolocation.matchAll(/<a [^>]*href="([^"]+)"/g)].map((match) => match[1]);

    expect(textOf(geolocation)).toContain("Bring them back today.");
    expect(textOf(geolocation)).not.toContain(PREVIEW_SHARED.related.title);
    expect(hrefs).toEqual(LANDING_PAGES["platform/geolocation"].related?.map((slug) => `/us/landing-pages/${slug}`));
    expect(hrefs).toEqual([
      "/us/landing-pages/platform/push-notifications",
      "/us/landing-pages/platform/promotional-campaigns",
      "/us/landing-pages/platform/analytics",
    ]);
  });

  test("the geolocation card says what it will do, and that it is coming", () => {
    const { geolocation } = PREVIEW_SHARED.related.cards;

    expect(geolocation.title).toBe("Geolocation");
    expect(geolocation.line).toMatch(/^Coming soon/);
  });
});

describe("phones and wallet cards are never framed in ink", () => {
  test("the phones, the wallet card and the captures draw their own depth, with no card-stamp frame", () => {
    const pictures = [
      "components/ui/IPhone.tsx",
      "components/ui/AndroidPhone.tsx",
      "components/ui/PhoneScreenshot.tsx",
      "components/card/WalletCard.tsx",
      "components/landing-pages/shared/PassFrame.tsx",
      "components/landing-pages/shared/WalletPhone.tsx",
      "components/landing-pages/shared/GoogleWalletPhone.tsx",
    ];

    expect(filesWith(pictures.map((file) => join(ROOT, file)), /card-stamp/)).toEqual([]);
  });
});
