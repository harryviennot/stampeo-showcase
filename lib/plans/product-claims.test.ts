import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "@/i18n/routing";
import { BENCHMARK, sourceLine } from "./benchmark";
import { BLOG_LOCALES } from "../blog/locales";
import { PLAN_FACTS, planMessageArgs } from "./plan-facts";
import { FEATURE_CATEGORIES } from "../pricing-features";
import { catalogFiles, catalogStrings, loadCatalog, strictTranslator } from "../testing/catalogs";

/**
 * Product claims the product does not back, kept out of every blog post and
 * every message catalog, in each locale's own words:
 * - "no card required": we ask for a card to start the free trial;
 * - offline scanning: the scanner needs a connection, and the pricing table
 *   marks offline scanning as coming soon;
 * - scheduled card styles: not in the dashboard yet, so only ever "coming soon";
 * - broadcast open rates: we have no figure we can source.
 */

const ROOT = join(import.meta.dir, "..", "..");
const BLOG = join(ROOT, "content", "blog");

interface Passage {
  where: string;
  text: string;
}

/** Every message string, as `locale/file::path`. */
function messagePassages(locale: string): Passage[] {
  return catalogFiles(locale).flatMap((file) =>
    catalogStrings(loadCatalog(locale, file), `${locale}/${file}::`),
  );
}

/** Every post of a locale with its lines, frontmatter included. */
function postFiles(locale: string): Array<{ file: string; lines: string[] }> {
  if (!(BLOG_LOCALES as readonly string[]).includes(locale)) return [];
  return readdirSync(join(BLOG, locale))
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => ({ file, lines: readFileSync(join(BLOG, locale, file), "utf8").split("\n") }));
}

/** Every line of every post, as `locale/slug.mdx:line`. */
function postPassages(locale: string): Passage[] {
  return postFiles(locale).flatMap(({ file, lines }) =>
    lines.map((text, i) => ({ where: `${locale}/${file}:${i + 1}`, text }))
  );
}

/**
 * Strings that name a feature which is not live yet, where the label alone
 * carries no "soon": the pricing table rows, whose cells come from
 * `lib/pricing-features.ts` (checked below).
 */
const ROADMAP = [
  /\/pricing\.json::pricingPage\.comparison\.rows\.(?:offlineScanning|scheduledChanges)\.label$/,
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

/** A percentage next to the locale's word for an open rate, or a "read N× more than email" multiplier. */
const openRate = (term: string, email: string) =>
  new RegExp(
    `\\d\\s?%[^.]{0,30}(?:${term})|(?:${term})[^.]{0,30}\\d\\s?%|\\d\\s?(?:×|x\\b|times|fois|veces)[^.]{0,30}(?:${email})`,
    "i"
  );

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
    openRate: openRate("open rate", "e-?mails?"),
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
    openRate: openRate("d['’]ouverture", "e-?mails?"),
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
    openRate: openRate("apertura", "correos?|e-?mails?"),
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
    openRate: openRate("otwarć|otwieraln", "e-?mail"),
  },
};

describe("product claims", () => {
  for (const locale of routing.locales) {
    const wording = WORDING[locale];
    const soon = new RegExp(loadCatalog(locale, "pricing.json").pricingPage.comparison.soon, "i");
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
    ["en", "openRate", "get read 5 to 10× more than email"],
    ["fr", "openRate", "sont lus 5 à 10× plus que les emails"],
    ["es", "openRate", "se leen de 5 a 10 veces más que los correos"],
    ["pl", "openRate", "są czytane 5 do 10× częściej niż e-maile"],
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
    const features = loadCatalog(locale, "features.json");
    const page = features.features["campagnes-promotionnelles"];
    const strings = messagePassages(locale).filter(({ where }) =>
      where.includes("features.json::features.campagnes-promotionnelles.")
    );

    it(`${locale}: the hero quotes the Growth quota from the plan facts`, () => {
      expect(page.hero.subtitle).toContain("{growthBroadcasts}");
      const t = strictTranslator(locale, features, "features.campagnes-promotionnelles");
      const subtitle = t("hero.subtitle" as never, planMessageArgs());
      expect(subtitle).toMatch(new RegExp(`\\b${PLAN_FACTS.growth.broadcastsPerMonth}\\b`));
      expect(subtitle).not.toContain("{");
    });

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

describe("blog percentages", () => {
  const FIGURE = /\d+(?:[.,]\d+)?\s?%/g;
  /** "3,5 %" and "3.5%" are the same figure. */
  const figuresIn = (text: string) => [...text.matchAll(FIGURE)].map((m) => m[0].replace(/\s/g, "").replace(",", "."));

  const LINK = /\]\(/;
  /** A parenthesis opening on a capital, or on "study"/"étude"/"source" and a capital: "(CodeBroker)", "(Stampeo data, …)". */
  const NAMED_SOURCE = /\((?:(?:étude|study|estudio|source|fuente)\s)?[A-ZÀ-Ý][^)]*\)/;
  /** The studies and publishers the posts name in prose ("According to CodeBroker, 43% …"). */
  const PUBLISHER =
    /\b(?:CodeBroker|Bain|Appfigures|Pushwoosh|StatCounter|Mastercard|Nunes|Dr[eè]ze|Fishbach|Antavo|Bond (?:Brand )?Loyalty|ARCEP|We Are Testers|UK Finance|Treatwell)\b/;
  /** A reward or discount offered as an example ("20% off your next cut"), which is an offer and not a statistic. */
  const OFFER_EXAMPLE =
    /\d\s?%\s*(?:off\b|de remise|de descuento)|[-–−]\s?\d+\s?%|discount rate|taux de remise|tasa de descuento/i;

  /**
   * Figures that stay unsourced on their line, per post: the author's own
   * pricing guidance, arithmetic on a sourced figure, a hypothetical shop,
   * a published commission rate. Anything else needs a source.
   */
  const ACCEPTED: Record<string, { figures: string[]; why: string }> = {
    "en/points-based-loyalty-program.mdx": {
      figures: ["2%", "3%", "7%"],
      why: "the author's guideline for pricing a points reward",
    },
    "fr/programme-fidelite-a-points.mdx": {
      figures: ["1.5%", "2%", "5%", "9%", "10%", "35%"],
      why: "the author's pricing guideline and worked examples",
    },
    "en/best-loyalty-card-system-small-business.mdx": {
      figures: ["97%"],
      why: "the complement of the 3% app-retention figure sourced to Pushwoosh in the same section",
    },
    "fr/digitaliser-carte-fidelite-papier.mdx": {
      figures: ["9%"],
      why: "the complement of the 91% smartphone ownership figure sourced to ARCEP in the same post",
    },
    "fr/carte-fidelite-sans-application.mdx": {
      figures: ["30%"],
      why: "the App Store's published commission range",
    },
    "fr/points-ou-tampons.mdx": { figures: ["80%"], why: "a hypothetical shop whose sales fall in a narrow range" },
    "fr/carte-fidelite-cafe.mdx": { figures: ["70%"], why: "a hypothetical café whose orders are mostly espresso" },
    "fr/google-wallet-carte-fidelite.mdx": { figures: ["100%"], why: "\"not 100%\" is a manner of speaking" },
    "es/google-wallet-tarjeta-fidelidad.mdx": {
      figures: ["22%", "22.22%", "24.93%", "3.28%", "5.40%", "100%"],
      why: "the brand share table, introduced by its StatCounter source one line above",
    },
  };

  /** The lines of one post whose percentages carry no source, with the figures that lack one. */
  function unsourcedPercentages(locale: string, lines: string[], accepted: readonly string[] = []) {
    const carriesSource = (text: string) =>
      LINK.test(text) || NAMED_SOURCE.test(text) || PUBLISHER.test(text) || text.includes(sourceLine(locale));
    // A figure repeated from a sourced line of the same post is as sourced as its first mention.
    const sourced = new Set(lines.filter(carriesSource).flatMap(figuresIn));
    return lines.flatMap((text, i) => {
      if (carriesSource(text) || OFFER_EXAMPLE.test(text)) return [];
      const open = figuresIn(text).filter((figure) => !sourced.has(figure) && !accepted.includes(figure));
      return open.length > 0 ? [{ line: i + 1, figures: open, text: text.trim().slice(0, 100) }] : [];
    });
  }

  for (const locale of BLOG_LOCALES) {
    it(`${locale}: every percentage in a post is sourced`, () => {
      const offenders = postFiles(locale).flatMap(({ file, lines }) =>
        unsourcedPercentages(locale, lines, ACCEPTED[`${locale}/${file}`]?.figures).map(
          ({ line, figures, text }) => `${locale}/${file}:${line} ${figures.join(", ")} in "${text}"`
        )
      );
      expect(offenders).toEqual([]);
    });
  }

  it("every accepted figure is still one that would otherwise be flagged", () => {
    const stale = Object.entries(ACCEPTED).flatMap(([post, { figures }]) => {
      const [locale, file] = post.split("/");
      const lines = postFiles(locale).find((p) => p.file === file)?.lines ?? [];
      const flagged = new Set(unsourcedPercentages(locale, lines).flatMap((offender) => offender.figures));
      return figures.filter((figure) => !flagged.has(figure)).map((figure) => `${post}: ${figure}`);
    });
    expect(stale).toEqual([]);
  });

  describe.each([
    ["en", "According to CodeBroker, 43% of consumers say the card is the problem.", true],
    ["en", "Retention up 5% can lift profit 25-95% ([Bain](https://example.org/study)).", true],
    ["en", "57% of adults used a wallet (UK Finance 2025).", true],
    ["en", "A \"20% off your next cut\" reward works for a salon.", true],
    ["fr", "66 % des smartphones sont Android (StatCounter, janvier 2026).", true],
    ["fr", "Pour un café où 70 % des commandes sont un expresso.", false],
    ["en", "Nine in ten shops see a 40% lift in repeat visits.", false],
    ["es", "El 85 % de los clientes vuelve en un mes.", false],
  ] as const)("a %s line", (locale, text, passes) => {
    it(`${passes ? "passes" : "is flagged"}: ${text}`, () => {
      expect(unsourcedPercentages(locale, [text]).length === 0).toBe(passes);
    });
  });

  it("a figure repeated from a sourced line of the same post is sourced", () => {
    const lines = ["According to Pushwoosh, only 3% still use the app.", "Remember: 3% is all that is left."];

    expect(unsourcedPercentages("en", lines)).toEqual([]);
    expect(unsourcedPercentages("en", lines.slice(1))).toHaveLength(1);
  });

  it("the Stampeo data line counts as a source, in the reader's language", () => {
    for (const locale of ["en", "fr", "es"]) {
      expect(unsourcedPercentages(locale, [`88% add the card (${sourceLine(locale)})`])).toEqual([]);
    }
  });
});
