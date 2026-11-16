/**
 * The campaigns preview (`/us/landing-pages/platform/promotional-campaigns`):
 * what each section promises a visitor. Every section is rendered under the
 * English catalogs; the headers, the order and the tap targets of all six
 * previews are in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { DeliverySection } from "@/components/landing-pages/feature-previews/promotional-campaigns/DeliverySection";
import { HowSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/HowSection";
import { IdeasSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/IdeasSection";
import { TextingSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/TextingSection";
import { renderPreviewPage, sectionsOf } from "../../testing/preview-page";
import { decodeEntities, expectInOrder, pictures, renderEn, textOf } from "../../testing/render-en";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "../copy/previews/promotional-campaigns";
import { SAMPLE_BUSINESS, SHARED } from "../copy/shared";

const PAGE = "platform/promotional-campaigns";
const section = async (id: string) => sectionsOf(await renderPreviewPage(PAGE)).find((candidate) => candidate.id === id)?.html ?? "";

/** How many times a visitor can read `needle` in `html`. */
const times = (html: string, needle: string) => textOf(html).split(needle).length - 1;

describe("hero: what a campaign is, with one lock screen beside it", () => {
  test("says it in plain words: the headline, its sub, the trial keycap and the way to how it works", async () => {
    const hero = await section("hero");

    expectInOrder(hero, ["Send a promotion to", "every customer's phone.", "Write one message and it appears on every customer's lock screen. No texting fees.", SHARED.cta, "See how it works"]);
    expect(hero.match(/<a [^>]*href="\/en\/onboarding"[^>]*>/)?.[0]).toMatch(/class="[^"]*\bkeycap\b/);
    expect(hero).toContain('href="#how"');
    expect(hero).not.toContain('href="#demo"');
    expect(await renderPreviewPage(PAGE)).toContain('id="how"');
  });

  test("the phone is one picture, an iPhone lock screen with Aurevo's promotion on it, and nothing else is on it", async () => {
    const hero = await section("hero");

    expect(pictures(hero)).toEqual([COPY.hero.alt]);
    expect(COPY.hero.alt).toContain(COPY.heroBanner.body);
    expect(times(hero, COPY.heroBanner.body)).toBe(1);
    expect(textOf(hero)).toContain(SAMPLE_BUSINESS);
    expect(textOf(hero)).not.toContain("Stamp collected");
  });

  test("the notification carries the shop's own icon tile: its card colour with its cup on it, 40px", async () => {
    const hero = await section("hero");
    const tiles = [...hero.matchAll(/<div[^>]*data-shop-icon[^>]*>/g)].map((match) => match[0]);

    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toMatch(/\bh-10\b/);
    expect(tiles[0]).toMatch(/\bw-10\b/);
    expect(tiles[0]).toContain("#4b2e2b");
    expect(hero).toContain("/themes/cafe/cup.png");
  });
});

describe("how it works: one message, written once, on several lock screens", () => {
  const html = () => renderEn(<HowSection />, { us: true });
  const { visual, steps } = COPY.how;
  const message = COPY.heroBanner.body;

  test("opens on its header, then the picture of the message and its lock screens, then the three steps", () => {
    expectInOrder(html(), [
      COPY.how.eyebrow,
      COPY.how.title,
      COPY.how.lead,
      visual.messageLabel,
      message,
      ...visual.phones,
      ...steps.flatMap((step) => [step.title, step.body]),
    ]);
  });

  test("the picture is read out as one: the message written once and the same notification from Aurevo on three customers' lock screens", () => {
    expect(pictures(html())).toEqual([COPY.how.alt]);
    expect(COPY.how.alt).toContain("three customers' lock screens");
  });

  test("the message is on the page four times, once as written and once on each of the three lock screens, each from Aurevo", () => {
    expect(times(html(), message)).toBe(4);
    expect(times(html(), SAMPLE_BUSINESS)).toBe(3);
    expect(visual.phones).toEqual(["On iPhone", "On Android", "On iPhone"]);
  });

  test("is an explanation, not a form: no field, no choice, no button to press", () => {
    expect(html()).not.toMatch(/<(?:input|textarea|button|select)\b|role="(?:textbox|radio|radiogroup|switch|tab)"/);
  });

  test("the steps are three numbered rows of a clean table", () => {
    expect(html().match(/<ol\b[^>]*>/g)).toHaveLength(1);
    expect(html().match(/<li\b/g)).toHaveLength(3);
    expect(html()).not.toContain("card-stamp");
  });
});

describe("texting: send promotions without paying per text", () => {
  const html = () => renderEn(<TextingSection />);

  test("sets text messages against Stampeo campaigns in two columns, each with its three facts in the copy's order", () => {
    expectInOrder(html(), [
      COPY.texting.eyebrow,
      COPY.texting.title,
      COPY.texting.lead,
      COPY.texting.sms.title,
      ...COPY.texting.sms.facts.map((fact) => fact.text),
      COPY.texting.stampeo.title,
      ...COPY.texting.stampeo.facts.map((fact) => fact.text),
    ]);
    expect(html().match(/<ul\b/g)).toHaveLength(2);
    expect(html().match(/<li\b/g)).toHaveLength(6);
  });

  test("is two plain white cards, with no ink frame and no plan named", () => {
    expect(html()).not.toContain("card-stamp");
    expect(html().match(/rounded-\[28px\] bg-white /g)).toHaveLength(2);
    expect(textOf(html())).not.toMatch(/Growth|Starter|\bPro\b|\bplans?\b/);
  });

  test("the claims are Harry's: a fee per text on one side, no fee and no cap on the other", () => {
    expect(COPY.texting.sms.facts[0].text).toBe("A fee for every text you send");
    expect(COPY.texting.stampeo.facts.map((fact) => fact.text)).toEqual([
      "No fee per message",
      "No limit on how many customers it reaches",
      "It goes to the card already in their wallet",
    ]);
  });
});

describe("ideas: give them a reason to come in today", () => {
  const html = () => renderEn(<IdeasSection />);
  const rows = COPY.ideas.rows;

  test("is four ideas, in the copy's order, each with its name, its message on Aurevo's lock screen and who gets it", () => {
    expect(rows.map((row) => row.chip)).toEqual(["Slow afternoon", "Something new", "Tonight only", "New customers"]);
    expect(html().match(/<li\b/g)).toHaveLength(4);
    expectInOrder(html(), rows.flatMap((row) => [row.chip, SAMPLE_BUSINESS, row.banner.body, row.body]));
  });

  test("every message is a lock-screen picture from Aurevo, all four in view at once with nothing to press", () => {
    const labels = pictures(html()).filter((name) => /lock screen/i.test(name));

    expect(labels).toHaveLength(4);
    rows.forEach((row, index) => {
      expect(labels[index]).toContain(SAMPLE_BUSINESS);
      expect(labels[index]).toContain(row.banner.body);
    });
    expect(html()).not.toMatch(/<button\b|role="tab(?:list|panel)?"|\binert\b/);
  });

  test("three go to everyone and the last to customers who joined in the last month, so none depends on a plan", () => {
    expect(rows.map((row) => row.body)).toEqual([
      "Sent to everyone.",
      "Sent to everyone.",
      "Sent to everyone.",
      "Sent only to customers who joined in the last month.",
    ]);
    expect(textOf(html())).not.toMatch(/Growth|Starter|\bPro\b|\bplans?\b/);
  });

  test("is presented by moment, never by weekday: the page does not promise a send at a chosen time", () => {
    expect(textOf(html())).not.toMatch(/\b(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day\b|\bweekend\b/i);
  });

  test("is clean white cards", () => {
    expect(html()).not.toContain("card-stamp");
  });
});

describe("delivery: see how many customers got it", () => {
  const html = () => renderEn(<DeliverySection />);
  const metrics = COPY.delivery.metrics.map((metric) => ({ label: metric.label, value: Number(metric.value) }));
  const total = metrics.reduce((sum, metric) => sum + metric.value, 0);

  test("is one white card: no tabs, nothing hidden", () => {
    expect(html()).not.toContain('role="tablist"');
    expect(html()).not.toMatch(/\binert\b/);
  });

  test("the card names the last campaign and its total, and the sample adds up: 716 customers split by Apple, Google and the rest", () => {
    expectInOrder(html(), [COPY.delivery.card.label, "716", "customers", ...metrics.flatMap((metric) => [metric.label, String(metric.value)])]);
    expect(total).toBe(716);
    expect(COPY.delivery.card.total).toBe(`${total} customers`);
  });

  test("the words beside it say what every campaign shows, in the copy's order", () => {
    expectInOrder(html(), [COPY.delivery.eyebrow, COPY.delivery.title, COPY.delivery.lead, COPY.delivery.tab.title, ...COPY.delivery.tab.facts.map((fact) => fact.text)]);
  });

  test("the bar is cut in proportion to the four counts, and the whole card is read out as one picture", () => {
    const widths = [...html().matchAll(/data-segment="([^"]+)"[^>]*style="width:([\d.]+)%/g)].map((match) => [match[1], Number(match[2])] as const);

    expect(widths.map(([label]) => decodeEntities(label))).toEqual(metrics.map((metric) => metric.label));
    widths.forEach(([, width], index) => expect(width).toBeCloseTo((100 * metrics[index].value) / total, 1));
    expect(pictures(html())).toEqual([expect.stringMatching(/Last campaign.*716 customers.*Got it in Apple Wallet 412/)]);
  });

  test("sits on one white surface, and shows no plan and no GDPR line", () => {
    expect(html().match(/rounded-\[32px\]/g)).toHaveLength(1);
    expect(textOf(html())).not.toMatch(/Growth|Starter|\bPro\b|GDPR/);
  });
});

describe("questions: six, with the one plan sentence linked to pricing", () => {
  test("the page's own six questions, under its own title, in the copy's order", async () => {
    expect(COPY.faq.items).toHaveLength(6);
    // The linked answer is read up to its link: a link's text is its own run of text.
    const answers = COPY.faq.items.map((item) => item.answer.split(" (see pricing)")[0]);

    expectInOrder(await renderPreviewPage(PAGE), [COPY.faq.title, ...COPY.faq.items.flatMap((item, index) => [item.question, answers[index]])]);
  });

  test("the limit question says there is none on reach, that the plan sets how many campaigns a month, and sends 'see pricing' to the US pricing page", async () => {
    const faq = await section("faq");
    const answer = COPY.faq.items[1].answer;
    const link = /<a [^>]*href="([^"]+)"[^>]*>([^<]*see pricing[^<]*)<\/a>/.exec(faq);

    expect(answer).toContain("No limit on how many customers a campaign reaches");
    expect(answer).toContain("Your plan sets how many campaigns you can send each month (see pricing).");
    expect(link?.[1]).toBe("/us/pricing");
    expect(textOf(faq).replaceAll("|", "")).toContain("Your plan sets how many campaigns you can send each month (see pricing).");
    expect(faq.match(/href="\/us\/pricing"/g)).toHaveLength(1);
  });

  test("the answers name no plan: the one mention is the generic 'your plan'", async () => {
    const text = textOf(await section("faq"));

    expect(text).not.toMatch(/Growth|Starter|\bPro\b|[Ee]very plan|[Aa]ll plans/);
    expect(text.match(/\bplans?\b/g)).toHaveLength(1);
  });

  test("no answer carries a price or trial token, so none needs the visitor's region", () => {
    expect(COPY.faq.items.filter((item) => /[{}]/.test(item.answer))).toEqual([]);
  });

  test("keeps the contact line under the table", async () => {
    expectInOrder(await section("faq"), [COPY.faq.items[5].answer, SHARED.faq.contact.before, SHARED.faq.contact.link]);
  });
});

describe("the closing card", () => {
  test("says to fill the next slow afternoon, and to send the first campaign this week", async () => {
    expectInOrder(await section("final_cta"), ["Fill your next", "slow afternoon.", "Start your free trial and send your first campaign this week.", SHARED.cta]);
  });
});

describe("what the page leaves out", () => {
  test("no composer form, no audience figures, no plan section, no ink frame, and 'campaign' where the dashboard says broadcast", async () => {
    const html = await renderPreviewPage(PAGE);
    const text = textOf(html);

    expect(text).not.toMatch(/New broadcast|Send now|Send again|Filtered audience|All enrolled customers|Who will receive this/);
    expect(text).not.toMatch(/Your customers keep the card|\b88%|\b95%|Stampeo data/);
    expect(text).not.toMatch(/broadcast|Starter|Growth|\bPro\b|[Ee]very plan|Sample data/i);
    expect(html).not.toContain("card-stamp");
    expect(sectionsOf(html).map((candidate) => candidate.id)).toEqual(["hero", "how", "texting", "ideas", "delivery", "faq", "final_cta", "related"]);
  });

  test("no unsourced channel figure or SMS table comes back", async () => {
    expect(textOf(await renderPreviewPage(PAGE))).not.toMatch(/\b(?:20|30|45|85)%|iOS 26|Unknown sender/);
  });
});
