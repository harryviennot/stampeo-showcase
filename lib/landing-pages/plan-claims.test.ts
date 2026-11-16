/**
 * The `/us/landing-pages/*` pages sell the product, not the plans: a plan's name, a badge saying who has a
 * feature and "on every plan" belong to the pricing section and the pricing page. Each page is rendered as a
 * visitor receives it and read for plan names outside its pricing section, and the copy modules are read for the
 * same words. The number of levels, which the copy states as a fact, is tied to `PLAN_FACTS`.
 */

import { describe, expect, test } from "bun:test";
import { availability } from "../plans/plan-facts";
import { ALL } from "../testing/landing-copy";
import { renderPreviewPage, sectionsOf } from "../testing/preview-page";
import { ALL_LANDING_SLUGS } from "./pages";

/** A plan named in a line of words: its name, or a phrase that says every plan has something. */
const PLAN_SOURCE = String.raw`\b(?:Starter|Growth|Pro)\b|\b(?:[Ee]very|[Ee]ach) plan\b|\b[Aa]ll plans\b`;
const PLAN_WORDS = new RegExp(PLAN_SOURCE);
const PLAN_WORDS_IN = new RegExp(PLAN_SOURCE, "g");

/** What a visitor reads outside the pricing section: the markup of every other section, without its classes, styles and scripts. */
function outsidePricing(html: string): string {
  return sectionsOf(html)
    .filter((section) => section.id !== "pricing")
    .map((section) => section.html)
    .join("")
    .replace(/<(style|script)\b[\s\S]*?<\/\1>/g, "")
    .replace(/\sclass="[^"]*"/g, "");
}

/** The plan words in `markup`, each with a few characters around it so a failure shows where. */
const planWordsIn = (markup: string): string[] =>
  [...markup.matchAll(PLAN_WORDS_IN)].map((match) => markup.slice(Math.max(0, match.index - 24), match.index + match[0].length + 24));

describe("a landing page names no plan outside its pricing section", () => {
  test.each(ALL_LANDING_SLUGS)("%s", async (slug) => {
    expect(planWordsIn(outsidePricing(await renderPreviewPage(slug)))).toEqual([]);
  });

  test("the check reads words, not class names, and leaves the pricing section to its own plans", () => {
    const page =
      '<div data-landing-section="hero"><i class="pro every-plan">A card.</i><p>Growth and Pro</p></div>' +
      '<div data-landing-section="pricing"><p>Starter, Growth and Pro</p></div>' +
      '<div data-landing-section="faq"><p>Your plan sets how many.</p></div>';

    const found = planWordsIn(outsidePricing(page));

    expect(found).toHaveLength(2);
    expect(found.join("")).not.toContain("Starter");
    expect(found.join("")).not.toContain("faq");
  });
});

describe("no landing copy names a plan or says every plan has something", () => {
  test("there is copy to read", () => {
    expect(ALL.length).toBeGreaterThan(150);
  });

  test("no line of any copy module says Starter, Growth, Pro, every plan or all plans", () => {
    expect(ALL.filter((line) => PLAN_WORDS.test(line.value)).map((line) => line.path)).toEqual([]);
  });
});

describe("the number of levels is PLAN_FACTS'", () => {
  const FIGURES = ALL.flatMap((line) =>
    [...line.value.matchAll(/\bup to (\d+) levels\b/gi)].map((match) => ({ path: line.path, count: Number(match[1]) })),
  );

  test("the copy says it twice, in the program types and on the Outcomes levels", () => {
    expect(FIGURES.map(({ path }) => path).sort()).toEqual(["OUTCOMES.levels.facts[0].text", "PROGRAM_TYPES[2].body"]);
  });

  test.each(FIGURES.map((figure) => [figure.path, figure.count] as const))("%s: every plan has exactly %i levels, so the line holds without a label", (_path, count) => {
    expect(availability((facts) => facts.levels === count)).toBe("every plan");
  });
});
