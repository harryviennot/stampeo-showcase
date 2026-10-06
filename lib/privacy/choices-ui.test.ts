/**
 * What a visitor sees when they open their privacy choices: the footer label,
 * and the shape of the preferences dialog in each region.
 *
 * Every decision here is a pure function of the policy row, so the cases start
 * from the visitor (a New Yorker, a Parisian, a US visitor with Global Privacy
 * Control on) rather than from a component. The copy checks at the bottom pin
 * the two promises the strings make: the same words for the same control, and
 * no duration typed into a sentence that the policy row already decides.
 */

import { afterEach, describe, expect, test } from "bun:test";

import en from "../../messages/en/common.json";
import es from "../../messages/es/common.json";
import fr from "../../messages/fr/common.json";
import pl from "../../messages/pl/common.json";
import { installFakeBrowser, SUBJECT, type FakeBrowser } from "./__fixtures__/fake-browser";
import {
  COOKIE_PREFERENCES_KEY,
  DIALOG_ACTION_ROW,
  NOTICE_KEYS,
  PRIVACY_CHOICES_KEY,
  SWITCH_ROW,
  TAP_TARGET,
  applyLocks,
  choicesLabel,
  monthsFromDays,
  preferencesView,
  splitLastWord,
} from "./choices-ui";
import raw from "./policy-matrix.v1.json";
import { POLICY_MATRIX, buildPolicyMatrix, type RawPolicyMatrix } from "./policy-matrix";
import { SERVER_SNAPSHOT, readConsentSnapshot } from "./snapshot";

const ROWS = POLICY_MATRIX.rows;
const matrixWith = (flag: "off" | "service_provider") =>
  buildPolicyMatrix({ ...raw, analytics_under_us_opt_out: flag } as RawPolicyMatrix);

let browser: FakeBrowser | null = null;
afterEach(() => {
  browser?.restore();
  browser = null;
});

describe("the footer label (AC2.5)", () => {
  test.each([
    ["a US visitor once the region has resolved", "notice", true, PRIVACY_CHOICES_KEY, true],
    ["an EU visitor once the region has resolved", "banner", true, COOKIE_PREFERENCES_KEY, false],
    ["a US visitor before the region has resolved", "notice", false, COOKIE_PREFERENCES_KEY, false],
    ["anyone before the region has resolved", "banner", false, COOKIE_PREFERENCES_KEY, false],
  ] as const)("%s", (_who, surface, ready, key, icon) => {
    expect(choicesLabel({ surface, ready })).toEqual({ key, icon });
  });

  test("the server render, which knows nothing about the visitor, is never empty", () => {
    expect(choicesLabel(SERVER_SNAPSHOT)).toEqual({ key: COOKIE_PREFERENCES_KEY, icon: false });
  });

  test.each([
    ["America/New_York", PRIVACY_CHOICES_KEY],
    ["Europe/Paris", COOKIE_PREFERENCES_KEY],
    ["Antarctica/Troll", COOKIE_PREFERENCES_KEY],
  ])("a visitor in %s is read from their row, not from their country", (timezone, key) => {
    browser = installFakeBrowser({ timezone, cookie: `stampeo_sid=${SUBJECT}` });
    expect(choicesLabel(readConsentSnapshot()).key).toBe(key);
  });

  test("a US visitor is shown the generic label until their subject id exists", () => {
    browser = installFakeBrowser({ timezone: "America/New_York" });
    expect(choicesLabel(readConsentSnapshot()).key).toBe(COOKIE_PREFERENCES_KEY);

    browser.setJar(`stampeo_sid=${SUBJECT}`);
    expect(choicesLabel(readConsentSnapshot()).key).toBe(PRIVACY_CHOICES_KEY);
  });

  test.each([
    ["Your Privacy Choices", "Your Privacy ", "Choices"],
    ["Cookie preferences", "Cookie ", "preferences"],
    ["Choices", "", "Choices"],
    ["", "", ""],
  ])("keeps the icon with the last word of %p", (label, head, tail) => {
    expect(splitLastWord(label)).toEqual({ head, tail });
  });
});

describe("the preferences dialog by region", () => {
  test("a US visitor sees Advertising first and Strictly necessary last (AC2.7)", () => {
    expect(preferencesView(ROWS.US, false).order).toEqual(["marketing", "analytics", "necessary"]);
  });

  test.each(["EEA_UK_CH", "UNKNOWN"])("a visitor in %s sees Strictly necessary first", (key) => {
    expect(preferencesView(ROWS[key], false).order).toEqual(["necessary", "analytics", "marketing"]);
  });

  test("the EU dialog with no GPC has no status row, no lock and two actions", () => {
    expect(preferencesView(ROWS.EEA_UK_CH, false)).toMatchObject({
      variant: "eu",
      locked: [],
      gpcStatus: null,
      onlyClose: false,
    });
  });
});

describe("which intro the dialog opens with", () => {
  test.each([
    ["US", false, "off", "us.intro"],
    ["US", true, "off", "us.introLocked"],
    ["US", true, "service_provider", "us.intro"],
    ["EEA_UK_CH", false, "off", "intro"],
    ["EEA_UK_CH", true, "off", "intro"],
    ["UNKNOWN", false, "off", "intro"],
  ] as const)("%s, GPC %s, analytics under opt-out %s: %s", (key, gpc, setting, intro) => {
    // The locked intro is for the dialog with nothing left to switch.
    expect(preferencesView(matrixWith(setting).rows[key], gpc, matrixWith(setting)).intro).toBe(intro);
  });
});

describe("what Global Privacy Control locks (AC2.6)", () => {
  test.each([
    // region, gpc, analytics setting -> locked, status row, only Close
    ["US", false, "off", [], null, false],
    ["US", false, "service_provider", [], null, false],
    ["US", true, "off", ["marketing", "analytics"], "all", true],
    ["US", true, "service_provider", ["marketing"], "advertising", false],
    ["EEA_UK_CH", false, "off", [], null, false],
    ["EEA_UK_CH", true, "off", [], null, false],
    ["EEA_UK_CH", true, "service_provider", [], null, false],
    ["UNKNOWN", true, "off", [], null, false],
  ] as const)(
    "%s, GPC %s, analytics under opt-out %s",
    (key, gpc, setting, locked, gpcStatus, onlyClose) => {
      const view = preferencesView(matrixWith(setting).rows[key], gpc, matrixWith(setting));
      expect([...view.locked].sort()).toEqual([...locked].sort());
      expect(view.gpcStatus).toBe(gpcStatus);
      expect(view.onlyClose).toBe(onlyClose);
    },
  );

  test("a locked category cannot be saved as on, whatever the draft says", () => {
    const view = preferencesView(ROWS.US, true);
    expect(applyLocks({ analytics: true, marketing: true }, view.locked)).toEqual({
      analytics: false,
      marketing: false,
    });
  });

  test("an unlocked category keeps the visitor's choice", () => {
    const view = preferencesView(matrixWith("service_provider").rows.US, true, matrixWith("service_provider"));
    expect(applyLocks({ analytics: true, marketing: true }, view.locked)).toEqual({
      analytics: true,
      marketing: false,
    });
  });
});

/** Tailwind's spacing scale at the default root: `h-11` is 2.75rem, which is 44px. */
const px = (utility: string) => {
  const match = /^(?:h|pt|pb)-(\d+(?:\.\d+)?)$/.exec(utility);
  return match ? Number(match[1]) * 4 : 0;
};
const classesOf = (value: string) => value.split(/\s+/);

describe("the action row and the touch targets (AC2.8, AC2.10)", () => {
  test("the dialog's actions stay at the bottom of the dialog while the cards scroll", () => {
    expect(classesOf(DIALOG_ACTION_ROW)).toEqual(expect.arrayContaining(["sticky", "bottom-0"]));
  });

  test.each([
    ["a button on the banner, the notice and the dialog", TAP_TARGET],
  ])("%s is 44px tall", (_what, target) => {
    expect(classesOf(target).reduce((tallest, cls) => Math.max(tallest, px(cls)), 0)).toBeGreaterThanOrEqual(44);
  });

  test("a switch row is 44px tall: its padding plus its 24px track", () => {
    const padding = classesOf(SWITCH_ROW.padding).reduce((sum, cls) => sum + px(cls), 0);

    expect(padding + px(SWITCH_ROW.track)).toBeGreaterThanOrEqual(44);
  });
});

describe("what the notice reads (AC2.10)", () => {
  test.each(LOCALES)("its link is the footer's own words, and its dismiss exists, in %s", (locale) => {
    expect(NOTICE_KEYS.choices).toBe(PRIVACY_CHOICES_KEY);
    expect(read(locale, NOTICE_KEYS.choices)).toBe(read(locale, PRIVACY_CHOICES_KEY));
    expect(typeof read(locale, NOTICE_KEYS.dismiss)).toBe("string");
  });
});

describe("how long the intro says a choice is kept (AC2.9)", () => {
  test.each([
    [400, 13],
    [182, 6],
    [365, 12],
    [30, 1],
    [1, 1],
  ])("%d days is %d months", (days, months) => {
    expect(monthsFromDays(days)).toBe(months);
  });

  test("a US visitor is told how long a refusal lasts: 13 months", () => {
    expect(preferencesView(ROWS.US, false).months).toBe(13);
  });

  test.each(["EEA_UK_CH", "UNKNOWN"])("a visitor in %s is told 6 months", (key) => {
    expect(preferencesView(ROWS[key], false).months).toBe(6);
  });

  test("an EU row whose grant outlives its refusal is told the shorter one", () => {
    const row = { ...ROWS.EEA_UK_CH, grant_ttl_days: 365, refusal_ttl_days: 91 };
    expect(preferencesView(row, false).months).toBe(3);
  });

  test("the number follows the row, so changing the matrix changes the sentence", () => {
    const row = { ...ROWS.US, refusal_ttl_days: 730 };
    expect(preferencesView(row, false).months).toBe(24);
  });
});

// ───────────────────────────── copy ─────────────────────────────

const CATALOGS = { en, fr, es, pl } as const;
const LOCALES = Object.keys(CATALOGS) as (keyof typeof CATALOGS)[];

function read(locale: keyof typeof CATALOGS, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], CATALOGS[locale].common);
}

function strings(node: unknown, prefix: string, out: Record<string, string> = {}) {
  if (typeof node === "string") out[prefix] = node;
  else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) strings(value, `${prefix}.${key}`, out);
  }
  return out;
}

const NUMBER_WORDS = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "twelve", "thirteen",
  "un", "une", "deux", "trois", "quatre", "cinq", "sept", "huit", "neuf", "dix", "douze", "treize",
  "uno", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "doce", "trece",
  "jeden", "dwa", "trzy", "cztery", "pięć", "sześć", "siedem", "osiem", "dziewięć", "dziesięć", "dwanaście", "trzynaście",
].join("|");
const UNITS = [
  "months?", "mois", "mes(?:es)?", "miesi(?:ąc|ące|ęcy|ąca)",
  "days?", "jours?", "d[ií]as?", "dni", "dzień",
  "years?", "ans?", "années?", "a[nñ]os?", "rok", "lata", "lat",
].join("|");
/** A number, in digits or in words, directly followed by a month, day or year. */
const HARD_CODED_DURATION = new RegExp(
  `(?:(?<!\\p{L})\\d+\\s*|(?<!\\p{L})(?:${NUMBER_WORDS})\\s+)(?:${UNITS})(?!\\p{L})`,
  "iu",
);

describe("the duration guard itself", () => {
  test.each([
    "We keep your choice for six months",
    "Conservé 6 mois",
    "Guardamos tu elección durante seis meses",
    "13 meses",
    "Zapisujemy na sześć miesięcy",
    "Kept for 182 days",
    "stored for 1 year",
  ])("flags %p", (text) => {
    expect(HARD_CODED_DURATION.test(text)).toBe(true);
  });

  test.each([
    "We keep your choice for {months, plural, one {# month} other {# months}}",
    "Votre choix est conservé {months} mois",
    "{months, plural, one {# mes} other {# meses}}",
    "Always on",
    "Turn each purpose on or off",
  ])("lets %p through", (text) => {
    expect(HARD_CODED_DURATION.test(text)).toBe(false);
  });
});

describe.each(LOCALES)("the privacy copy in %s", (locale) => {
  const cookies = strings((CATALOGS[locale].common as { cookies: unknown }).cookies, "cookies");

  test("no cookies string types a duration into the sentence (AC2.9)", () => {
    const offenders = Object.entries(cookies)
      .filter(([, value]) => HARD_CODED_DURATION.test(value))
      .map(([key, value]) => `${locale} ${key}: ${value}`);
    expect(offenders).toEqual([]);
  });

  test("both intros take the duration from the row", () => {
    expect(cookies["cookies.prefs.intro"]).toContain("{months");
    expect(cookies["cookies.prefs.us.intro"]).toContain("{months");
  });

  test("no string names a pixel we do not install", () => {
    const offenders = Object.entries(cookies).filter(([, value]) => /tiktok/i.test(value));
    expect(offenders).toEqual([]);
  });

  test("the notice's own title is the footer's words too", () => {
    expect(cookies["cookies.notice.title"]).toBe(read(locale, PRIVACY_CHOICES_KEY));
  });

  test("the US intro says where the link is: the footer, not every page", () => {
    const FOOTER = { en: /footer/, fr: /pied de page/, es: /pie de página/, pl: /stopce/ };
    const EVERY_PAGE = { en: /any page/, fr: /n'importe quelle page/, es: /cualquier página/, pl: /dowolnej strony/ };

    expect(cookies["cookies.prefs.us.intro"]).toMatch(FOOTER[locale]);
    expect(cookies["cookies.prefs.us.intro"]).not.toMatch(EVERY_PAGE[locale]);
  });

  test("the locked intro points back at the link and types no duration", () => {
    expect(cookies["cookies.prefs.us.introLocked"]).toContain("{choices}");
    expect(cookies["cookies.prefs.us.introLocked"]).not.toContain("{months");
  });

  test("the footer link, the notice button and the US dialog title are one set of words (AC2.10)", () => {
    const label = read(locale, PRIVACY_CHOICES_KEY);
    expect(typeof label).toBe("string");
    expect(label).not.toBe("");
    // The notice reads the footer's key: it keeps no label string of its own.
    expect(cookies).not.toHaveProperty("cookies.notice.choices");
    expect(cookies["cookies.prefs.us.title"]).toBe(label);
    // The intro points back at the link by interpolation, so the two cannot drift.
    expect(cookies["cookies.prefs.us.intro"]).toContain("{choices}");
  });

  test("every string the preferences dialog reads exists", () => {
    const needed = [
      COOKIE_PREFERENCES_KEY,
      "cookies.prefs.lockedOff",
      "cookies.prefs.close",
      "cookies.prefs.us.gpc.statusAll",
      "cookies.prefs.us.gpc.statusAdvertising",
      "cookies.prefs.us.marketing.title",
      "cookies.prefs.us.marketing.body",
      "cookies.prefs.us.analytics.title",
      "cookies.prefs.us.analytics.body",
    ];
    const missing = needed.filter((key) => typeof read(locale, key) !== "string" || read(locale, key) === "");
    expect(missing).toEqual([]);
  });
});

describe("the two state labels are one pair", () => {
  // Both read as the state of a setting, so they share a gender and a number.
  test.each([
    ["en", "Always on", "Off"],
    ["fr", "Toujours activé", "Désactivé"],
    ["es", "Siempre activado", "Desactivado"],
    ["pl", "Zawsze włączone", "Wyłączone"],
  ] as const)("%s", (locale, always, off) => {
    expect(read(locale, "cookies.prefs.necessary.always")).toBe(always);
    expect(read(locale, "cookies.prefs.lockedOff")).toBe(off);
  });
});

describe("the English statutory title", () => {
  test("is Your Privacy Choices, exactly", () => {
    expect(read("en", PRIVACY_CHOICES_KEY)).toBe("Your Privacy Choices");
  });
});
