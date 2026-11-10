import { afterEach, describe, expect, it } from "bun:test";
import { MARKETS } from "../markets";
import { routing } from "../../i18n/routing";
import { PLAN_FACTS, PLAN_NAMES, TIERS } from "../plans/plan-facts";
import { FALLBACK_PRICING, formatMoney, type Pricing } from "../pricing";
import { findCurrencyAmounts } from "./body-checks";
import { NBSP } from "./page/format";
import { STAMPEO_FACT_IDS, buildStampeoColumn, getStampeoColumn, isStampeoFactId } from "./stampeo";
import { SHORT_MAX_LENGTH, STANDARD_FACT_IDS, type Market } from "./types";

/** A ladder that differs from the baked one, so a match proves the amounts came from the catalog. */
const CATALOG: Record<Market, Pricing> = {
  us: { currency: "usd", tiers: { starter: { month: 51, year: 480 }, growth: { month: 81, year: 768 }, pro: { month: 121, year: 1152 } } },
  fr: { currency: "eur", tiers: { starter: { month: 23, year: 216 }, growth: { month: 43, year: 408 }, pro: { month: 63, year: 600 } } },
};
const LOCALE: Record<Market, string> = { us: "en", fr: "fr" };
const TRIAL_DAYS: Record<Market, number> = { us: MARKETS.us.trialDays, fr: MARKETS.int.trialDays };
const PRICE_IDS = ["stampeo.price.starter", "stampeo.price.growth", "stampeo.price.pro"] as const;

describe.each(["us", "fr"] as const)("Stampeo's side on the %s market", (market) => {
  const column = buildStampeoColumn(market, CATALOG[market]);
  const money = (amount: number) => formatMoney(amount, CATALOG[market].currency, LOCALE[market]);

  it("answers every standard table row with plain text and no em dash", () => {
    for (const id of STANDARD_FACT_IDS) {
      expect(column.rows[id].trim().length).toBeGreaterThan(0);
      expect(column.rows[id]).not.toContain("—");
    }
    for (const id of STAMPEO_FACT_IDS) expect(column.facts[id].trim().length).toBeGreaterThan(0);
  });

  it("prices each plan monthly from the catalog it was given, in the market's currency", () => {
    expect(column.facts["stampeo.price.starter"]).toContain(money(CATALOG[market].tiers.starter.month));
    expect(column.facts["stampeo.price.growth"]).toContain(money(CATALOG[market].tiers.growth.month));
    expect(column.facts["stampeo.price.pro"]).toContain(money(CATALOG[market].tiers.pro.month));
    expect(column.rows["price.entry"]).toContain(money(CATALOG[market].tiers.starter.month));
    expect(column.currency).toBe(CATALOG[market].currency);
  });

  it("types no currency amount outside its price rows", () => {
    const priceRows = new Set<string>(["price.entry", ...PRICE_IDS]);
    const values = [
      ...Object.entries(column.rows),
      ...Object.entries(column.facts),
    ].filter(([id]) => !priceRows.has(id));
    for (const [id, value] of values) expect({ id, amounts: findCurrencyAmounts(value) }).toEqual({ id, amounts: [] });
  });

  it("takes the trial length from the market", () => {
    expect(column.facts["stampeo.trial"]).toContain(String(TRIAL_DAYS[market]));
    expect(column.rows.trial).toContain(String(TRIAL_DAYS[market]));
  });

  it("states the Growth broadcast allowance and that multiple locations are Pro-only, from the plan facts", () => {
    expect(column.rows["push.broadcasts"]).toContain(String(PLAN_FACTS.growth.broadcastsPerMonth));
    expect(column.rows["locations.multiple"]).toContain("Pro");
    expect(column.rows["locations.multiple"]).not.toMatch(/Starter|Growth/);
  });

  it("states the plan numbers a page quotes in prose, from the plan facts", () => {
    expect(column.facts["stampeo.broadcasts.growth"]).toBe(String(PLAN_FACTS.growth.broadcastsPerMonth));
    expect(column.facts["stampeo.team.starter"]).toBe(String(PLAN_FACTS.starter.teamMembers));
    expect(column.rows["program.types"]).toContain(column.facts["stampeo.levels"]);
  });

  it("names the plans that have milestone messages from the plan facts", () => {
    const names = TIERS.filter((tier) => PLAN_FACTS[tier].milestoneNotifications !== 0).map((tier) => PLAN_NAMES[tier]);
    expect(column.rows["push.automatic"]).toContain(names.join(market === "us" ? " and " : " et "));
  });

  it("lists every language the site is served in, written in the page's language", () => {
    const languageName = new Intl.DisplayNames(LOCALE[market], { type: "language" });
    for (const code of routing.locales) {
      expect(column.rows.languages.toLowerCase()).toContain(languageName.of(code)!.toLowerCase());
    }
  });

  it("says no VAT applies on the French market only", () => {
    const priced = [column.rows["price.entry"], ...PRICE_IDS.map((id) => column.facts[id])];
    for (const value of priced) {
      if (market === "fr") expect(value).toContain("TVA non applicable");
      else expect(value).not.toMatch(/TVA|VAT|tax/i);
    }
  });
});

describe.each(["us", "fr"] as const)("Stampeo's at-a-glance values on the %s market", (market) => {
  const column = buildStampeoColumn(market, CATALOG[market]);
  const money = (amount: number) => formatMoney(amount, CATALOG[market].currency, LOCALE[market]);
  const shorts = Object.entries(column.rowsShort);

  it("reads like the competitor's short values beside it: a monthly price written per month", () => {
    const perMonth = market === "us" ? "/month" : "/mois";
    expect(column.rowsShort["price.entry"]).toBe(`Starter, ${money(CATALOG[market].tiers.starter.month)}${perMonth}`);
    expect(column.rowsShort["push.broadcasts"]).toContain(`${PLAN_FACTS.growth.broadcastsPerMonth}${perMonth}`);
  });

  it("answer every standard table row in one line of at most 40 characters, with no em dash", () => {
    expect(Object.keys(column.rowsShort).sort()).toEqual([...STANDARD_FACT_IDS].sort());
    for (const [id, short] of shorts) {
      expect({ id, text: short.trim() }).not.toEqual({ id, text: "" });
      expect({ id, oneLine: !/[\r\n]/.test(short) }).toEqual({ id, oneLine: true });
      expect({ id, length: Array.from(short).length <= SHORT_MAX_LENGTH }).toEqual({ id, length: true });
      expect(short).not.toContain("—");
    }
  });

  it("type no currency amount: the one price comes from the catalog it was given", () => {
    for (const [id, short] of shorts.filter(([id]) => id !== "price.entry")) {
      expect({ id, amounts: findCurrencyAmounts(short) }).toEqual({ id, amounts: [] });
    }
    expect(column.rowsShort["price.entry"]).toContain(money(CATALOG[market].tiers.starter.month));
  });

  it("take the trial length from the market", () => {
    expect(column.rowsShort.trial).toContain(String(TRIAL_DAYS[market]));
  });

  it("name the plans and numbers the plan facts give, and no other plan", () => {
    expect(column.rowsShort["push.broadcasts"]).toContain(String(PLAN_FACTS.growth.broadcastsPerMonth));
    expect(column.rowsShort["push.broadcasts"]).toContain("Pro");
    expect(column.rowsShort["push.broadcasts"]).not.toContain("Starter");
    expect(column.rowsShort["locations.multiple"]).toContain("Pro");
    expect(column.rowsShort["locations.multiple"]).not.toMatch(/Starter|Growth/);
  });

  it("list every language the site is served in, written in the page's language", () => {
    const languageName = new Intl.DisplayNames(LOCALE[market], { type: "language" });
    for (const code of routing.locales) {
      expect(column.rowsShort.languages.toLowerCase()).toContain(languageName.of(code)!.toLowerCase());
    }
  });

  it("leave the tax line to the price row's own note, shown on the French market only", () => {
    expect(column.rowsShort["price.entry"]).not.toMatch(/TVA|VAT|tax/i);
    expect(column.taxNote).toBe(market === "fr" ? "TVA non applicable" : null);
  });
});

describe("Stampeo's French values", () => {
  it("never put a breaking space before a colon, so the colon cannot wrap onto a line of its own", () => {
    const column = buildStampeoColumn("fr", CATALOG.fr);
    for (const [id, text] of [...Object.entries(column.rows), ...Object.entries(column.rowsShort)]) {
      expect({ id, spacedPunctuation: / [:;?!]/.test(text) }).toEqual({ id, spacedPunctuation: false });
    }
  });
});

/** The wording that leads with what a small shop weighs: nothing to install, no till needed, set up in minutes. */
const LEAD = {
  us: {
    short: {
      "pos.integration": "Runs without a till connection",
      "staff.scanning": "Scanner app or any browser",
      "program.types": "Stamps, points and levels on every plan",
      designer: "In minutes, or designed for you free",
      commitment: "No setup fee, cancel anytime",
      "push.automatic": "On every scan, on the lock screen",
    },
    full: {
      "pos.integration": "Runs without a till connection: staff scan the card in the Scanner app or in a browser",
      "staff.scanning": "The Stampeo Scanner app on iPhone and Android, or any phone or tablet browser at scan.stampeo.app",
      "program.types": "Stamps, points and loyalty levels (up to 5, each with its own card look), on every plan",
      designer:
        "Design it yourself in minutes with a live Apple Wallet and Google Wallet preview, or send us your logo and we design it for you, free",
    },
    commitment: [/no setup fee/i, /monthly or yearly/i, /cancel any ?time/i],
  },
  fr: {
    short: {
      "pos.integration": "Fonctionne sans caisse connectée",
      "staff.scanning": "Appli Scanner ou navigateur",
      "program.types": "Tampons, points et niveaux",
      designer: "En quelques minutes, ou créée pour vous",
      commitment: "Sans frais ni engagement",
      "push.automatic": "À chaque passage, sur l'écran verrouillé",
    },
    full: {
      "pos.integration": `Fonctionne sans caisse connectée${NBSP}: l'équipe scanne la carte dans l'appli Scanner ou dans un navigateur`,
      "staff.scanning": "L'appli Scanner Stampeo sur iPhone et Android, ou n'importe quel navigateur sur scan.stampeo.app",
      "program.types":
        "Tampons, points et niveaux de fidélité (jusqu'à 5, chacun avec sa propre apparence de carte), sur tous les plans",
      designer:
        "Créez-la vous-même en quelques minutes avec un aperçu en direct, ou envoyez-nous votre logo et on la crée pour vous, gratuitement",
    },
    commitment: [/sans frais de mise en service/i, /mensuel ou annuel/i, /résiliable à tout moment/i],
  },
} as const;

describe.each(["us", "fr"] as const)("Stampeo's column on the %s market leads with what a small shop weighs", (market) => {
  const column = buildStampeoColumn(market, CATALOG[market]);
  const lead = LEAD[market];

  it.each(Object.entries(lead.short))("says %s in a few plain words", (id, short) => {
    expect(column.rowsShort[id as keyof typeof column.rowsShort]).toBe(short);
  });

  it.each(Object.entries(lead.full))("says %s in full", (id, full) => {
    expect(column.rows[id as keyof typeof column.rows]).toBe(full);
  });

  it("keeps the commitment row's three facts in full: no setup fee, monthly or yearly, cancel any time", () => {
    for (const fact of lead.commitment) expect(column.rows.commitment).toMatch(fact);
  });

  it("never hedges: no optional extras, no offline gap, no stamping by hand", () => {
    const hedge = /optional|en option|\byet\b|pas encore|offline|hors ligne|by hand|à la main/i;
    for (const [id, text] of [...Object.entries(column.rows), ...Object.entries(column.rowsShort)]) {
      expect({ id, hedged: hedge.test(text) }).toEqual({ id, hedged: false });
    }
    expect(column.rows["pos.integration"]).not.toMatch(/^(?:None|Aucune?)\b/);
  });
});

describe("Stampeo's inline facts", () => {
  it("are the three monthly prices, the trial and the plan numbers pages quote", () => {
    expect([...STAMPEO_FACT_IDS]).toEqual([
      ...PRICE_IDS,
      "stampeo.trial",
      "stampeo.broadcasts.growth",
      "stampeo.team.starter",
      "stampeo.levels",
    ]);
    expect(isStampeoFactId("stampeo.trial")).toBe(true);
    expect(isStampeoFactId("stampeo.price.enterprise")).toBe(false);
    expect(isStampeoFactId("price.entry")).toBe(false);
  });
});

describe("Stampeo's side from the live catalog", () => {
  const realFetch = globalThis.fetch;
  const realBase = process.env.NEXT_PUBLIC_API_URL;
  const requested: string[] = [];

  afterEach(() => {
    globalThis.fetch = realFetch;
    if (realBase === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = realBase;
    requested.length = 0;
  });

  const respondWith = (ladder: Pricing) => {
    process.env.NEXT_PUBLIC_API_URL = "http://backend.test";
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      requested.push(String(input));
      const tiers = Object.fromEntries(
        Object.entries(ladder.tiers).map(([tier, { month, year }]) => [
          tier,
          { month: { amount: month * 100 }, year: { amount: year * 100 } },
        ]),
      );
      return new Response(JSON.stringify({ currency: ladder.currency, tiers }), { status: 200 });
    }) as typeof fetch;
  };

  it.each(["us", "fr"] as const)("asks for the %s market's own currency and shows the catalog's amounts", async (market) => {
    respondWith(CATALOG[market]);

    const column = await getStampeoColumn(market);

    expect(requested[0]).toContain(`currency=${CATALOG[market].currency}`);
    expect(column.facts["stampeo.price.starter"]).toContain(
      formatMoney(CATALOG[market].tiers.starter.month, CATALOG[market].currency, LOCALE[market]),
    );
  });

  it.each(["us", "fr"] as const)("falls back to the baked ladder on %s when the backend is down, as /pricing does", async (market) => {
    process.env.NEXT_PUBLIC_API_URL = "http://backend.test";
    globalThis.fetch = (async () => {
      throw new Error("connection refused");
    }) as typeof fetch;
    const baked = FALLBACK_PRICING[CATALOG[market].currency];

    const column = await getStampeoColumn(market);

    expect(column.facts["stampeo.price.growth"]).toContain(
      formatMoney(baked.tiers.growth.month, baked.currency, LOCALE[market]),
    );
  });
});
