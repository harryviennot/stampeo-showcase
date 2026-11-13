/**
 * The broadcasts preview (`/us/landing-pages/platform/promotional-campaigns`): what each
 * section promises a visitor. Sections that draw only sync components are rendered on the
 * server, which is what a visitor gets first and what a phone or a reader who asks for less
 * motion keeps; the one that nests the async wallet phones is read as source.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { DeliverySection } from "@/components/landing-pages/feature-previews/promotional-campaigns/DeliverySection";
import { IdeasSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/IdeasSection";
import { NumbersSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/NumbersSection";
import { PlansSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/PlansSection";
import { PLAN_FACTS } from "@/lib/plans/plan-facts";
import { code, findTag, literalAttr, openingTags } from "../../testing/jsx-source";
import { COMPONENTS_DIR, pageFile, renderedSections } from "../../testing/landing-pages-source";
import { renderEn, textOf } from "../../testing/render-en";
import { stackZooms } from "../../testing/stacked-rows";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "../copy/previews/promotional-campaigns";
import { SAMPLE_BUSINESS, SHARED } from "../copy/shared";
import { LANDING_PAGES } from "../pages";

const SLUG = "platform/promotional-campaigns";
const DIR = join(COMPONENTS_DIR, "feature-previews", "promotional-campaigns");
const page = () => code(pageFile(SLUG));
const source = (name: string) => code(join(DIR, `${name}.tsx`));

/** The lines of `lines`, each found, in the order they are printed in `text`. */
function inOrder(text: string, lines: readonly string[]) {
  const at = lines.map((line) => text.indexOf(line));
  expect(at.every((index) => index > -1)).toBe(true);
  expect(at).toEqual([...at].sort((a, b) => a - b));
}

describe("the page", () => {
  test("is built: the foundation's marker is gone, and every section of the registry is there once, in order", () => {
    expect(page()).not.toContain("TODO(STA-552 builder)");
    expect(renderedSections(pageFile(SLUG))).toEqual([...LANDING_PAGES[SLUG].sections]);
  });

  test("has a single trial button in its hero and no demo to send a visitor to", () => {
    expect(findTag(page(), "PreviewHero")?.attrs).toMatch(/\bsecondary=\{null\}/);
    expect(openingTags(page()).some((tag) => tag.name === "LpDemo")).toBe(false);
  });

  test("the middle of the page is its sections in the brief's order, the figures set between two hairlines, the questions last", () => {
    const tags = openingTags(page()).map((tag) => tag.name);
    const middle = ["Hairline", "NumbersSection", "Hairline", "HowSection", "IdeasSection", "DeliverySection", "PlansSection", "LpFaq"];
    let from = 0;
    const at = middle.map((name) => {
      const found = tags.indexOf(name, from);
      from = found + 1;
      return found;
    });

    expect(at.every((index) => index > -1)).toBe(true);
    expect(at).toEqual([...at].sort((a, b) => a - b));
    expect(tags.indexOf("PreviewHero")).toBeLessThan(at[0]);
    expect(tags.indexOf("LpAccentBand")).toBeGreaterThan(at.at(-1) ?? Infinity);
    expect(findTag(page(), "LpFaq")?.attrs).toContain("faq={PROMOTIONAL_CAMPAIGNS_PREVIEW.faq}");
  });
});

describe("numbers: your customers keep the card", () => {
  const html = () => renderEn(<NumbersSection />, { us: true });

  test("is headed by its eyebrow, title and lead, then the two measured figures, handwritten, each over its line", () => {
    const text = textOf(html());
    const figures = [...html().matchAll(/<[^>]*class="[^"]*\bink-figure\b[^"]*"[^>]*>([^<]*)</g)].map((match) => match[1]);

    inOrder(text, [COPY.numbers.eyebrow, COPY.numbers.title, COPY.numbers.lead]);
    expect(figures).toEqual(["88%", "95%"]);
    inOrder(text, COPY.numbers.figures.flatMap((figure) => [figure.value, figure.text]));
    expect(html()).toContain('data-landing-section="numbers"');
  });

  test("says where the figures come from once, under the pair, and invents no third figure", () => {
    const text = textOf(html());

    expect(text.match(/Stampeo data, 86 businesses, February to October 2026/g)).toHaveLength(1);
    expect(text.indexOf(COPY.numbers.sourceLine)).toBeGreaterThan(text.indexOf(COPY.numbers.figures[1].text));
    expect(text).not.toMatch(/\b0\b.*fees/);
    expect(source("NumbersSection")).toContain("source={COPY.numbers.sourceLine}");
  });

  test("lays two figures out as a centred pair, not in a row of three with an empty place", () => {
    expect(html()).toContain("sm:[&amp;&gt;ul]:grid-cols-2");
  });

  test("offers the trial right under them, as a feature button and with no second action", () => {
    const text = textOf(html());
    const pair = findTag(source("NumbersSection"), "LpCtaPair");

    expect(literalAttr(pair?.attrs ?? "", "location")).toBe("feature_cta");
    expect(pair?.attrs).toMatch(/\bsecondary=\{null\}/);
    expect(text.indexOf(SHARED.cta)).toBeGreaterThan(text.indexOf(COPY.numbers.sourceLine));
  });
});

describe("how it works: write it, pick who gets it, send", () => {
  test("is headed by its eyebrow, title and lead and tells the three steps, with Pro's extras named in the steps themselves", () => {
    const how = source("HowSection");
    const header = findTag(how, "LpSection");

    expect(literalAttr(header?.attrs ?? "", "section")).toBe("how");
    for (const field of ["eyebrow", "title", "lead"]) expect(header?.attrs).toContain(`${field}={COPY.how.${field}}`);
    expect(literalAttr(header?.attrs ?? "", "align")).toBe("center");
    expect(findTag(how, "StepsTable")?.attrs).toContain("cells={COPY.how.cells}");
    expect(COPY.how.cells.map((cell) => cell.title)).toEqual(["Write", "Pick who", "Send"]);
    expect(COPY.how.cells[1].body).toContain("Pro adds");
    expect(COPY.how.cells[2].body).toContain("on Pro");
  });

  test("sinks the card in Apple Wallet and in Google Wallet behind the table, both at the 5 of 8 the banner counts", () => {
    const how = source("HowSection");
    const stamps = (name: string) => /stamps=\{(\d+)\}/.exec(findTag(how, name)?.attrs ?? "")?.[1];
    const table = how.slice(how.indexOf("<StepsTable"));

    expect(table.indexOf("<WalletPhone")).toBeGreaterThan(-1);
    expect(table.indexOf("<GoogleWalletPhone")).toBeGreaterThan(table.indexOf("<WalletPhone"));
    expect(stamps("WalletPhone")).toBe("5");
    expect(stamps("GoogleWalletPhone")).toBe("5");
  });
});

describe("ideas: give them a reason to come in today", () => {
  const html = () => renderEn(<IdeasSection />);

  test("is headed by its eyebrow, title and lead, then four rows, every one open, in the copy's order", () => {
    const text = textOf(html());

    inOrder(text, [COPY.ideas.eyebrow, COPY.ideas.title, COPY.ideas.lead]);
    inOrder(text, COPY.ideas.rows.flatMap((row) => [row.eyebrow, row.title, row.body]));
    expect(html()).toContain('data-landing-section="ideas"');
    expect(html().match(/data-open="true"/g)).toHaveLength(4);
    expect(html().match(/data-open="false"/g)).toBeNull();
  });

  test("each row shows its message on Aurevo's lock screen, read out as a picture", () => {
    const labels = [...html().matchAll(/role="img" aria-label="([^"]*)"/g)].map((match) => match[1].replaceAll("&#x27;", "'"));

    expect(labels).toHaveLength(4);
    COPY.ideas.rows.forEach((row, index) => {
      expect(labels[index]).toContain(SAMPLE_BUSINESS);
      expect(labels[index]).toContain(row.banner.body);
    });
    expect(textOf(html())).toContain("Quiet afternoon? Your second coffee is half price until 5pm.");
  });

  test("on a phone each notification goes under its words, printed at least as large as it is drawn", () => {
    const zooms = stackZooms(html());
    const narrow = [...html().matchAll(/--narrow-w:(\d+)px/g)].map((match) => Number(match[1]));
    const drawn = [...html().matchAll(/<div class="origin-top-left[^"]*" style="width:(\d+)px/g)].map((match) => Number(match[1]));

    expect(zooms).toHaveLength(COPY.ideas.rows.length);
    zooms.forEach((zoom, row) => expect((narrow[row] * zoom) / drawn[row]).toBeGreaterThanOrEqual(1));
  });

  test("only the two rows that need Pro's targeting say Pro", () => {
    const text = textOf(html());
    const chips = COPY.ideas.rows.filter((row) => "plan" in row).map((row) => row.title);

    expect(chips).toEqual(["We miss you", "Close to a reward"]);
    expect(text.match(/\|Pro\|/g)).toHaveLength(2);
    expect(text).not.toContain("Growth and Pro");
  });
});

describe("delivery: see where every message landed", () => {
  const html = () => renderEn(<DeliverySection />);
  const metrics = COPY.delivery.metrics.map((metric) => ({ label: metric.label, value: Number(metric.value) }));
  const total = metrics.reduce((sum, metric) => sum + metric.value, 0);

  test("is headed by its eyebrow, title and lead, on one white card: no tabs, nothing hidden", () => {
    const text = textOf(html());

    inOrder(text, [COPY.delivery.eyebrow, COPY.delivery.title, COPY.delivery.lead]);
    expect(html()).toContain('data-landing-section="delivery"');
    expect(html()).not.toContain('role="tablist"');
    expect(html()).not.toMatch(/\binert\b/);
  });

  test("the card words its three facts, and the sample broadcast adds up: 716 cards split by Apple, Google and the rest", () => {
    const text = textOf(html());

    inOrder(text, [COPY.delivery.tab.title, ...COPY.delivery.tab.facts.map((fact) => fact.text)]);
    expect(total).toBe(716);
    expect(text).toContain("716");
    expect(text).toMatch(/recipients/);
    inOrder(text, metrics.flatMap((metric) => [metric.label, String(metric.value)]));
  });

  test("the bar is cut in proportion to the four counts, and the whole card is read out as one picture", () => {
    const widths = [...html().matchAll(/data-segment="([^"]+)"[^>]*style="width:([\d.]+)%/g)].map((match) => [match[1], Number(match[2])] as const);

    expect(widths.map(([label]) => label)).toEqual(metrics.map((metric) => metric.label));
    widths.forEach(([, width], index) => expect(width).toBeCloseTo((100 * metrics[index].value) / total, 1));
    expect(html()).toMatch(/role="img"[^>]*aria-label="[^"]*716[^"]*Apple[^"]*412[^"]*"/);
  });

  test("shows no chip and no GDPR line: the plans have their own section", () => {
    expect(textOf(html())).not.toMatch(/Growth and Pro|GDPR|Every plan/);
  });
});

describe("plans: what each plan can send", () => {
  const html = () => renderEn(<PlansSection />, { us: true });

  test("is headed by its eyebrow, title and lead, then Growth's and Pro's cells, side by side from lg, with no picture", () => {
    const text = textOf(html());

    inOrder(text, [COPY.plans.eyebrow, COPY.plans.title, COPY.plans.lead]);
    inOrder(text.slice(text.indexOf(COPY.plans.lead) + COPY.plans.lead.length), COPY.plans.cells.flatMap((cell) => [cell.title, cell.body]));
    expect(html()).toContain('data-landing-section="plans"');
    expect(html()).toContain("lg:grid-cols-2");
    expect(html()).not.toContain("overflow-hidden pt-6");
  });

  test("the Growth number is the plan facts', never typed, and Pro is unlimited and scheduled", () => {
    const [growth, pro] = COPY.plans.cells;

    expect(growth.body).toContain(`${PLAN_FACTS.growth.broadcastsPerMonth} broadcasts a month`);
    expect(source("PlansSection")).not.toMatch(/\d+ a month/);
    expect(pro.body).toMatch(/^Unlimited, scheduled/);
  });

  test("ends on a Compare plans link to the US pricing page, at least 44px to tap", () => {
    const link = /<a [^>]*href="\/us\/pricing"[^>]*>/.exec(html())?.[0] ?? "";

    expect(link).not.toBe("");
    expect(link).toContain("min-h-11");
    expect(textOf(html())).toContain(COPY.plans.link);
    expect(textOf(html()).indexOf(COPY.plans.link)).toBeGreaterThan(textOf(html()).indexOf(COPY.plans.cells[1].body));
  });
});

describe("questions: five, written for the US", () => {
  const html = () => renderEn(<LpFaq faq={COPY.faq} />, { us: true });

  test("the page's own five questions, under its own title, in the copy's order", () => {
    const text = textOf(html());

    expect(COPY.faq.items).toHaveLength(5);
    inOrder(text, [COPY.faq.title, ...COPY.faq.items.map((item) => item.question)]);
    expect(html()).toContain('data-landing-section="faq"');
  });

  test("opens on the FAQ eyebrow, centred over the title like the page's other headers", () => {
    inOrder(textOf(html()), ["FAQ", COPY.faq.title]);
    expect(html()).toContain("mx-auto text-center");
  });

  test("leaves out what does not fit a US page: GDPR, the SMS comparison and the cap that changes", () => {
    const text = COPY.faq.items.map((item) => `${item.question} ${item.answer}`).join(" ");

    expect(text).not.toMatch(/GDPR|iOS 26|unknown sender|double opt-in/i);
  });
});

describe("what the page leaves out", () => {
  const rendered = () =>
    [renderEn(<NumbersSection />, { us: true }), renderEn(<IdeasSection />), renderEn(<DeliverySection />), renderEn(<PlansSection />, { us: true })].join("\n");

  test("no Every plan chip, no Sample data caption, no em dash", () => {
    const text = textOf(rendered());

    expect(text).not.toContain("Every plan");
    expect(text).not.toMatch(/sample data/i);
    expect(text).not.toContain("—");
  });

  test("no notification is sent by Stampeo, and no unsourced channel figure or SMS table comes back", () => {
    expect(rendered()).not.toMatch(/aria-label="[^"]*Stampeo/);
    expect(textOf(rendered())).not.toMatch(/\b(?:20|30|45|85)%|iOS 26|Unknown sender/);
  });

  test("the sections bring no sign-up button of their own: the figures, the hero and the cream card carry the trial buttons", () => {
    for (const name of ["HowSection", "IdeasSection", "DeliverySection", "PlansSection"]) {
      expect(openingTags(source(name)).some((tag) => tag.name === "CTAButton")).toBe(false);
    }
  });
});
