/**
 * The claim guards of `copy.test.ts` and `plan-claims.test.ts` read the English modules; this runs the ones that do
 * not depend on English words over the copy a visitor of each language and market reads: the international copy of
 * fr, en, es and pl, and the US English with its overlay laid over it. A line is found by its path, so a failure names
 * the language and the line.
 *
 * What stays English-only: the guards that look for an English word (a reminder, offline, minutes, a trial written as
 * "free month") and the plan phrases of `plan-claims.test.ts` in English; the languages get their own below.
 */

import { describe, expect, test } from "bun:test";
import { availability } from "../plans/plan-facts";
import { CARD_NEEDED_CLAIM, NO_CARD_CLAIM, WORDED_TRIAL } from "../testing/copy-claims";
import { COPIES, copyLines, objectsWith } from "../testing/landing-copy";
import { landingCopy } from "./copy/bundle";

const ENGLISH = new Map(copyLines("en", "int").map((line) => [line.path, line.value]));
/** A path without its module group: `.previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW.faq.items[1]` is `LOYALTY_PROGRAMS_PREVIEW.faq.items[1]`. */
const bare = (path: string) => path.replace(/^\.(?:previews\.[a-zA-Z]+|platform|shared|programTypes)\./, "");

describe.each(COPIES)("the copy of %s (%s)", (locale, market) => {
  const all = copyLines(locale, market);
  const copy = landingCopy(locale, market);
  const offenders = (pattern: RegExp, except: readonly string[] = []) =>
    all.filter((line) => pattern.test(line.value) && !except.includes(bare(line.path))).map((line) => bare(line.path));

  test("there is a line for every line of the English copy, and none more", () => {
    expect(all.map((line) => line.path).sort()).toEqual([...ENGLISH.keys()].sort());
  });

  test("no line says an em dash", () => {
    expect(offenders(/—/)).toEqual([]);
  });

  test("no line writes a price: amounts are tokens or sample money in components", () => {
    expect(offenders(/[$€£]|\b(?:USD|EUR|GBP|PLN)\b|(?<!\p{L})zł(?!\p{L})/iu)).toEqual([]);
  });

  test("no line says a card is needed to start the trial", () => {
    expect(offenders(CARD_NEEDED_CLAIM)).toEqual([]);
  });

  test("no line writes the trial length in words, in any language: it is the {trialDays} token", () => {
    expect(offenders(WORDED_TRIAL)).toEqual([]);
  });

  test("the reassurance under every trial button says the trial length and that no card is required", () => {
    const { reassurance } = copy.shared.SHARED;

    expect(reassurance).toContain("{trialDays}");
    expect(reassurance).toMatch(NO_CARD_CLAIM);
  });

  test("no line names a plan: Starter, Growth and Pro belong to the pricing block", () => {
    expect(offenders(/\b(?:Starter|Growth|Pro)\b/)).toEqual([]);
  });

  test("a percentage or a multiplier is printed only as a sourced figure, or on the grocer's sample card", () => {
    const figure = /\d+(?:[.,]\d+)?\s*%|\b\d+\s*[x×X](?![\p{L}\p{N}])/u;
    const sourced = objectsWith(copy, ["source"], "").flatMap(({ path }) => [`${path}.value`, `${path}.text`]).map(bare);
    const allowed = [...sourced, "CARD_DESIGN_PREVIEW.cardFields.wallets.reward"];

    expect(offenders(figure, allowed)).toEqual([]);
    expect(all.filter((line) => figure.test(line.value) && allowed.includes(bare(line.path))).length).toBeGreaterThanOrEqual(4);
  });

  test("a sourced figure says the same number as in English, and names its source", () => {
    const figures = objectsWith(copy, ["source"], "");
    const english = objectsWith(landingCopy("en"), ["source"], "");
    const digits = (text: unknown) => String(text).match(/\d+/g)?.join(" ");

    expect(figures.map(({ path }) => path)).toEqual(english.map(({ path }) => path));
    for (const [index, { path, object }] of figures.entries()) {
      expect({ path, value: digits(object.value) }).toEqual({ path, value: digits(english[index].object.value) });
      expect({ path, source: String(object.source).trim() !== "" }).toEqual({ path, source: true });
    }
  });

  test("the retention figure's source counts the cards, the businesses and the year the English one does", () => {
    const [figure] = objectsWith(copy, ["source"], "");
    const [english] = objectsWith(landingCopy("en"), ["source"], "");
    const numbers = (text: unknown) => (String(text).replace(/(?<=\d)[\s  ,](?=\d{3}\b)/g, "").match(/\d+/g) ?? []).sort();

    expect(numbers(figure.object.source)).toEqual(numbers(english.object.source));
  });

  test("no notification is sent by Stampeo: the card carries the business's name", () => {
    const banners = objectsWith(copy, ["sender"], "");

    expect(banners).toHaveLength(16);
    expect(banners.filter(({ object }) => /stampeo/i.test(String(object.sender))).map(({ path }) => path)).toEqual([]);
  });

  test('"up to N" says the English numbers: the levels a plan gives, the perks a level takes', () => {
    const claims = [...ENGLISH].flatMap(([path, text]) => [...text.matchAll(/\bup to (\d+)(?: (levels|perks))?/gi)].map((match) => ({ path, count: match[1], what: match[2] })));
    const here = new Map(all.map((line) => [line.path, line.value]));

    expect(claims.length).toBeGreaterThanOrEqual(5);
    expect(claims.filter(({ path, count }) => !new RegExp(`(?<![\\d])${count}(?![\\d])`).test(here.get(path) ?? "")).map(({ path, count }) => `${bare(path)}: ${count}`)).toEqual([]);
    for (const { count } of claims.filter(({ what }) => what === "levels")) {
      expect(availability((facts) => facts.levels === Number(count))).toBe("every plan");
    }
    expect(claims.filter(({ what }) => what === "perks").map(({ count }) => count)).toEqual(["3", "3"]);
  });

  test("the tiers word a searcher types is in the loyalty page's head and the one question that defines it, and nowhere else", () => {
    const TIERS = { en: /\btiers?\b|\btiered\b/i, fr: /\bpaliers?\b/i, es: /\bescalonad[oa]s?\b|\bpor niveles\b/i, pl: /wielopoziom/i } as const;
    const allowed = [
      "LOYALTY_PROGRAMS_PREVIEW.meta.title",
      "LOYALTY_PROGRAMS_PREVIEW.meta.description",
      "LOYALTY_PROGRAMS_PREVIEW.faq.items[1].question",
      "LOYALTY_PROGRAMS_PREVIEW.faq.items[1].answer",
    ];

    expect(offenders(TIERS[locale], allowed)).toEqual([]);
    expect(all.some((line) => TIERS[locale].test(line.value) && allowed.includes(bare(line.path)))).toBe(true);
  });

  test("every {token} of a line is one of the English line's, so a price or a trial length is never typed", () => {
    const tokens = (text: string) => (text.match(/\{[^}]+\}/g) ?? []).sort();
    // The push editor's chips are the variables as the dashboard's editor names them in each language.
    const chips = "PUSH_NOTIFICATIONS_PREVIEW.editor.own.text";

    expect(all.filter((line) => !bare(line.path).startsWith(chips)).filter((line) => tokens(line.value).join() !== tokens(ENGLISH.get(line.path) ?? "").join()).map((line) => bare(line.path))).toEqual([]);
  });

  test("the push editor's chips are the sample values it names, and filling them in is the preview it shows", () => {
    const { own, sampleValues } = copy.previews.pushNotifications.PUSH_NOTIFICATIONS_PREVIEW.editor;
    const chips = (own.text.match(/\{[^}]+\}/g) ?? []).map((chip) => chip.slice(1, -1));
    const filled = sampleValues.reduce((text, { name, value }) => text.replaceAll(`{${name}}`, value), own.text);

    expect(chips.sort()).toEqual(sampleValues.map(({ name }) => name).sort());
    expect(filled).toBe(own.preview);
    expect(filled).not.toContain("{");
  });
});

describe.each(["fr", "es", "pl"] as const)("the copy of %s: what the English-word guards stand for", (locale) => {
  const all = copyLines(locale, "int");
  const found = (pattern: RegExp) => all.filter((line) => pattern.test(line.value)).map((line) => bare(line.path));
  const DAYS = { fr: /\d+[\s \-‑]*jours?\b/i, es: /\d+[\s \-‑]*d[ií]as?\b/i, pl: /\d+[\s \-‑]*(?:dni|dzień|dnia)\b/i } as const;
  const PLANS = {
    fr: /\b(?:chaque|tous les|toutes les) (?:forfaits?|plans?|offres?|abonnements?)\b/i,
    es: /\b(?:cada|todos los) (?:planes|plan)\b/i,
    pl: /\b(?:każd\w+|wszystkie|wszystkich) (?:plan\w*|pakiet\w*|abonament\w*)\b/i,
  } as const;

  /** The counts of days English has that are not the trial: a sample screen's own line, the dashboard's "not back for 30+ days". */
  const SAMPLE_DAYS = ["PLATFORM.analyticsCard.returnRate", "MOBILE_SCANNER_PREVIEW.screens.rewards.expiresLater"];
  const ENGLISH_DAYS = [...ENGLISH].filter(([, text]) => /\d+\+?[\s\-‑]*days?\b/i.test(text)).map(([path]) => bare(path));
  /** What only Polish spells in days: the window the return rate is measured over, and the sample customers' last visits. */
  const POLISH_SAMPLE_DAYS = [
    "ANALYTICS_PREVIEW.numbers.returnRate.label",
    "ANALYTICS_PREVIEW.charts.rows[1].title",
    "ANALYTICS_PREVIEW.chartWords.returnRate.alt",
    "ANALYTICS_PREVIEW.customers.people[2].lastVisit",
    "ANALYTICS_PREVIEW.customers.people[3].lastVisit",
  ];

  test("no line says a count of days that English does not: the trial is the {trialDays} token", () => {
    const exempt = [...SAMPLE_DAYS, ...ENGLISH_DAYS, ...(locale === "pl" ? POLISH_SAMPLE_DAYS : [])];

    expect(found(DAYS[locale]).filter((path) => !exempt.includes(path))).toEqual([]);
  });

  test("no line says every plan has something, in the language's words", () => {
    expect(found(PLANS[locale])).toEqual([]);
  });
});
