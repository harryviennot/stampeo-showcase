import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { BENCHMARK, sourceLine } from "./benchmark";
import { BLOG_LOCALES } from "./blog/locales";
import { PLAN_FACTS } from "./plan-facts";
import { FEATURE_CATEGORIES } from "./pricing-features";

/**
 * Product claims the product does not back, kept out of every blog post and
 * every message catalog, in each locale's own words:
 * - "no card required": we ask for a card to start the free trial;
 * - offline scanning: the scanner needs a connection, and the pricing table
 *   marks offline scanning as coming soon;
 * - scheduled card styles: not in the dashboard yet, so only ever "coming soon";
 * - broadcast open rates: we have no figure we can source.
 */

const ROOT = join(import.meta.dir, "..");
const MESSAGES = join(ROOT, "messages");
const BLOG = join(ROOT, "content", "blog");

interface Passage {
  where: string;
  text: string;
}

const json = (locale: string, file: string) =>
  JSON.parse(readFileSync(join(MESSAGES, locale, file), "utf8"));

/** Every message string, as `locale/file::path`. */
function messagePassages(locale: string): Passage[] {
  const out: Passage[] = [];
  const walk = (value: unknown, where: string) => {
    if (typeof value === "string") out.push({ where, text: value });
    else if (Array.isArray(value)) value.forEach((item, i) => walk(item, `${where}[${i}]`));
    else if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        walk(child, where.endsWith("::") ? `${where}${key}` : `${where}.${key}`);
      }
    }
  };
  for (const file of readdirSync(join(MESSAGES, locale)).filter((f) => f.endsWith(".json"))) {
    walk(json(locale, file), `${locale}/${file}::`);
  }
  return out;
}

/** Every line of every post, frontmatter included, as `locale/slug.mdx:line`. */
function postPassages(locale: string): Passage[] {
  if (!(BLOG_LOCALES as readonly string[]).includes(locale)) return [];
  return readdirSync(join(BLOG, locale))
    .filter((f) => f.endsWith(".mdx"))
    .flatMap((file) =>
      readFileSync(join(BLOG, locale, file), "utf8")
        .split("\n")
        .map((text, i) => ({ where: `${locale}/${file}:${i + 1}`, text }))
    );
}

/**
 * Strings that name a feature which is not live yet, where the label alone
 * carries no "soon": the pricing table rows, whose cells come from
 * `lib/pricing-features.ts` (checked below), and the founding page's
 * "What we're building next" list.
 */
const ROADMAP = [
  /\/pricing\.json::pricingPage\.comparison\.rows\.(?:offlineScanning|scheduledChanges)\.label$/,
  /\/features\.json::features\.programme-fondateur\.custom\.transparency\.comingSoon\.items\[\d+\]$/,
];

interface Wording {
  noCard: RegExp;
  offlineScan: RegExp;
  scheduledStyle: RegExp;
  openRate: RegExp;
}

/** A scan word and an offline phrase close together, or a named offline mode. */
const offlineScan = (scan: string, offline: string, mode: string) =>
  new RegExp(`(?:${scan})[\\s\\S]{0,60}?(?:${offline})|(?:${offline})[\\s\\S]{0,60}?(?:${scan})|${mode}`, "i");

/** A percentage next to the locale's word for an open rate. */
const openRate = (term: string) => new RegExp(`\\d\\s?%[^.]{0,30}(?:${term})|(?:${term})[^.]{0,30}\\d\\s?%`, "i");

const WORDING: Record<string, Wording> = {
  en: {
    noCard:
      /\bno (?:credit |debit |bank )?card(?: details)? (?:required|needed|to start|upfront)|\bno credit card|\bno card details|without (?:a |any )?(?:credit|debit|bank) card/i,
    offlineScan: offlineScan(
      "scan",
      "offline|without (?:an? )?(?:internet|wi-?fi|connection|signal|network)",
      "offline mode"
    ),
    scheduledStyle:
      /schedul\w*[^.]{0,40}(?:card styles?|designs?)\b|\b(?:card styles?|designs?)\b[^.]{0,40}schedul/i,
    openRate: openRate("open rate"),
  },
  fr: {
    noCard:
      /sans (?:carte bancaire|carte de crédit|CB\b)|(?:aucune|pas de) carte bancaire (?:requise|demandée|nécessaire|à l'inscription)|carte bancaire non (?:requise|demandée)/i,
    offlineScan: offlineScan(
      "scan",
      "hors[- ]ligne|sans (?:connexion|réseau|internet|wi-?fi)",
      "mode hors[- ]ligne"
    ),
    scheduledStyle:
      /(?:programm(?:ez|er|é|ation)|planifi)[^.]{0,40}(?:styles? de carte|design)|(?:styles? de carte|design)[^.]{0,40}(?:programm(?:ez|er|é|ation)|planifi)/i,
    openRate: openRate("d['’]ouverture"),
  },
  es: {
    noCard:
      /sin (?:tarjeta (?:bancaria|de crédito|de débito)|necesidad de tarjeta(?! (?:de papel|física|de cartón))|pedir(?:te)? (?:una |la )?tarjeta)|no (?:se )?(?:necesita|requiere|pide) (?:una |la )?tarjeta/i,
    offlineScan: offlineScan(
      "escane|escáner",
      "sin conexión|no hay(?:a)? conexión|sin (?:internet|cobertura|red|wi-?fi)\\b",
      "modo sin conexión"
    ),
    scheduledStyle:
      /(?:programar|programad[oa]s?|programación|programa tus)[^.]{0,40}estilos? de tarjeta|estilos? de tarjeta[^.]{0,40}(?:programad|con antelación)/i,
    openRate: openRate("apertura"),
  },
  pl: {
    noCard:
      /bez (?:podawania )?karty (?:płatniczej|kredytowej|debetowej)|bez podawania karty|nie (?:wymagamy|potrzeba|trzeba) karty (?:płatniczej|kredytowej)/i,
    offlineScan: offlineScan(
      "skan",
      "bez (?:połączenia|internetu|zasięgu|sieci|wi-?fi)",
      "tryb bez połączenia|tryb offline"
    ),
    scheduledStyle: /(?:zaplan|planow)\w*[^.]{0,40}wz[oó]r\w* karty|wz[oó]r\w* karty[^.]{0,40}(?:zaplan|planow)/i,
    openRate: openRate("otwarć|otwieraln"),
  },
};

describe("product claims", () => {
  for (const locale of routing.locales) {
    const wording = WORDING[locale];
    const soon = new RegExp(json(locale, "pricing.json").pricingPage.comparison.soon, "i");
    const passages = [...messagePassages(locale), ...postPassages(locale)];
    const offenders = (claim: RegExp, unlessSoon = false) =>
      passages
        .filter(({ text }) => claim.test(text))
        .filter(({ where, text }) => !(unlessSoon && (soon.test(text) || ROADMAP.some((r) => r.test(where)))))
        .map(({ where, text }) => `${where}: ${text.match(claim)?.[0]}`);

    it(`${locale}: never says the free trial needs no card`, () => {
      expect(offenders(wording.noCard)).toEqual([]);
    });

    it(`${locale}: never says the scanner works offline`, () => {
      expect(offenders(wording.offlineScan, true)).toEqual([]);
    });

    it(`${locale}: sells scheduled card styles only as coming soon`, () => {
      expect(PLAN_FACTS.pro.scheduledDesigns).not.toBe(true);
      expect(offenders(wording.scheduledStyle, true)).toEqual([]);
    });

    it(`${locale}: quotes no broadcast open rate`, () => {
      expect(offenders(wording.openRate)).toEqual([]);
    });
  }

  it("the pricing table marks offline scanning as coming soon on every plan", () => {
    const row = FEATURE_CATEGORIES.flatMap((category) => category.rows).find(
      (r) => r.key === "offlineScanning"
    );
    expect(row).toEqual({ key: "offlineScanning", starter: "soon", growth: "soon", pro: "soon" });
  });
});

describe("product claim wording", () => {
  it.each([
    ["en", "noCard", "1 month free trial, no credit card required."],
    ["en", "noCard", "a free month with no card required"],
    ["en", "noCard", "No card details to start."],
    ["fr", "noCard", "Le mois d'essai est gratuit, sans carte bancaire."],
    ["es", "noCard", "un mes gratis sin necesidad de tarjeta"],
    ["es", "noCard", "sin pedirte tarjeta bancaria para empezar"],
    ["en", "offlineScan", "One thing worth knowing: the scanner works offline."],
    ["en", "offlineScan", "One scan, one stamp. Even without internet."],
    ["fr", "offlineScan", "Le scanner fonctionne sans connexion internet"],
    ["es", "offlineScan", "Escaneo sin conexión incluido en todos los planes"],
    ["pl", "offlineScan", "Jeden skan, jedna pieczątka. Nawet bez internetu."],
    ["en", "scheduledStyle", "Schedule broadcasts and card styles in advance"],
    ["fr", "scheduledStyle", "Programmez vos diffusions et vos styles de carte à l'avance"],
    ["es", "scheduledStyle", "Programa tus difusiones y tus estilos de tarjeta con antelación"],
    ["pl", "scheduledStyle", "Zaplanuj rozsyłki i wzory karty z wyprzedzeniem"],
    ["en", "openRate", "Reach every customer, 85% open rate."],
    ["fr", "openRate", "~85 % de taux d'ouverture"],
  ] as const)("%s %s flags %p", (locale, claim, text) => {
    expect(WORDING[locale][claim].test(text)).toBe(true);
  });

  it.each([
    ["en", "noCard", "No app to download, no card to lose."],
    ["en", "noCard", "We ask for a card to start the trial, and nothing is charged before it ends."],
    ["fr", "noCard", "La carte se range dans Apple Wallet, à côté de sa carte bancaire."],
    ["es", "noCard", "Te pedimos una tarjeta para empezar la prueba, pero no se cobra nada."],
    ["fr", "offlineScan", "La carte reste accessible hors ligne. Le QR code s'affiche même sans réseau."],
    ["es", "offlineScan", "La tarjeta se ve sin cobertura y el código se muestra igual."],
    ["en", "scheduledStyle", "Unlimited saved card styles"],
    ["es", "scheduledStyle", "Tu programa de fidelidad, con tu estilo de tarjeta."],
    ["pl", "openRate", "wiadomość wyjdzie dokładnie wtedy, kiedy pasuje do godzin otwarcia"],
  ] as const)("%s %s leaves %p alone", (locale, claim, text) => {
    expect(WORDING[locale][claim].test(text)).toBe(false);
  });
});

describe("broadcasts feature page", () => {
  const allowed = new Set<number>(Object.values(BENCHMARK).map((figure) => figure.value));

  for (const locale of routing.locales) {
    const page = json(locale, "features.json").features["campagnes-promotionnelles"];
    const strings = messagePassages(locale).filter(({ where }) =>
      where.includes("features.json::features.campagnes-promotionnelles.")
    );

    it(`${locale}: every stat is a sourced Stampeo figure or a plain fact`, () => {
      const stats = page.statBand.stats as { value: string; label: string; caption: string }[];
      for (const stat of stats) {
        const percent = stat.value.match(/(\d+)\s?%/);
        if (!percent) continue;
        expect({ value: stat.value, sourced: allowed.has(Number(percent[1])) }).toEqual({
          value: stat.value,
          sourced: true,
        });
        expect(stat.caption).toContain(sourceLine(locale));
      }
    });

    it(`${locale}: names no third-party source and no SMS price`, () => {
      const cited = strings.filter(({ text }) => /^(?:sources?|fuentes|źródła)\s?:/i.test(text));
      const smsPrice = strings.filter(({ text }) => /\b0[.,]0\d/.test(text));
      expect([...cited, ...smsPrice]).toEqual([]);
    });
  }
});
