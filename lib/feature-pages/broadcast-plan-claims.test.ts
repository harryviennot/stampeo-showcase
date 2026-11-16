import { describe, expect, it } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { catalogStrings, loadCatalog } from "../testing/catalogs";

/**
 * Broadcasts are on every plan (Starter has a monthly allowance), so no pricing
 * string may pair them with a plan claim that leaves Starter out: "from Growth",
 * "Growth and Pro". A string that names Growth or Pro must name Starter too, or
 * say every plan. The blog posts are held to the same rule for Growth: a sentence
 * about broadcasts may not say they start on Growth.
 */
const BROADCAST: Record<string, RegExp> = {
  en: /broadcast/i,
  fr: /diffusion/i,
  es: /difusi/i,
  pl: /rozsył/i,
};
const EVERY_PLAN: Record<string, RegExp> = {
  en: /\b(?:every|all) plans?\b/i,
  fr: /\btous les plans\b|\bchaque plan\b/i,
  es: /\btodos los planes\b|\bcada plan\b/i,
  pl: /\bwe wszystkich planach\b|\bw ka[zż]dym planie\b|\bka[zż]dy plan\b|\bwszystkie plany\b/i,
};

function excludesStarter(text: string, locale: string): boolean {
  if (!BROADCAST[locale].test(text)) return false;
  const namesHigherPlan = /\bGrowth\b|\bPro\b/.test(text);
  const coversStarter = /\bStarter\b/.test(text) || EVERY_PLAN[locale].test(text);
  return namesHigherPlan && !coversStarter;
}

// What the blog calls a broadcast: the feature is also written up as a campaign.
const BLOG_BROADCAST: Record<string, RegExp> = {
  en: /broadcast|campaign/i,
  fr: /diffusion|campagne/i,
  es: /difusi|campa[ñn]a/i,
  pl: /rozsył|kampani/i,
};

/** Whether a sentence about broadcasts names Growth as where they start, leaving Starter out. */
function startsOnGrowth(sentence: string, locale: string): boolean {
  if (!BLOG_BROADCAST[locale].test(sentence)) return false;
  const coversStarter = /\bStarter\b/.test(sentence) || EVERY_PLAN[locale].test(sentence);
  return /\bGrowth\b/.test(sentence) && !coversStarter;
}

const BLOG = join(import.meta.dir, "..", "..", "content", "blog");

/** Every sentence (or line) of every blog post in a language, with the file it is in. */
function blogSentences(locale: string): { where: string; sentence: string }[] {
  return readdirSync(join(BLOG, locale))
    .filter((file) => file.endsWith(".mdx"))
    .flatMap((file) =>
      readFileSync(join(BLOG, locale, file), "utf8")
        .split(/(?<=[.!?])\s+|\n/)
        .map((sentence) => ({ where: `${locale}/${file}`, sentence })),
    );
}

describe("broadcast plan claims", () => {
  it.each([
    ["en", "Broadcasts start on the Growth plan", true],
    ["en", "Unlimited broadcasts on Growth and Pro", true],
    ["en", "8 broadcasts a month on Starter, unlimited on Growth and Pro", false],
    ["en", "Broadcasts on every plan, unlimited on Growth and Pro", false],
    ["en", "Schedule broadcasts in advance (card styles coming soon)", false],
    ["fr", "Diffusions à partir du plan Growth", true],
    ["fr", "Programmez vos diffusions à l'avance", false],
    ["es", "Las difusiones entran a partir del plan Growth", true],
    ["pl", "Rozsyłki od planu Growth", true],
  ])("a %s string reading %p excludes Starter: %p", (locale, text, excluded) => {
    expect(excludesStarter(text, locale)).toBe(excluded);
  });

  it.each(routing.locales)("%s: no pricing string pairs broadcasts with a plan claim that excludes Starter", (locale) => {
    const excluding = catalogStrings(loadCatalog(locale, "pricing.json"), `${locale}/pricing.json::`)
      .filter(({ text }) => excludesStarter(text, locale))
      .map(({ where, text }) => `${where}: ${text}`);
    expect(excluding).toEqual([]);
  });
});

describe("broadcast plan claims in the blog", () => {
  it.each([
    ["en", "On Stampeo, broadcasts like this start on the Growth plan (up to eight a month), with unlimited and scheduled broadcasts on Pro", true],
    ["en", "On Growth and Pro you can go further and send a broadcast to everyone whose balance covers a reward", true],
    ["en", "Campaigns are available from Growth", true],
    ["en", "On Stampeo, broadcasts like this are on every plan: up to eight a month on Starter, unlimited on Growth and Pro", false],
    ["en", "On Pro you can send a broadcast to everyone whose balance covers a reward", false],
    ["en", "Custom milestones come in from the Growth plan up", false],
    ["fr", "Avec Stampeo, ces diffusions font partie du système (à partir du plan Growth)", true],
    ["fr", "Ces diffusions sont intégrées (dès le plan Growth) : vous écrivez votre message", true],
    ["fr", "Ces diffusions sont intégrées à tous les plans (8 par mois sur Starter, sans limite sur Growth et Pro)", false],
    ["fr", "À partir du plan Growth, vous pouvez inviter autant d'employés que vous voulez", false],
    ["es", "En Stampeo las difusiones promocionales entran a partir del plan Growth", true],
    ["es", "En Stampeo las difusiones promocionales están en todos los planes (8 al mes en Starter, sin límite en Growth y Pro)", false],
  ])("a %s sentence reading %p starts broadcasts on Growth: %p", (locale, sentence, claims) => {
    expect(startsOnGrowth(sentence, locale)).toBe(claims);
  });

  it.each(readdirSync(BLOG))("%s: no post says broadcasts start on Growth", (locale) => {
    const claims = blogSentences(locale)
      .filter(({ sentence }) => startsOnGrowth(sentence, locale))
      .map(({ where, sentence }) => `${where}: ${sentence.trim()}`);
    expect(claims).toEqual([]);
  });
});
