/**
 * The geolocation preview (`/features/geolocation`): what a visitor sees in the hero and in
 * each section. Geolocation is not live, so every claim is in the future tense or under a "coming soon" label,
 * with no date, no plan and no wallet named; the copy's own rules are in `copy.test.ts`, and the headers, the
 * order and the tap targets of all six previews in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { HowSection } from "@/components/landing-pages/feature-previews/geolocation/HowSection";
import { PrivacySection } from "@/components/landing-pages/feature-previews/geolocation/PrivacySection";
import { loadCatalog } from "../../testing/catalogs";
import { ROOT, openingTags, read, sourceFiles, stripComments } from "../../testing/jsx-source";
import { pageFile } from "../../testing/landing-pages-source";
import { renderPreviewPage, sectionOf } from "../../testing/preview-page";
import { expectInOrder, pictures, renderEnAsync as render, textOf } from "../../testing/render-en";
import { SHARED } from "../copy/shared";
import { GEOLOCATION_PREVIEW as COPY } from "../copy/previews/geolocation";

const GEOLOCATION_DIR = join(ROOT, "components", "landing-pages", "feature-previews", "geolocation");

/** The date every lock screen of the site shows (the notifications page's and the live geolocation page's are the same line). */
const SITE_LOCK_DATE: string = loadCatalog("en", "features.json").features["notifications-push"].demo.lockScreenDate;

describe("hero: a still lock screen with Aurevo's own words, and the words that say it is coming soon", () => {
  const hero = () => sectionOf("platform/geolocation", "hero");

  test("the headline names the feature and says it is coming soon, then the sub, the trial and the way to the steps", async () => {
    const html = await hero();

    expect(COPY.hero.h1).toMatch(/^Geolocation notifications/);
    expectInOrder(html, [COPY.hero.accent, COPY.hero.sub, SHARED.cta, COPY.hero.secondary]);
    expect([...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((link) => link[1])).toEqual(["/en/onboarding", "#how"]);
  });

  test("the lock screen is Aurevo's, never Stampeo's, and says what an owner would write", async () => {
    const text = textOf(await hero());

    expectInOrder(text, [COPY.banner.sender, COPY.banner.title, COPY.banner.body]);
    expect(text).not.toMatch(/Stampeo/);
  });

  test("the lock screen shows the site's own date, the one every other lock screen shows, never a date of its own", async () => {
    expect(textOf(await hero())).toContain(SITE_LOCK_DATE);
  });

  test("it is one still picture, named for a screen reader: nothing walks, nothing wakes", async () => {
    const html = await hero();

    expect(pictures(html)).toEqual([COPY.hero.alt]);
    expect(html).not.toContain("paper-grain");
  });

  test("says it is coming soon once, in the headline: no chip under the phone and no handwritten note beside it", async () => {
    const html = await hero();

    expect(textOf(html).match(/coming soon/gi)).toHaveLength(1);
    expect(html).not.toMatch(/class="[^"]*\bink-note\b/);
  });

  test("the way to the steps lands on a section that is on the page", async () => {
    expect(await renderPreviewPage("platform/geolocation")).toContain('id="how"');
  });
});

describe("how: three steps in the future tense, in a plain table", () => {
  test("three cells in order, each a title that reads on its own and one line", async () => {
    const html = await render(<HowSection />);

    expectInOrder(html, [COPY.how.eyebrow, COPY.how.title, COPY.how.lead, ...COPY.how.cells.flatMap((cell) => [cell.title, cell.body])]);
    expect(html.match(/<li\b/g)).toHaveLength(3);
  });

  test("no phone sits behind the table: it is three plain cells", async () => {
    expect(pictures(await render(<HowSection />))).toEqual([]);
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
});

describe("the page as a whole", () => {
  test("four questions, the first about the launch date, which we do not have", async () => {
    const faq = await sectionOf("platform/geolocation", "faq");

    expect(COPY.faq.items).toHaveLength(4);
    expect(faq.match(/<summary\b/g)).toHaveLength(4);
    expectInOrder(faq, [COPY.faq.title, ...COPY.faq.items.map((item) => item.question)]);
    expect(COPY.faq.items[0].answer).toContain("don't have a date");
  });

  test("it names no wallet and no date anywhere a visitor reads", async () => {
    const text = textOf(await renderPreviewPage("platform/geolocation"));
    const body = text.slice(text.indexOf("Geolocation notifications"), text.indexOf("Ways to bring customers back today"));

    expect(body).not.toMatch(/Apple|Google|\b20\d\d\b/);
  });
});

describe("the source: the preview's components", () => {
  test("no component or route of the page writes a date, so none can read as a launch date", () => {
    const dated = /\b(?:20\d\d|Q[1-4]|January|February|March|April|May|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/;
    const shared = ["HeroLockScreen.tsx", "LockScreenPhone.tsx"].map((name) => join(GEOLOCATION_DIR, "..", name));
    const files = [...sourceFiles(GEOLOCATION_DIR), pageFile("platform/geolocation"), ...shared];

    expect(files.length).toBeGreaterThan(4);
    expect(files.filter((file) => dated.test(stripComments(read(file)))).map((file) => file.replace(ROOT, ""))).toEqual([]);
  });

  test("none of the sections draws a sign-up button of its own", () => {
    for (const name of ["HowSection", "PrivacySection"]) {
      const source = read(join(GEOLOCATION_DIR, `${name}.tsx`));

      expect(openingTags(source).filter((tag) => tag.name === "CTAButton")).toEqual([]);
    }
  });
});
