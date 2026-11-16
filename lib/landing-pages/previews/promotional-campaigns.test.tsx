/**
 * The broadcasts preview (`/us/landing-pages/platform/promotional-campaigns`):
 * what each section promises a visitor. Every section is rendered under the
 * English catalogs; the hero, the headers, the order and the tap targets of all
 * six previews are in `pages.test.tsx`, and when the composer sends and counts is
 * in `../broadcast-composer.test.ts`.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { NotificationPhoneDemo } from "@/components/features/notifications-push/NotificationPhoneDemo";
import { ComposerSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/ComposerSection";
import { DeliverySection } from "@/components/landing-pages/feature-previews/promotional-campaigns/DeliverySection";
import { IdeasSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/IdeasSection";
import { NumbersSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/NumbersSection";
import { PlansSection } from "@/components/landing-pages/feature-previews/promotional-campaigns/PlansSection";
import { LpFaq } from "@/components/landing-pages/shared/LpFaq";
import { lpBanner } from "@/components/landing-pages/shared/banner";
import { PLAN_FACTS } from "@/lib/plans/plan-facts";
import { ROOT } from "../../testing/jsx-source";
import { otherCallers, previewSource } from "../../testing/landing-pages-source";
import { renderPreviewPage } from "../../testing/preview-page";
import { expectInOrder, pictures, renderEn, textOf } from "../../testing/render-en";
import { renderAs } from "../../testing/visitor-seams";
import { PROMOTIONAL_CAMPAIGNS_PREVIEW as COPY } from "../copy/previews/promotional-campaigns";
import { SAMPLE_BUSINESS, SHARED } from "../copy/shared";

/** How many times a visitor can read `needle` on the page. */
const times = (html: string, needle: string) => textOf(html).split(needle).length - 1;

describe("composer: write it, pick who gets it, send", () => {
  const { card } = COPY.composer;
  const html = (reducedMotion = false) => renderAs({ reducedMotion }, () => renderEn(<ComposerSection />, { us: true }));

  test("is the dashboard's New broadcast screen, in its own words and its own order, ending on Send now", () => {
    expectInOrder(html(), [
      card.title,
      "Message",
      card.message.body,
      card.audience.title,
      card.audience.all,
      card.audience.filtered,
      card.schedule.title,
      card.schedule.now,
      card.schedule.later,
      card.send,
    ]);
  });

  test("the message is the happy-hour broadcast, in a field nobody can edit", () => {
    const field = /<div[^>]*role="textbox"[^>]*>([\s\S]*?)<\/div>/.exec(html());

    expect(field?.[0]).toContain('aria-readonly="true"');
    expect(field?.[0]).toContain('aria-label="Message"');
    expect(textOf(field?.[1] ?? "")).toBe(card.message.body);
    expect(card.message.body).toBe("Quiet afternoon? Your second coffee is half price until 5pm.");
  });

  /** The radio buttons of the card, each with what it says and whether it is picked or waits on Pro. */
  const choices = () =>
    [...html().matchAll(/<button[^>]*role="radio"[^>]*>([\s\S]*?)<\/button>/g)].map((match) => ({
      tag: match[0].slice(0, match[0].indexOf(">") + 1),
      text: textOf(match[1]).replaceAll("|", " ").trim(),
    }));

  test("who gets it and when: each question names its group, and the choices follow in the dashboard's order", () => {
    const groups = [...html().matchAll(/<div[^>]*role="radiogroup"[^>]*aria-labelledby="([^"]+)"/g)].map(
      (match) => new RegExp(`<p id="${match[1]}"[^>]*>([^<]*)</p>`).exec(html())?.[1],
    );

    expect(groups).toEqual([card.audience.title, card.schedule.title]);
    expect(choices().map((choice) => choice.text)).toEqual([
      card.audience.all,
      card.audience.filtered,
      card.schedule.now,
      `${card.schedule.later} ${card.schedule.plan}`,
    ]);
  });

  test("everyone and Send now are picked; Filtered audience can be picked, Schedule for later waits on Pro; every choice is at least 56px", () => {
    const [all, filtered, now, later] = choices();

    expect([all, filtered, now, later].map((choice) => /aria-checked="true"/.test(choice.tag))).toEqual([true, false, true, false]);
    expect([all, filtered, now, later].map((choice) => /\bdisabled\b/.test(choice.tag))).toEqual([false, false, false, true]);
    for (const choice of choices()) expect(choice.tag).toContain("min-h-14");
  });

  test("Filtered audience opens to two chips, the second one Pro's: they wait closed, out of reach, until it is picked", () => {
    const page = html();

    expectInOrder(page, [card.audience.filters[0].label, card.audience.filters[1].label, card.audience.filters[1].plan]);
    expect(page).toMatch(/<div data-open="false" inert="" class="grid /);
    expect(/<button[^>]*disabled[^>]*>[^<]*Inactive for a month/.test(page)).toBe(true);
    expect(/<button[^>]*aria-pressed="false"[^>]*\bh-11\b[^>]*>Joined in the last month/.test(page)).toBe(true);
  });

  test("only the two things that need Pro say Pro, and nothing here says Every plan", () => {
    const text = textOf(html());

    expect(text.match(/\bPro\b/g)).toHaveLength(2);
    expect(text).not.toMatch(/Every plan|Sample data/);
  });

  test("Send now is a 52px keycap in the house orange", () => {
    const send = [...html().matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].find((button) => textOf(button[1]).includes(card.send) && button[0].includes("keycap"));

    expect(send?.[0]).toContain("h-[52px]");
    expect(send?.[0]).toContain("bg-[var(--accent)]");
  });

  test("sitting at the start: the phone shows only its clock, and the delivery line is at 0 of 716", () => {
    const page = html();

    expect(textOf(page)).toContain("9:41");
    expect(times(page, card.message.body)).toBe(1);
    expectInOrder(page, [card.delivered, "0", "of 716"]);
    expect(textOf(page)).not.toContain(card.sendAgain);
  });

  test("for a reader who asks for less motion the broadcast has already gone: the banner is on the phone, 680 of 716 delivered, and the button offers Send again", () => {
    const page = html(true);

    expect(times(page, card.message.body)).toBe(2);
    expectInOrder(page, [card.delivered, "680", "of 716"]);
    expect(textOf(page)).toContain(card.sendAgain);
  });

  test("the delivery line says its final count to a screen reader once, and only once the broadcast has gone", () => {
    expect(html()).toMatch(/role="status"[^>]*><\/span>/);
    expect(html(true)).toMatch(new RegExp(`role="status"[^>]*>${card.delivered} 680 of 716</span>`));
  });

  test("the phone is cut at 440px on a phone, and sits beside the card from lg: the card takes seven columns, the phone five", () => {
    const page = html();

    expect(page).toContain("max-h-[464px]");
    expect(page).toContain("lg:col-span-7");
    expect(page).toContain("lg:col-span-5");
    expectInOrder(page, [card.title, "9:41"]);
  });

  test("the phone shows Aurevo's broadcast, never Stampeo's", () => {
    expect(textOf(html(true))).toContain(SAMPLE_BUSINESS);
    expect(html(true)).not.toMatch(/stampeo/i);
  });

  test("the card is the one stamped stage of the section, and the phone is never framed in ink", () => {
    expect(html().match(/card-stamp/g)).toHaveLength(1);
  });
});

describe("the phone the composer sends to", () => {
  const banners = [lpBanner(COPY.composer.card.message)];
  const BROADCAST = COPY.composer.card.message.body;

  test("on a phone told to show nothing yet, only the clock is on the lock screen", () => {
    const text = textOf(renderEn(<NotificationPhoneDemo animate={false} notifications={banners} shown={false} />));

    expect(text).toContain("9:41");
    expect(text).not.toContain(BROADCAST);
  });

  test("on a phone told to show its banner, it is there from the first paint, with no timer to wait for", () => {
    expect(textOf(renderEn(<NotificationPhoneDemo animate={false} notifications={banners} shown />))).toContain(BROADCAST);
  });

  test("the other lock screens are as they were: animated ones start empty, still ones show their banners", () => {
    expect(textOf(renderEn(<NotificationPhoneDemo notifications={banners} />))).not.toContain(BROADCAST);
    expect(textOf(renderEn(<NotificationPhoneDemo animate={false} notifications={banners} />))).toContain(BROADCAST);
  });

  test("no other page of the site tells a phone when to show its banner", () => {
    const phone = join(ROOT, "components", "features", "notifications-push", "NotificationPhoneDemo.tsx");
    const callers = otherCallers("NotificationPhoneDemo", phone);

    expect(callers.length).toBeGreaterThan(0);
    expect(callers.filter(({ attrs }) => /(?:^|\s)shown(?![\w-])/.test(attrs))).toEqual([]);
  });
});

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

describe("ideas: give them a reason to come in today", () => {
  const html = () => renderEn(<IdeasSection />);
  /** The ideas as the page orders them: the two every plan can send first, the two that need Pro's targeting after. */
  const ORDER = ["Slow afternoon", "Something new", "Gone quiet", "Almost there"];
  const rowOf = (chip: string) => COPY.ideas.rows.find((row) => row.chip === chip);

  test("is a row of four chips, in that order, the first one picked", () => {
    const tabs = [...html().matchAll(/<button[^>]*role="tab"[^>]*>([\s\S]*?)<\/button>/g)];

    expect(tabs.map((tab) => textOf(tab[1]).replace(/\|?Pro\|?$/, "").replaceAll("|", "").trim())).toEqual(ORDER);
    expect(tabs[0][0]).toContain('aria-selected="true"');
    for (const tab of tabs.slice(1)) expect(tab[0]).toContain('aria-selected="false"');
    expect(html().match(/role="tablist"/g)).toHaveLength(1);
  });

  test("every chip is a 44px pill to tap, and on a phone the row scrolls sideways, one chip snapping at a time", () => {
    const tablist = /<div role="tablist"[^>]*>/.exec(html())?.[0] ?? "";

    for (const [tab] of html().matchAll(/<button[^>]*role="tab"[^>]*>/g)) expect(tab).toMatch(/\bh-11\b/);
    expect(tablist).toContain("overflow-x-auto");
    expect(tablist).toContain("snap-x");
    expect(html().match(/snap-start/g)).toHaveLength(4);
  });

  test("only the two ideas that need Pro's targeting say Pro, each on its own chip", () => {
    const tabs = [...html().matchAll(/<button[^>]*role="tab"[^>]*>([\s\S]*?)<\/button>/g)].map((tab) => textOf(tab[1]));

    expect(COPY.ideas.rows.filter((row) => "plan" in row).map((row) => row.chip)).toEqual(["Gone quiet", "Almost there"]);
    expect(tabs.map((tab) => tab.includes("Pro"))).toEqual([false, false, true, true]);
    expect(textOf(html())).not.toContain("Growth and Pro");
  });

  test("under the chips each idea has its message on Aurevo's lock screen, all four in the page and one in view", () => {
    const labels = pictures(html()).filter((name) => /lock screen/i.test(name));

    expect(labels).toHaveLength(4);
    ORDER.forEach((chip, index) => {
      expect(labels[index]).toContain(SAMPLE_BUSINESS);
      expect(labels[index]).toContain(rowOf(chip)?.banner.body ?? "missing");
    });
    expect(textOf(html())).toContain("Quiet afternoon? Your second coffee is half price until 5pm.");
    expect(html().match(/role="tabpanel"/g)).toHaveLength(4);
    expect(html().match(/\binert\b/g)).toHaveLength(3);
  });

  test("and one grey line of who it goes to, the row's own", () => {
    const text = textOf(html());

    for (const chip of ORDER) expect(text).toContain(rowOf(chip)?.body ?? "missing");
    expect(rowOf("Gone quiet")?.body).toBe("Sent only to customers who haven't been in for a month.");
  });

  test("is presented by moment, never by weekday: scheduling is Pro's", () => {
    expect(textOf(html())).not.toMatch(/\b(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day\b|\bweekend\b/i);
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

  test("sits on the stamped surface, and shows no chip and no GDPR line: the plans have their own section", () => {
    expect(html().match(/card-stamp/g)).toHaveLength(1);
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

  test("the first-draft table of three steps and the hover rows of four ideas are gone, the composer and the chips taking their place", async () => {
    const text = textOf(await renderPreviewPage("platform/promotional-campaigns"));

    expect(text).not.toContain("A short message: a deal, something new, a reason to drop by today.");
    expect(text).not.toMatch(/Fill a quiet hour|Bring back a regular/);
    expect(text).toContain(COPY.composer.card.title);
    expect(text).toContain(COPY.ideas.rows[0].chip);
  });
});
