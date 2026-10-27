import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import {
  PLAN_FACTS,
  PLAN_NAMES,
  TIERS,
  availability,
  planFactLines,
  planMessageArgs,
  planSummary,
  tiersWhere,
} from "./plan-facts";
import { FEATURE_CATEGORIES } from "../pricing-features";
import { catalogStrings, loadCatalog, strictTranslator } from "../testing/catalogs";

/**
 * Plan facts are stated once, in `lib/plans/plan-facts.ts`, mirroring
 * backend/app/core/features.py. Copy that cannot read from it (translated
 * meta descriptions and pricing feature lists) is checked against it here.
 */

describe("plan facts", () => {
  it("summarises each plan in plain English", () => {
    expect(planSummary("starter")).toBe(
      "stamps or points, 2 team members (owner + 1), no broadcasts, single location, 30 days of analytics history, a visits chart and analytics highlights"
    );
    expect(planSummary("growth")).toContain("8 broadcasts per month");
    expect(planSummary("growth")).not.toMatch(/advanced|schedul|multiple locations|geofencing/);
    expect(planSummary("pro")).toContain("geofencing notifications (coming soon)");
    expect(planSummary("pro")).toContain("scheduled card designs (coming soon)");
  });

  it("names the plans a feature is on", () => {
    expect(availability((f) => f.loyaltyTypes.includes("points"))).toBe("every plan");
    expect(availability((f) => f.employeeTracking)).toBe("Growth and Pro");
    expect(availability((f) => f.scheduledBroadcasts)).toBe("Pro");
    expect(availability((f) => f.analyticsCharts)).toBe("Growth and Pro");
  });
});

describe("feature meta descriptions", () => {
  // A literal quota next to a per-month marker, in any of the four locales.
  const LITERAL_MONTHLY_QUOTA =
    /\b\d+\b[^.;{}]{0,20}?(?:\/\s*month|\/\s*mois|per month|a month|par mois|al mes|w miesiącu)/i;

  for (const locale of routing.locales) {
    const features = loadCatalog(locale, "metadata.json").metadata.features as Record<
      string,
      { title: string; description: string }
    >;

    it(`${locale}: the broadcast quota is the plan-facts argument, not a literal`, () => {
      expect(features["campagnes-promotionnelles"].description).toContain("{growthBroadcasts}");
      for (const [slug, { description }] of Object.entries(features)) {
        expect({ slug, quota: description.match(LITERAL_MONTHLY_QUOTA)?.[0] }).toEqual({
          slug,
          quota: undefined,
        });
      }
    });

    it(`${locale}: every feature description formats with the plan-facts arguments`, () => {
      const t = strictTranslator(locale, loadCatalog(locale, "metadata.json"), "metadata.features");
      for (const slug of Object.keys(features)) {
        const text = t(`${slug}.description` as never, planMessageArgs());
        expect(text).not.toContain("{");
      }
      expect(t("campagnes-promotionnelles.description" as never, planMessageArgs())).toContain(
        String(PLAN_FACTS.growth.broadcastsPerMonth)
      );
    });
  }
});

describe("feature meta descriptions state the plan facts", () => {
  // The words each locale uses in these descriptions for scheduling and for
  // several locations. A description that carries none of them says nothing.
  const SCHEDULING: Record<string, RegExp> = {
    en: /schedul/i,
    fr: /programmable|programm[ée]e?s?\b|planifi/i,
    es: /programad|programable/i,
    pl: /planowani|zaplan/i,
  };
  const MULTI_LOCATION: Record<string, RegExp> = {
    en: /multi-?location|multiple locations|several locations|more than one location/i,
    fr: /multi-?(?:site|boutique|établissement)|plusieurs (?:sites|boutiques|établissements|adresses)/i,
    es: /multi-?(?:local|ubicación)|varios (?:locales|comercios|establecimientos|puntos)/i,
    pl: /wielu lokalizacj|wiele lokalizacji|wielolokaliz|wiele lokali|wielu lokali/i,
  };

  // The words each locale uses to say a feature is on every plan.
  const EVERY_PLAN: Record<string, RegExp> = {
    en: /\b(?:every|all) plans?\b/i,
    fr: /\btous les plans\b|\bchaque plan\b/i,
    es: /\btodos los planes\b|\bcada plan\b/i,
    pl: /\bwe wszystkich planach\b|\bw ka[zż]dym planie\b|\bwszystkie plany\b/i,
  };

  /**
   * The clauses of `text` that match `claim` and do not sit with the plans that
   * have the feature: the clause must name one of them and none of the others.
   */
  function misplacedClaims(text: string, claim: RegExp, plans: readonly (typeof TIERS)[number][]) {
    const wanted = plans.map((tier) => PLAN_NAMES[tier]);
    const unwanted = TIERS.filter((tier) => !plans.includes(tier)).map((tier) => PLAN_NAMES[tier]);
    return text
      .split(/[.;,]\s+/)
      .filter((clause) => claim.test(clause))
      .filter(
        (clause) =>
          !wanted.some((name) => clause.includes(name)) || unwanted.some((name) => clause.includes(name))
      );
  }

  it.each([
    ["Unlimited and scheduled on Pro", SCHEDULING.en, false],
    ["Scheduled broadcasts on Growth and Pro", SCHEDULING.en, true],
    ["Schedule your promotions in advance", SCHEDULING.en, true],
    ["Illimitées et programmables sur Pro", SCHEDULING.fr, false],
    ["Programmables dès Growth", SCHEDULING.fr, true],
    ["Multiple locations on Growth", MULTI_LOCATION.en, true],
    ["Multiple locations on Pro", MULTI_LOCATION.en, false],
  ])("a clause reading %p is misplaced: %p", (text, claim, misplaced) => {
    expect(misplacedClaims(text, claim, ["pro"]).length > 0).toBe(misplaced);
  });

  for (const locale of routing.locales) {
    const features = loadCatalog(locale, "metadata.json").metadata.features as Record<
      string,
      { title: string; description: string }
    >;
    const soon = new RegExp(loadCatalog(locale, "pricing.json").pricingPage.comparison.soon, "i");

    it(`${locale}: geofencing is described as coming soon while the plan facts say so`, () => {
      expect(PLAN_FACTS.pro.geofencing).toBe("coming_soon");
      expect(soon.test(features.geolocalisation.description)).toBe(true);
    });

    it(`${locale}: Analytics is never sold as on every plan, since its charts are on Growth and Pro`, () => {
      expect(features.analytiques.description).not.toMatch(EVERY_PLAN[locale]);
      for (const plan of tiersWhere((facts) => facts.analyticsCharts)) {
        expect(features.analytiques.description).toContain(PLAN_NAMES[plan]);
      }
    });

    it(`${locale}: scheduling is sold with the plans that have it, never with the others`, () => {
      const plans = tiersWhere((facts) => facts.scheduledBroadcasts);
      for (const [slug, { description }] of Object.entries(features)) {
        expect({ slug, misplaced: misplacedClaims(description, SCHEDULING[locale], plans) }).toEqual({
          slug,
          misplaced: [],
        });
      }
    });

    it(`${locale}: several locations are never claimed below the plans that have them`, () => {
      const plans = tiersWhere((facts) => facts.multipleLocations);
      for (const [slug, { description }] of Object.entries(features)) {
        expect({ slug, misplaced: misplacedClaims(description, MULTI_LOCATION[locale], plans) }).toEqual({
          slug,
          misplaced: [],
        });
      }
    });
  }
});

describe("pricing page feature lists", () => {
  // Locked vocabulary per locale (see the stampeo-copywriting skill).
  const VOCAB: Record<
    string,
    { broadcast: RegExp; points: RegExp; nearby: RegExp; cardStyle: RegExp; schedule: RegExp }
  > = {
    en: {
      broadcast: /broadcast/i,
      points: /points/i,
      nearby: /nearby/i,
      cardStyle: /card styles?/i,
      schedule: /schedul/i,
    },
    fr: {
      broadcast: /diffusion/i,
      points: /points/i,
      nearby: /proximité/i,
      cardStyle: /styles? de carte/i,
      schedule: /programm|planifi/i,
    },
    es: {
      broadcast: /difusi/i,
      points: /puntos/i,
      nearby: /cerca/i,
      cardStyle: /estilos? de tarjeta/i,
      schedule: /program/i,
    },
    pl: {
      broadcast: /rozsył/i,
      points: /punkt/i,
      nearby: /pobliżu/i,
      cardStyle: /wz[oó]r\w* karty/i,
      schedule: /zaplan|planow/i,
    },
  };

  // The pricing page cards (`pricingPage`) and the landing pricing section
  // (`pricing`) each carry their own copy of the tier lists.
  for (const locale of routing.locales) {
    const messages = loadCatalog(locale, "pricing.json");
    const page = messages.pricingPage;
    const vocab = VOCAB[locale];

    for (const section of ["pricingPage", "pricing"] as const) {
      const features = (tier: string) => messages[section][tier].features as string[];

      it(`${locale} ${section}: Starter offers points as well as stamps`, () => {
        expect(features("starter").some((item) => vocab.points.test(item))).toBe(true);
      });

      it(`${locale} ${section}: broadcast counts match`, () => {
        expect(features("starter").some((item) => vocab.broadcast.test(item))).toBe(false);
        const growth = features("growth").filter((item) => vocab.broadcast.test(item));
        expect(growth).toHaveLength(1);
        expect(growth[0].match(/\d+/g)).toEqual([String(PLAN_FACTS.growth.broadcastsPerMonth)]);
      });

      it(`${locale} ${section}: geofencing reads as coming soon on Pro`, () => {
        const nearby = features("pro").filter((item) => vocab.nearby.test(item));
        expect(nearby).toHaveLength(1);
        expect(nearby[0]).toMatch(new RegExp(page.comparison.soon, "i"));
      });

      it(`${locale} ${section}: scheduling card styles reads as coming soon on Pro`, () => {
        const claims = (tier: string) =>
          features(tier).filter((item) => vocab.cardStyle.test(item) && vocab.schedule.test(item));
        expect([...claims("starter"), ...claims("growth")]).toEqual([]);
        for (const item of claims("pro")) {
          expect(item).toMatch(new RegExp(page.comparison.soon, "i"));
        }
      });
    }

    it(`${locale}: the comparison table agrees on loyalty types and broadcasts`, () => {
      // Same loyalty types on every plan, so the row cannot differ between plans.
      const row = page.comparison.rows.loyaltyType;
      expect(new Set(TIERS.map((tier) => row[tier])).size).toBe(1);
      expect(page.comparison.rows.broadcastNotifications.growth.match(/\d+/g)).toEqual([
        String(PLAN_FACTS.growth.broadcastsPerMonth),
      ]);
    });
  }

  it("the comparison table marks scheduled card changes as coming soon on Pro", () => {
    const row = FEATURE_CATEGORIES.flatMap((category) => category.rows).find(
      (r) => r.key === "scheduledChanges"
    );
    expect(row).toEqual({ key: "scheduledChanges", starter: "cross", growth: "cross", pro: "soon" });
  });
});

// The words each locale uses for a length of history.
const UNITS: Record<string, { day: RegExp; year: RegExp }> = {
  en: { day: /\bdays?\b/i, year: /\byears?\b/i },
  fr: { day: /\bjours?\b/i, year: /\ban\b/i },
  es: { day: /\bdías?\b/i, year: /\baños?\b/i },
  pl: { day: /\b(?:dni|dzień)\b/i, year: /\b(?:rok|lata|lat)\b/i },
};
// How each locale says the Starter cell of the charts row gives the visits, and how the copy names the visits chart.
const VISITS_ONLY: Record<string, RegExp> = {
  en: /visits/i,
  fr: /visites/i,
  es: /visitas/i,
  pl: /wizyty/i,
};
const VISITS_CHART: Record<string, RegExp> = {
  en: /visits chart|charts your visits/i,
  fr: /graphique des visites|visites en graphique/i,
  es: /gráfico de visitas|visitas en un gráfico/i,
  pl: /wykres wizyt|wizyty na wykresie/i,
};
// The phone list's value cell does not shrink, so the cell text stays short.
const CELL_MAX_CHARS = 18;
const daysIn = (text: string, locale: string) => {
  const amount = Number(text.match(/\d+/)?.[0]);
  if (UNITS[locale].year.test(text)) return amount * 365;
  if (UNITS[locale].day.test(text)) return amount;
  return Number.NaN;
};

describe("pricing page analytics rows", () => {
  const analyticsRows = FEATURE_CATEGORIES.find((category) => category.key === "analytics")!.rows;

  it("the matrix gives Starter 30 days, Growth 90 and Pro a year, with cohorts on Pro only", () => {
    expect(TIERS.map((tier) => PLAN_FACTS[tier].analyticsHistoryDays)).toEqual([30, 90, 365]);
    expect(availability((f) => f.analytics === "advanced")).toBe("Pro");
  });

  it("the Analytics group lists the history, the charts and the monthly cohorts", () => {
    expect(analyticsRows.map((row) => row.key)).toEqual(["analyticsHistory", "analyticsCharts", "monthlyCohorts"]);
  });

  it("the charts row is a tick on Growth and Pro and text on Starter, as the matrix has it", () => {
    const charts = analyticsRows.find((row) => row.key === "analyticsCharts")!;
    expect(TIERS.map((tier) => charts[tier])).toEqual(["text", "check", "check"]);
    expect(TIERS.map((tier) => PLAN_FACTS[tier].analyticsCharts)).toEqual([false, true, true]);
  });

  it("the cohorts row is a tick on Pro only", () => {
    const cohorts = analyticsRows.find((row) => row.key === "monthlyCohorts")!;
    expect(TIERS.map((tier) => cohorts[tier])).toEqual(["cross", "cross", "check"]);
  });

  it("the plan summary quoted in llms.txt and the Offers states each plan's history, and the monthly cohorts on Pro only", () => {
    const history = TIERS.map((tier) => planFactLines(tier).filter((line) => /analytics history/i.test(line)));
    expect(history).toEqual([["30 days of analytics history"], ["90 days of analytics history"], ["1 year of analytics history"]]);
    expect(TIERS.map((tier) => planSummary(tier).includes("monthly cohorts"))).toEqual([false, false, true]);
  });

  it("the plan summary says who gets the charts and that Starter gets the visits chart and the highlights of the rest, never every chart", () => {
    expect(TIERS.map((tier) => planSummary(tier).includes("analytics charts"))).toEqual([false, true, true]);
    expect(TIERS.map((tier) => /every (?:analytics )?chart/i.test(planSummary(tier)))).toEqual([false, false, false]);
    expect(TIERS.map((tier) => planSummary(tier).includes("a visits chart and analytics highlights"))).toEqual([true, false, false]);
    expect(TIERS.map((tier) => /instead of charts/i.test(planSummary(tier)))).toEqual([false, false, false]);
  });

  for (const locale of routing.locales) {
    it(`${locale}: each plan's history reads as the matrix says`, () => {
      const rows = loadCatalog(locale, "pricing.json").pricingPage.comparison.rows;
      for (const tier of TIERS) {
        expect({ tier, days: daysIn(rows.analyticsHistory[tier], locale) }).toEqual({
          tier,
          days: PLAN_FACTS[tier].analyticsHistoryDays,
        });
      }
    });

    it(`${locale}: the charts row tells Starter it gets the visits, in a cell short enough for the phone list`, () => {
      const cell: string = loadCatalog(locale, "pricing.json").pricingPage.comparison.rows.analyticsCharts.starter ?? "";
      expect(cell).toMatch(VISITS_ONLY[locale]);
      expect(cell.length).toBeLessThanOrEqual(CELL_MAX_CHARS);
    });

    it(`${locale}: the three rows are named`, () => {
      const rows = loadCatalog(locale, "pricing.json").pricingPage.comparison.rows;
      expect(rows.analyticsHistory.label).toBeTruthy();
      expect(rows.analyticsCharts.label).toBeTruthy();
      expect(rows.monthlyCohorts.label).toBeTruthy();
    });

    // The plan cards quote the history in a bullet; it must be the table's figure.
    for (const section of ["pricingPage", "pricing"] as const) {
      it(`${locale} ${section}: Starter's bullet names the visits chart`, () => {
        const messages = loadCatalog(locale, "pricing.json");
        expect(messages[section].starter.features.filter((item: string) => VISITS_CHART[locale].test(item))).toHaveLength(1);
      });

      it(`${locale} ${section}: the cards quote each plan's history as the table does`, () => {
        const messages = loadCatalog(locale, "pricing.json");
        for (const tier of TIERS) {
          const quoted = (messages[section][tier].features as string[])
            .map((item) => daysIn(item, locale))
            .filter((days) => !Number.isNaN(days));
          expect({ tier, quoted }).toEqual({ tier, quoted: [PLAN_FACTS[tier].analyticsHistoryDays] });
        }
      });
    }
  }
});

describe("the landing FAQ and the feature copy state the Analytics plan facts", () => {
  // The words each locale uses for the cohorts, and for a plan that looks further back than Starter.
  const COHORTS: Record<string, string> = {
    en: "monthly cohorts",
    fr: "cohortes mensuelles",
    es: "cohortes mensuales",
    pl: "kohorty miesięczne",
  };
  const LONGER_HISTORY: Record<string, RegExp> = {
    en: /look further back|more history/i,
    fr: /remontent plus loin|plus d'historique/i,
    es: /miran más atrás|más historial/i,
    pl: /sięgają dalej wstecz|dłuższa historia/i,
  };
  // The words each locale uses for the charts a Starter does not get.
  const CHARTS: Record<string, RegExp> = {
    en: /\bas charts\b/i,
    fr: /sous forme de graphiques|graphiques et plus d'historique/i,
    es: /en gráficos|gráficos y más historial/i,
    pl: /na wykresach|wykresy i dłuższa historia/i,
  };
  // Growth does not get every chart (the cohorts are on Pro), so no copy says it does.
  const EVERY_CHART: Record<string, RegExp> = {
    en: /every (?:analytics )?chart|all (?:the )?charts/i,
    fr: /tous les graphiques/i,
    es: /todos los gráficos/i,
    pl: /wszystkie wykresy/i,
  };
  // Ways the copy said Starter gets the highlights in place of the charts; the visits chart is now on every plan.
  const HIGHLIGHTS_ONLY: Record<string, RegExp> = {
    en: /highlights instead|Starter shows the highlights|^Analytics highlights/i,
    fr: /Starter en donne l'essentiel|à la place des graphiques|^L'essentiel des statistiques/i,
    es: /Starter ofrece lo esencial|en lugar de gráficos|^Lo esencial de las estadísticas/i,
    pl: /Starter daje najważniejsze|zamiast wykresów|^Najważniejsze statystyki/i,
  };
  // "(30 days, 90 days or 1 year)" in each locale.
  const HISTORY_LIST = /\((\d+ [^,)]+), (\d+ [^,)]+) (?:or|ou|o|lub) (\d+ [^,)]+)\)/;
  const FILES = ["landing.json", "features.json", "metadata.json"];

  const copy = (locale: string) =>
    FILES.flatMap((file) => catalogStrings(loadCatalog(locale, file), `${locale}/${file}::`));
  /** The plans named in the clause of `text` that holds `phrase`. */
  const plansNamedWith = (text: string, phrase: string | RegExp) => {
    const clause = text.split(/[.,;:]/).find((part) => (typeof phrase === "string" ? part.toLowerCase().includes(phrase) : phrase.test(part))) ?? "";
    return TIERS.filter((tier) => new RegExp(`\\b${PLAN_NAMES[tier]}\\b`).test(clause));
  };

  for (const locale of routing.locales) {
    it(`${locale}: the FAQ gives the history lengths of Starter, Growth and Pro as the matrix does`, () => {
      const lists = copy(locale).flatMap(({ text }) => text.match(HISTORY_LIST)?.slice(1) ?? []);
      expect(lists.length).toBeGreaterThan(0);
      for (let i = 0; i < lists.length; i += 3) {
        expect(lists.slice(i, i + 3).map((item) => daysIn(item, locale))).toEqual(TIERS.map((tier) => PLAN_FACTS[tier].analyticsHistoryDays));
      }
    });

    it(`${locale}: every mention of the monthly cohorts names the plans that have them`, () => {
      const mentions = copy(locale).filter(({ text }) => text.toLowerCase().includes(COHORTS[locale]));
      expect(mentions.length).toBeGreaterThan(0);
      for (const { where, text } of mentions) {
        expect({ where, plans: plansNamedWith(text, COHORTS[locale]) }).toEqual({
          where,
          plans: tiersWhere((f) => f.analytics === "advanced"),
        });
      }
    });

    it(`${locale}: no copy says a plan has every chart`, () => {
      const pricing = catalogStrings(loadCatalog(locale, "pricing.json"), `${locale}/pricing.json::`);
      const claims = [...copy(locale), ...pricing].filter(({ text }) => EVERY_CHART[locale].test(text)).map(({ where }) => where);
      expect(claims).toEqual([]);
    });

    it(`${locale}: every plan comparison that names the monthly cohorts says the visits chart is on every plan`, () => {
      const comparisons = copy(locale).filter(({ text }) => text.toLowerCase().includes(COHORTS[locale]));
      expect(comparisons.length).toBeGreaterThan(0);
      for (const { where, text } of comparisons) {
        expect({ where, visitsChart: VISITS_CHART[locale].test(text) }).toEqual({ where, visitsChart: true });
      }
    });

    it(`${locale}: no copy says Starter gets only the highlights`, () => {
      const pricing = catalogStrings(loadCatalog(locale, "pricing.json"), `${locale}/pricing.json::`);
      const claims = [...copy(locale), ...pricing].filter(({ text }) => HIGHLIGHTS_ONLY[locale].test(text)).map(({ where }) => where);
      expect(claims).toEqual([]);
    });

    it(`${locale}: every mention of the charts names the plans that have them`, () => {
      const mentions = copy(locale).filter(({ text }) => CHARTS[locale].test(text));
      expect(mentions.length).toBeGreaterThan(0);
      for (const { where, text } of mentions) {
        expect({ where, plans: plansNamedWith(text, CHARTS[locale]) }).toEqual({
          where,
          plans: tiersWhere((f) => f.analyticsCharts),
        });
      }
    });

    it(`${locale}: every mention of a longer history names the plans that have one`, () => {
      const mentions = copy(locale).filter(({ text }) => LONGER_HISTORY[locale].test(text));
      expect(mentions.length).toBeGreaterThan(0);
      for (const { where, text } of mentions) {
        expect({ where, plans: plansNamedWith(text, LONGER_HISTORY[locale]) }).toEqual({
          where,
          plans: tiersWhere((f) => f.analyticsHistoryDays !== PLAN_FACTS.starter.analyticsHistoryDays),
        });
      }
    });
  }
});
