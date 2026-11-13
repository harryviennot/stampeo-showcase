/**
 * The broadcasts preview (`/us/landing-pages/platform/promotional-campaigns`):
 * what each section promises a visitor. Every section is rendered under the
 * English catalogs; the hero, the headers, the order and the tap targets of all
 * five previews are in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { DeliverySection } from "@/components/landing-pages/feature-previews/promotional-campaigns/DeliverySection";
import { IdeasSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/IdeasSection";
import { NumbersSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/NumbersSection";
import { PlansSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/PlansSection";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { PLAN_FACTS } from "@/lib/plans/plan-facts";
import { previewSource } from "../../testing/landing-pages-source";
import { renderPreviewPage } from "../../testing/preview-page";
import { expectInOrder, renderEn, renderEnAsync, textOf } from "../../testing/render-en";
import { mockEnglishServerTranslations } from "../../testing/server-intl";
import { stackZooms } from "../../testing/stacked-rows";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "../copy/previews/promotional-campaigns";
import { SAMPLE_BUSINESS, SHARED } from "../copy/shared";

// The how section holds the async wallet phones.
await mockEnglishServerTranslations();
const { HowSection } = await import("@/components/landing-pages/feature-previews/promotional-campaigns/HowSection");

describe("numbers: your customers keep the card", () => {
  const html = () => renderEn(<NumbersSection />, { us: true });

  test("shows the two measured figures, handwritten, each over its line", () => {
    const figures = [...html().matchAll(/<[^>]*class="[^"]*\bink-figure\b[^"]*"[^>]*>([^<]*)</g)].map((match) => match[1]);

    expect(figures).toEqual(["88%", "95%"]);
    expectInOrder(html(), COPY.numbers.figures.flatMap((figure) => [figure.value, figure.text]));
  });

  test("says where the figures come from once, under the pair, and invents no third figure", () => {
    const text = textOf(html());

    expect(text.match(/Stampeo data, 86 businesses, February to October 2026/g)).toHaveLength(1);
    expect(text.indexOf(COPY.numbers.sourceLine)).toBeGreaterThan(text.indexOf(COPY.numbers.figures[1].text));
    expect(text).not.toMatch(/\b0\b.*fees/);
  });

  test("lays two figures out as a centred pair, not in a row of three with an empty place", () => {
    expect(html()).toContain("sm:[&amp;&gt;ul]:grid-cols-2");
  });

  test("offers the trial right under them, as a feature button and with no second action", () => {
    expectInOrder(html(), [COPY.numbers.sourceLine, SHARED.cta]);
    expect(html()).not.toContain('href="#');
    expect(previewSource("platform/promotional-campaigns", "NumbersSection")).toMatch(/<LpCtaPair\s+location="feature_cta"/);
  });
});

describe("how it works: write it, pick who gets it, send", () => {
  test("tells the three steps behind the card in Apple Wallet and in Google Wallet", async () => {
    const html = await renderEnAsync(<HowSection />);

    expectInOrder(html, COPY.how.cells.flatMap((cell) => [cell.title, cell.body]));
    expect(textOf(html).match(/5 \/ 8/g)?.length).toBeGreaterThanOrEqual(2);
    expect(html.indexOf("5 / 8")).toBeLessThan(html.indexOf(COPY.how.cells[0].body));
  });
});

describe("ideas: give them a reason to come in today", () => {
  const html = () => renderEn(<IdeasSection />);

  test("four rows, every one open, in the copy's order", () => {
    expectInOrder(html(), COPY.ideas.rows.flatMap((row) => [row.eyebrow, row.title, row.body]));
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

    expect(COPY.ideas.rows.filter((row) => "plan" in row).map((row) => row.title)).toEqual(["We miss you", "Close to a reward"]);
    expect(text.match(/\|Pro\|/g)).toHaveLength(2);
    expect(text).not.toContain("Growth and Pro");
  });
});

describe("delivery: see where every message landed", () => {
  const html = () => renderEn(<DeliverySection />);
  const metrics = COPY.delivery.metrics.map((metric) => ({ label: metric.label, value: Number(metric.value) }));
  const total = metrics.reduce((sum, metric) => sum + metric.value, 0);

  test("is one white card: no tabs, nothing hidden", () => {
    expect(html()).not.toContain('role="tablist"');
    expect(html()).not.toMatch(/\binert\b/);
  });

  test("the card words its three facts, and the sample broadcast adds up: 716 cards split by Apple, Google and the rest", () => {
    expectInOrder(html(), [COPY.delivery.tab.title, ...COPY.delivery.tab.facts.map((fact) => fact.text)]);
    expect(total).toBe(716);
    expect(textOf(html())).toContain("716");
    expect(textOf(html())).toMatch(/recipients/);
    expectInOrder(html(), metrics.flatMap((metric) => [metric.label, String(metric.value)]));
  });

  test("the bar is cut in proportion to the four counts, and the whole card is read out as one picture", () => {
    const widths = [...html().matchAll(/data-segment="([^"]+)"[^>]*style="width:([\d.]+)%/g)].map((match) => [match[1], Number(match[2])] as const);

    expect(widths.map(([label]) => label)).toEqual(metrics.map((metric) => metric.label));
    widths.forEach(([, width], index) => expect(width).toBeCloseTo((100 * metrics[index].value) / total, 1));
    expect(html()).toMatch(/role="img"[^>]*aria-label="[^"]*716[^"]*Apple[^"]*412[^"]*"/);
  });

  test("shows no chip and no GDPR line: the plans have their own section", () => {
    expect(textOf(html())).not.toMatch(/Growth and Pro|GDPR/);
  });
});

describe("plans: what each plan can send", () => {
  const html = () => renderEn(<PlansSection />, { us: true });

  test("shows Growth's and Pro's cells, side by side from lg, with no picture", () => {
    expectInOrder(html(), COPY.plans.cells.flatMap((cell) => [cell.title, cell.body]));
    expect(html()).toContain("lg:grid-cols-2");
    expect(html()).not.toContain("overflow-hidden pt-6");
  });

  test("the Growth number is the plan facts', and Pro is unlimited and scheduled", () => {
    expect(textOf(html())).toContain(`${PLAN_FACTS.growth.broadcastsPerMonth} broadcasts a month`);
    expect(textOf(html())).toMatch(/Unlimited, scheduled/);
  });

  test("ends on a Compare plans link to the US pricing page, at least 44px to tap", () => {
    const link = /<a [^>]*href="\/us\/pricing"[^>]*>/.exec(html())?.[0] ?? "";

    expect(link).toContain("min-h-11");
    expectInOrder(html(), [COPY.plans.cells[1].body, COPY.plans.link]);
  });
});

describe("questions: five, written for the US", () => {
  const html = () => renderEn(<LpFaq faq={COPY.faq} />, { us: true });

  test("the page's own five questions, under its own title, in the copy's order", async () => {
    expect(COPY.faq.items).toHaveLength(5);
    expectInOrder(html(), [COPY.faq.title, ...COPY.faq.items.map((item) => item.question)]);
    expectInOrder(await renderPreviewPage("platform/promotional-campaigns"), [COPY.faq.title, ...COPY.faq.items.map((item) => item.question)]);
  });

  test("leaves out what does not fit a US page: GDPR, the SMS comparison and the cap that changes", () => {
    const text = COPY.faq.items.map((item) => `${item.question} ${item.answer}`).join(" ");

    expect(text).not.toMatch(/GDPR|iOS 26|unknown sender|double opt-in/i);
  });
});

describe("what the page leaves out", () => {
  test("no unsourced channel figure or SMS table comes back", async () => {
    expect(textOf(await renderPreviewPage("platform/promotional-campaigns"))).not.toMatch(/\b(?:20|30|45|85)%|iOS 26|Unknown sender/);
  });
});
