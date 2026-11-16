/**
 * The geolocation preview (`/us/landing-pages/platform/geolocation`): what a visitor sees in each
 * section. Geolocation is not live, so every claim is in the future tense or under a "coming soon"
 * label, with no date and the Pro plan; what is live today is set apart from it. The headers, the
 * order and the tap targets of all six previews are in `pages.test.tsx`, and the copy's own rules
 * (no date, no wallet named for the feature) in `copy.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { GeofencingHeroAnimation } from "@/components/features/geolocalisation/GeofencingHeroAnimation";
import { HowSection } from "@/components/landing-pages/feature-previews/geolocation/HowSection";
import { PrivacySection } from "@/components/landing-pages/feature-previews/geolocation/PrivacySection";
import { StatusSection } from "@/components/landing-pages/feature-previews/geolocation/StatusSection";
import { loadCatalog } from "../../testing/catalogs";
import { ROOT, openingTags, read, sourceFiles, stripComments } from "../../testing/jsx-source";
import { otherCallers, pageFile } from "../../testing/landing-pages-source";
import { renderPreviewPage } from "../../testing/preview-page";
import { expectInOrder, pictures, renderEnAsync as render, renderEn, textOf } from "../../testing/render-en";
import { GEOLOCATION_PREVIEW as COPY } from "../copy/previews/geolocation";

const ANIMATION = join(ROOT, "components", "features", "geolocalisation", "GeofencingHeroAnimation.tsx");
const GEOLOCATION_DIR = join(ROOT, "components", "landing-pages", "feature-previews", "geolocation");

/** The optional props the preview gives the live hero animation. */
const PREVIEW_PROPS = ["sender", "title", "body", "icon"];

/** The date every lock screen of the site shows (the notifications page's and the live geolocation page's are the same line). */
const SITE_LOCK_DATE: string = loadCatalog("en", "features.json").features["notifications-push"].demo.lockScreenDate;

describe("hero: the paper map with a customer walking in, and Aurevo's own words on the lock screen", () => {
  const hero = async () => {
    const html = await renderPreviewPage("platform/geolocation");

    return html.slice(html.indexOf('data-landing-section="hero"'), html.indexOf('data-landing-section="status"'));
  };

  test("the lock screen is Aurevo's, never Stampeo's, and says what an owner would write", async () => {
    const text = textOf(await hero());

    expectInOrder(text, [COPY.banner.sender, COPY.banner.title, COPY.banner.body]);
    expect(text).not.toMatch(/Stampeo/);
  });

  test("the lock screen shows the site's own date, the one every other lock screen shows, never a date of its own", async () => {
    const live = loadCatalog("en", "features.json").features.geolocalisation.demo.lockScreenDate;

    expect(live).toBe(SITE_LOCK_DATE);
    expect(textOf(await hero())).toContain(SITE_LOCK_DATE);
  });

  test("one handwritten note on the stage says it is coming soon", async () => {
    const html = await hero();

    expect(html.match(/class="[^"]*\bink-note\b/g)).toHaveLength(1);
    expect(html).toMatch(new RegExp(`class="[^"]*\\bink-note\\b[^"]*"[^>]*>${COPY.heroNote}<`));
  });

  test("the animation with none of the preview's props is the live page's, to the byte", () => {
    expect(renderEn(<GeofencingHeroAnimation />)).toMatchSnapshot();
  });

  test("the live page and every other caller pass none of the preview's props", () => {
    const callers = otherCallers("GeofencingHeroAnimation", ANIMATION);

    expect(callers.length).toBeGreaterThan(0);
    for (const { file, attrs } of callers) {
      for (const prop of PREVIEW_PROPS) {
        expect({ file: file.replace(ROOT, ""), prop, passed: new RegExp(`(?:^|\\s)${prop}(?![\\w-])`).test(attrs) }).toEqual({
          file: file.replace(ROOT, ""),
          prop,
          passed: false,
        });
      }
    }
  });

  test("a sender, a title, a body and an icon replace the live words; the date and the rest of the stage stay", () => {
    const html = renderEn(<GeofencingHeroAnimation sender="Aurevo" title="A title" body="A body" icon={<span>an icon</span>} />);
    const text = textOf(html);

    expectInOrder(text, [SITE_LOCK_DATE, "Aurevo", "A title", "A body"]);
    expect(text).toContain("an icon");
    expect(text).not.toMatch(/Stampeo/);
    expect(html).toContain("aspect-[100/96]");
  });
});

describe("status: what is live today, and what is coming", () => {
  const column = (html: string, which: "today" | "soon") => html.match(new RegExp(`<div\\b[^>]*data-column="${which}"[\\s\\S]*?</ul>`))?.[0] ?? "";

  test("two columns, Today first: three live facts with a check each, the broadcasts among them with no plan chip", async () => {
    const today = column(await render(<StatusSection />), "today");

    expectInOrder(today, [COPY.status.today.title, ...COPY.status.today.facts.flatMap((fact) => [fact.text, ...(fact.plan ? [fact.plan] : [])])]);
    expect(today.match(/data-mark="live"/g)).toHaveLength(3);
    expect(today).not.toContain('data-mark="planned"');
  });

  test("Coming soon: three planned facts under a Pro chip, each with a clock and none with a check", async () => {
    const soon = column(await render(<StatusSection />), "soon");

    expectInOrder(soon, [COPY.status.soon.title, COPY.status.soon.plan, ...COPY.status.soon.facts.map((fact) => fact.text)]);
    expect(soon.match(/data-mark="planned"/g)).toHaveLength(3);
    expect(soon).not.toContain('data-mark="live"');
  });

  test("the whole table is one stamped card, Today before Coming soon, and it stacks on a phone", async () => {
    const html = await render(<StatusSection />);

    expect(html.indexOf('data-column="today"')).toBeLessThan(html.indexOf('data-column="soon"'));
    expect(html).toContain("card-stamp");
    expect(html).toContain("lg:grid-cols-2");
  });

  test("what is coming names no wallet and no date, and the live column is the only one that does", async () => {
    const html = await render(<StatusSection />);
    const soon = textOf(column(html, "soon"));

    expect(soon).not.toMatch(/Apple|Google|Wallet|\b20\d\d\b|January|February|March|April|May|June|July|August|September|October|November|December|Q[1-4]/);
    expect(textOf(column(html, "today"))).toContain("Apple Wallet and Google Wallet");
  });
});

describe("how: three steps in the future tense, and the lock screen they end on", () => {
  test("three cells in order, and a lock-screen phone that shows Aurevo's line", async () => {
    const html = await render(<HowSection />);

    expectInOrder(html, [COPY.how.eyebrow, COPY.how.title, COPY.how.lead, ...COPY.how.cells.flatMap((cell) => [cell.title, cell.body])]);
    expect(html.match(/<li\b/g)).toHaveLength(3);
    expect(pictures(html)).toEqual([expect.stringContaining(`notification from ${COPY.banner.sender}: ${COPY.banner.body}`)]);
  });

  test("the table is the stamped steps table and the phone is on the same warm lock screen as the hero's, with the site's date", async () => {
    const html = await render(<HowSection />);

    expect(html).toContain("card-stamp");
    expect(textOf(html)).toContain(COPY.banner.title);
    expect(textOf(html)).toContain(SITE_LOCK_DATE);
    expect(textOf(html)).not.toMatch(/Stampeo/);
  });
});

describe("privacy: their location stays on their phone", () => {
  test("a drawing, named for a screen reader, then the three facts", async () => {
    const html = await render(<PrivacySection />);

    expect(pictures(html)).toEqual([COPY.privacy.alt]);
    expectInOrder(html, [COPY.privacy.eyebrow, COPY.privacy.title, COPY.privacy.lead, ...COPY.privacy.facts.map((fact) => fact.text)]);
  });

  test("the line to the cloud is drawn dash by dash, and the cross that cuts it lands last", async () => {
    const html = await render(<PrivacySection />);
    const delays = (part: string) =>
      [...html.matchAll(new RegExp(`data-part="${part}"[^>]*--ink-delay:([\\d.]+)s`, "g"))].map((match) => Number(match[1]));
    const dashes = delays("dash");
    const cross = delays("cross");

    expect(html).toMatch(/class="[^"]*\bink-draw\b/);
    expect(dashes.length).toBeGreaterThanOrEqual(5);
    expect(cross).toHaveLength(2);
    expect(Math.min(...cross)).toBeGreaterThan(Math.max(...dashes));
  });

  test("the drawing sits in the stamped stage, and none of its words is a claim that needs a plan", async () => {
    const html = await render(<PrivacySection />);

    expect(html).toContain("card-stamp");
    expect(textOf(html)).not.toMatch(/Growth|Starter|Every plan/);
  });
});

describe("the source: the preview's components", () => {
  test("no component or route of the page writes a date, so none can read as a launch date", () => {
    const dated = /\b(?:20\d\d|Q[1-4]|January|February|March|April|May|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/;
    const files = [...sourceFiles(GEOLOCATION_DIR), pageFile("platform/geolocation")];

    expect(files.length).toBeGreaterThan(5);
    expect(files.filter((file) => dated.test(stripComments(read(file)))).map((file) => file.replace(ROOT, ""))).toEqual([]);
  });

  test("each section is its own file, and none draws a sign-up button of its own", () => {
    for (const name of ["StatusSection", "HowSection", "PrivacySection"]) {
      const source = read(join(ROOT, "components", "landing-pages", "feature-previews", "geolocation", `${name}.tsx`));

      expect(openingTags(source).filter((tag) => tag.name === "CTAButton")).toEqual([]);
    }
  });
});
