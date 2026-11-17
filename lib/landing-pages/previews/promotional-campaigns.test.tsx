/**
 * The campaigns preview (`/features/promotional-campaigns`):
 * what each section promises a visitor. Every section is rendered under the
 * English catalogs; the headers, the order and the tap targets of all six
 * previews are in `pages.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { DeliverySection } from "@/components/landing-pages/feature-previews/promotional-campaigns/DeliverySection";
import { HowSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/HowSection";
import { IdeasSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/IdeasSection";
import { TextingSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/TextingSection";
import { FEATURE_CATEGORIES } from "../../pricing-features";
import { PLAN_FACTS, TIERS } from "../../plans/plan-facts";
import { loadCatalog } from "../../testing/catalogs";
import { renderPreviewPage, sectionOf } from "../../testing/preview-page";
import { expectInOrder, pictures, renderEn, textOf } from "../../testing/render-en";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "../copy/previews/promotional-campaigns";
import { SAMPLE_BUSINESS, SHARED } from "../copy/shared";

const PAGE = "platform/promotional-campaigns";
const section = (id: string) => sectionOf(PAGE, id);

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

  test("the notification carries the shop's own icon tile: its cup on its card colour", async () => {
    const hero = await section("hero");

    expect(hero.match(/data-shop-icon/g)).toHaveLength(1);
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
  });

  test("the three lock screens are three customers' own phones, each named, on both iPhone and Android", () => {
    expect(visual.phones).toHaveLength(3);
    expect(new Set(visual.phones).size).toBe(3);
    for (const label of visual.phones) expect(label).toMatch(/^[A-Z][a-z]+'s (?:iPhone|Android)$/);
    expect(visual.phones.some((label) => label.endsWith("iPhone"))).toBe(true);
    expect(visual.phones.some((label) => label.endsWith("Android"))).toBe(true);
  });

  test("is an explanation, not a form: no field, no choice, no button to press", () => {
    expect(html()).not.toMatch(/<(?:input|textarea|button|select)\b|role="(?:textbox|radio|radiogroup|switch|tab)"/);
  });

  test("the steps are three numbered rows of a clean table", () => {
    expect(html().match(/<ol\b[^>]*>/g)).toHaveLength(1);
    expect(html().match(/<li\b/g)).toHaveLength(3);
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
});

describe("ideas: give them a reason to come in today", () => {
  const html = () => renderEn(<IdeasSection />);
  const rows = COPY.ideas.rows;

  test("is four ideas, in the copy's order, each with its name, its message on Aurevo's lock screen and who gets it", () => {
    expect(rows.map((row) => row.name)).toEqual(["Slow afternoon", "Something new", "Tonight only", "New customers"]);
    expect(html().match(/<li\b/g)).toHaveLength(4);
    expectInOrder(html(), rows.flatMap((row) => [row.name, SAMPLE_BUSINESS, row.banner.body, row.body]));
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

  test("three go to everyone and the last to customers who joined in the last month: a targeting every plan has", () => {
    const targeting = loadCatalog("en", "pricing.json").pricingPage.comparison.rows.segmentation as Record<"starter" | "growth" | "pro", string>;
    const segmentation = FEATURE_CATEGORIES.flatMap((category) => category.rows).find((row) => row.key === "segmentation");

    expect(rows.filter((row) => row.body !== "Sent to everyone.").map((row) => row.name)).toEqual(["New customers"]);
    expect(rows[3].body).toMatch(/joined in the last month/);
    expect([segmentation?.starter, segmentation?.growth, segmentation?.pro]).toEqual(["text", "text", "text"]);
    expect(targeting.starter).toMatch(/date/i);
    expect(targeting.growth).toMatch(/date/i);
    expect(targeting.pro).toMatch(/^Advanced/);
  });

  test("is presented by moment, never by weekday: the page does not promise a send at a chosen time", () => {
    expect(textOf(html())).not.toMatch(/\b(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day\b|\bweekend\b/i);
  });
});

describe("delivery: see how many customers got it", () => {
  const html = () => renderEn(<DeliverySection />);
  const { report, delivered, missed, after } = COPY.delivery;
  const campaign = COPY.ideas.rows[0];
  const counts = [...delivered, ...missed];
  const reached = delivered.reduce((sum, row) => sum + row.value, 0);
  const reachable = counts.reduce((sum, row) => sum + row.value, 0);
  const rate = Math.round((100 * reached) / reachable);

  test("opens on its header, then the last campaign's report as the dashboard shows it, then what every campaign shows", () => {
    expectInOrder(html(), [
      COPY.delivery.eyebrow,
      COPY.delivery.title,
      COPY.delivery.lead,
      campaign.name,
      report.sentAt,
      report.time,
      report.status,
      SAMPLE_BUSINESS,
      campaign.banner.body,
      report.stats,
      ...counts.flatMap((row) => [row.label, String(row.value)]),
      report.sendAgain,
      after.title,
      ...after.facts.map((fact) => fact.text),
    ]);
  });

  test("the rate it prints is the share of reachable customers the two wallets reached, and the only percentage on it", () => {
    expect([reached, reachable, rate]).toEqual([680, 716, 95]);
    expectInOrder(html(), [`${rate}%`, report.deliveryRate.replace("{rate}%", "").trim(), `${reached} / ${reachable}`, report.reachable]);
    expect(textOf(html()).match(/\d+(?:\.\d+)?\s*%/g)).toEqual([`${rate}%`]);
  });

  test("names both wallets with what each delivered, and counts the customers it missed apart", () => {
    expect(delivered.map((row) => row.label)).toEqual(["Apple Wallet", "Google Wallet"]);
    expect(missed.map((row) => row.label)).toEqual(["Over Google's daily limit", "Card removed"]);
    for (const row of counts) expect(textOf(html())).toContain(`|${row.label}|${row.value}|`);
  });

  test("its message is the slow-afternoon notification from Aurevo, with the shop's icon, once", () => {
    expect(campaign.banner).toEqual(COPY.heroBanner);
    expect(times(html(), campaign.banner.body)).toBe(1);
    expect(html().match(/data-shop-icon/g)).toHaveLength(1);
  });

  test("the report is read out as one picture: the campaign, its message, the rate and the four counts", () => {
    const [alt, ...more] = pictures(html());

    expect(more).toEqual([]);
    for (const words of [campaign.name, campaign.banner.body, report.deliveryRate.replace("{rate}", String(rate)), ...counts.map((row) => `${row.label} ${row.value}`)]) {
      expect({ words, said: alt?.includes(words) }).toEqual({ words, said: true });
    }
  });

  test("is a picture of the dashboard, not a control or a price list: nothing to press, no plan named, no sample caption", () => {
    expect(html()).not.toMatch(/<(?:button|a|input)\b|role="(?:button|tab|tablist)"|\binert\b/);
    expect(textOf(html())).not.toMatch(/\b(?:Starter|Growth|Pro)\b|sample data/i);
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

  test("'Campaigns come with your Stampeo subscription' holds on every plan: each can send campaigns", () => {
    expect(COPY.faq.items[0].answer).toContain("Campaigns come with your Stampeo subscription");
    for (const tier of TIERS) {
      const perMonth = PLAN_FACTS[tier].broadcastsPerMonth;

      expect({ tier, sends: perMonth === "unlimited" || perMonth > 0 }).toEqual({ tier, sends: true });
    }
  });

  test("keeps the contact line under the table", async () => {
    expectInOrder(await section("faq"), [COPY.faq.items[5].answer, SHARED.faq.contact.before, SHARED.faq.contact.link]);
  });
});

describe("plans", () => {
  test("the page mentions a plan once: your plan sets how many campaigns a month, in the limit answer", async () => {
    expect(textOf(await renderPreviewPage(PAGE)).match(/\bplans?\b/g)).toHaveLength(1);
  });
});

describe("the closing card", () => {
  test("says to fill the next slow afternoon, and to send the first campaign this week", async () => {
    expectInOrder(await section("final_cta"), ["Fill your next", "slow afternoon.", "Start your free trial and send your first campaign this week.", SHARED.cta]);
  });
});
