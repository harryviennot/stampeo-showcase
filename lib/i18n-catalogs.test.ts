/**
 * Catalog guards for `messages/`.
 *
 * next-intl has NO per-key fallback. A key present in `en` and missing in the
 * locale a visitor lands in does not quietly render English: in dev it throws,
 * in prod it renders the raw key path onto the page. On a marketing site that
 * is a broken page served to a stranger, and every locale is a real URL Google
 * can reach, so completeness is what keeps the site up.
 *
 * Everything here is driven off `routing.locales` and off the namespace files
 * that actually exist in `messages/en/`. Adding a fifth language means adding it
 * to the routing config and dropping a folder in; no test in this file is edited.
 *
 * The Polish blocks at the bottom are a different kind of check. Polish is the
 * first locale where a string can be present, complete and correctly spelled and
 * still be wrong for the reader: past-tense verbs agree with the reader's gender,
 * and counts need four plural arms where fr/es get away with two.
 */

import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse, TYPE } from '@formatjs/icu-messageformat-parser';
import { routing } from '../i18n/routing';

const LOCALES = routing.locales;
const MESSAGES_DIR = join(import.meta.dir, '..', 'messages');
const SOURCE_LOCALE = 'en';

/** Namespace file names, read from disk so a new namespace is covered on sight. */
const NAMESPACES = readdirSync(join(MESSAGES_DIR, SOURCE_LOCALE))
  .filter((f) => f.endsWith('.json'))
  .sort();

const OTHER_LOCALES = LOCALES.filter((l) => l !== SOURCE_LOCALE);

/**
 * Keys a locale is allowed to carry that `en` does not.
 *
 * Every entry needs a reason. This list may shrink; it must not grow without
 * one, because an extra key is usually a rename that only landed in one file.
 */
const EXTRA_KEY_ALLOWLIST: Record<string, readonly string[]> = {
  // Deliberate. The French trust strip shows a phone number because French
  // visitors call; the English and Spanish strips do not offer one, so the key
  // exists in exactly one locale on purpose.
  'fr/landing.json': ['variant.trustStrip.phone'],
};

/**
 * Prose that carried an em dash before the house style banned them. The ban is
 * enforced for everything else; this list is a ratchet, so it may shrink (fix
 * the copy and the test still passes) but a NEW em dash fails.
 */
const LEGACY_EM_DASH: ReadonlySet<string> = new Set([
  'fr/about.json::about.hero.description',
  'fr/about.json::about.values.items[2].description',
  'fr/about.json::about.story.paragraphs[0]',
  'en/about.json::about.hero.description',
  'en/about.json::about.values.items[2].description',
  'en/about.json::about.story.paragraphs[0]',
  'fr/acquisition.json::acquisition.notReady.description',
  'en/acquisition.json::acquisition.notReady.description',
  'en/common.json::common.nav.featuresItems.campagnesPromotionnelles.description',
  'fr/features.json::features.scanner-mobile.sections[0].description',
  'fr/features.json::features.scanner-mobile.custom.howItWorks.subtitle',
  'fr/features.json::features.scanner-mobile.custom.howItWorks.app.steps[3]',
  'fr/features.json::features.scanner-mobile.custom.howItWorks.web.steps[3]',
  'fr/features.json::features.scanner-mobile.custom.offline.subtitle',
  'fr/features.json::features.notifications-push.howItWorks.steps[2].description',
  'fr/features.json::features.notifications-push.privacy.points[1]',
  'fr/features.json::features.analytiques.custom.activityFeed.sectionDescription',
  'fr/features.json::features.geolocalisation.howItWorks.subtitle',
  'fr/features.json::features.geolocalisation.scenarios.items[0].description',
  'fr/features.json::features.geolocalisation.scenarios.items[1].description',
  'fr/features.json::features.geolocalisation.scenarios.items[2].description',
  'fr/features.json::features.campagnes-promotionnelles.hero.navTitle',
  'en/features.json::features.scanner-mobile.sections[0].description',
  'en/features.json::features.scanner-mobile.custom.howItWorks.subtitle',
  'en/features.json::features.scanner-mobile.custom.howItWorks.app.steps[3]',
  'en/features.json::features.scanner-mobile.custom.howItWorks.web.steps[3]',
  'en/features.json::features.scanner-mobile.custom.offline.subtitle',
  'en/features.json::features.notifications-push.howItWorks.steps[2].description',
  'en/features.json::features.notifications-push.privacy.points[1]',
  'en/features.json::features.analytiques.custom.activityFeed.sectionDescription',
  'en/features.json::features.geolocalisation.howItWorks.subtitle',
  'en/features.json::features.geolocalisation.scenarios.items[0].description',
  'en/features.json::features.geolocalisation.scenarios.items[1].description',
  'en/features.json::features.geolocalisation.scenarios.items[2].description',
  'en/features.json::features.campagnes-promotionnelles.hero.navTitle',
  'en/landing.json::landing.hero.badge',
  'en/landing.json::landing.hero.stamp.mobileAddWallet',
  'en/landing.json::landing.featureGrid.features[1].description',
  'fr/metadata.json::metadata.features.scanner-mobile.title',
  'fr/metadata.json::metadata.features.scanner-mobile.description',
  'fr/metadata.json::metadata.features.notifications-push.title',
  'fr/metadata.json::metadata.features.analytiques.title',
  'fr/metadata.json::metadata.features.campagnes-promotionnelles.title',
  'en/metadata.json::metadata.features.scanner-mobile.title',
  'en/metadata.json::metadata.features.scanner-mobile.description',
  'en/metadata.json::metadata.features.notifications-push.title',
  'en/metadata.json::metadata.features.analytiques.title',
  'en/metadata.json::metadata.features.geolocalisation.title',
  'en/metadata.json::metadata.features.campagnes-promotionnelles.title',
  'fr/pricing.json::pricing.deadlineNotice',
  'fr/pricing.json::pricing.countdown.daysHours',
  'fr/pricing.json::pricing.countdown.hoursMinutes',
  'fr/pricing.json::pricingPage.meta.title',
  'fr/pricing.json::pricingPage.meta.description',
  'fr/pricing.json::pricingPage.faq.items[5].answer',
  'en/pricing.json::pricing.deadlineNotice',
  'en/pricing.json::pricingPage.meta.title',
  'en/pricing.json::pricingPage.meta.description',
  'en/pricing.json::pricingPage.faq.items[5].answer',
]);

// ───────────────────────────── loading ─────────────────────────────

type Catalog = Record<string, string>;

/**
 * `{a: {b: "x"}, c: ["y"]}` → `{"a.b": "x", "c[0]": "y"}`.
 *
 * Arrays are indexed rather than joined so a locale that drops one bullet from
 * a feature list fails here instead of rendering a short list in production.
 */
function flatten(value: unknown, prefix = '', out: Catalog = {}): Catalog {
  if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(item, `${prefix}[${i}]`, out));
  } else if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      flatten(v, prefix ? `${prefix}.${k}` : k, out);
    }
  } else {
    out[prefix] = String(value);
  }
  return out;
}

function catalogPath(locale: string, namespace: string) {
  return join(MESSAGES_DIR, locale, namespace);
}

function load(locale: string, namespace: string): Catalog {
  return flatten(JSON.parse(readFileSync(catalogPath(locale, namespace), 'utf8')));
}

// ───────────────────────────── ICU tokens ─────────────────────────────

/**
 * Every value a message depends on, as stable labels: `arg:name` for anything
 * interpolated, `tag:b` for a rich-text tag the component has to supply.
 *
 * Parsed with next-intl's own ICU parser rather than a regex, so a plural arm
 * whose text happens to be a bare word (`other {stamps}`) is not mistaken for
 * an argument, and nested plurals are walked correctly.
 *
 * The ICU *form* is deliberately not part of the label. Polish routinely turns
 * a plain `{count}` into `{count, plural, ...}` because two arms are not enough
 * for it; that is the translation doing its job. What must match is the set of
 * names the component passes in, because a name only one side knows about is
 * what actually breaks the render.
 */
function tokens(message: string): Set<string> {
  const found = new Set<string>();
  const walk = (nodes: ReturnType<typeof parse>) => {
    for (const node of nodes) {
      switch (node.type) {
        case TYPE.argument:
        case TYPE.number:
        case TYPE.date:
        case TYPE.time:
          found.add(`arg:${node.value}`);
          break;
        case TYPE.plural:
        case TYPE.select:
          found.add(`arg:${node.value}`);
          for (const option of Object.values(node.options)) walk(option.value);
          break;
        case TYPE.tag:
          found.add(`tag:${node.value}`);
          walk(node.children);
          break;
      }
    }
  };
  walk(parse(message));
  return found;
}

// ───────────────────────────── structure ─────────────────────────────

describe('every supported locale ships every namespace', () => {
  for (const locale of LOCALES) {
    test(locale, () => {
      const missing = NAMESPACES.filter((ns) => !existsSync(catalogPath(locale, ns)));
      expect(
        missing.map((ns) => `messages/${locale}/${ns} does not exist`),
      ).toEqual([]);
    });
  }
});

describe.each(NAMESPACES)('%s', (namespace) => {
  const source = load(SOURCE_LOCALE, namespace);
  const sourceKeys = Object.keys(source);

  describe.each(OTHER_LOCALES)('%s', (locale) => {
    const target = load(locale, namespace);
    const allowed = new Set(EXTRA_KEY_ALLOWLIST[`${locale}/${namespace}`] ?? []);

    test('has no missing keys (next-intl renders the raw key path instead)', () => {
      const missing = sourceKeys
        .filter((key) => !(key in target))
        .map((key) => `messages/${locale}/${namespace} is missing "${key}"`);
      expect(missing).toEqual([]);
    });

    test('has no keys English does not have', () => {
      const extra = Object.keys(target)
        .filter((key) => !(key in source) && !allowed.has(key))
        .map((key) => `messages/${locale}/${namespace} has an extra key "${key}"`);
      expect(extra).toEqual([]);
    });

    test('every message is valid ICU', () => {
      const broken: string[] = [];
      for (const [key, value] of Object.entries(target)) {
        try {
          parse(value);
        } catch (error) {
          broken.push(
            `messages/${locale}/${namespace} "${key}" is not valid ICU: ${(error as Error).message}`,
          );
        }
      }
      expect(broken).toEqual([]);
    });

    test('uses exactly the placeholders and tags English uses', () => {
      const drift: string[] = [];
      for (const key of sourceKeys) {
        if (!(key in target)) continue;
        let expected: Set<string>;
        let actual: Set<string>;
        try {
          expected = tokens(source[key]);
          actual = tokens(target[key]);
        } catch {
          continue; // reported by the ICU validity test above
        }
        const missing = [...expected].filter((t) => !actual.has(t));
        const extra = [...actual].filter((t) => !expected.has(t));
        if (missing.length || extra.length) {
          drift.push(
            `messages/${locale}/${namespace} "${key}": ` +
              `missing [${missing.join(', ')}] unexpected [${extra.join(', ')}]`,
          );
        }
      }
      expect(drift).toEqual([]);
    });
  });
});

// ───────────────────────────── house style ─────────────────────────────

describe('house style', () => {
  test.each(LOCALES)('%s uses no em dashes', (locale) => {
    const offenders: string[] = [];
    for (const namespace of NAMESPACES) {
      for (const [key, value] of Object.entries(load(locale, namespace))) {
        const id = `${locale}/${namespace}::${key}`;
        // A value that IS just the dash is a table's "not included" glyph, not
        // prose punctuation. Only em dashes inside a sentence are banned.
        if (!value.includes('—') || value.trim() === '—') continue;
        if (LEGACY_EM_DASH.has(id)) continue;
        offenders.push(`${id} contains an em dash: ${value.slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ───────────────────────────── Polish ─────────────────────────────

const POLISH_ARMS = ['one', 'few', 'many', 'other'] as const;

/**
 * Second-person singular past tense, which agrees with the reader's gender
 * (`Zapisałeś` / `Zapisałaś`). We do not collect gender, so it is never used.
 *
 * The lookahead matters more than it looks. JavaScript's `\b` is defined over
 * `[A-Za-z0-9_]`, so `ś` counts as a NON-word character and `/ł[ea]ś\b/` fires
 * in the middle of `właściciel` and `właśnie` — 22 false positives across this
 * repo's Polish catalog when first tried. Anchoring on "not followed by any
 * Unicode letter" instead is what makes the guard usable; the self-test below
 * pins both edges.
 */
const GENDERED_PAST = /ł[ea]ś(?!\p{L})/u;

describe('Polish grammar guards', () => {
  const polish = (LOCALES as readonly string[]).includes('pl');

  test.skipIf(!polish)('every English plural has all four Polish arms', () => {
    const gaps: string[] = [];
    for (const namespace of NAMESPACES) {
      const source = load(SOURCE_LOCALE, namespace);
      const target = load('pl', namespace);
      for (const [key, english] of Object.entries(source)) {
        // Deliberately NOT gated on the English using a plural. Polish
        // routinely turns a bare `{count} stamps` into a four-arm plural
        // because two forms cannot express it, and those Polish-only plurals
        // are the ones most likely to be written with an arm missing. So the
        // rule is: if the *Polish* value plurals, it needs all four arms.
        if (!(key in target)) continue;
        if (!english.includes('plural,') && !target[key].includes('plural,')) continue;
        let arms: Set<string>;
        try {
          arms = new Set<string>();
          const walk = (nodes: ReturnType<typeof parse>) => {
            for (const node of nodes) {
              if (node.type === TYPE.plural) {
                for (const arm of Object.keys(node.options)) arms.add(arm);
                for (const option of Object.values(node.options)) walk(option.value);
              } else if (node.type === TYPE.select) {
                for (const option of Object.values(node.options)) walk(option.value);
              } else if (node.type === TYPE.tag) {
                walk(node.children);
              }
            }
          };
          walk(parse(target[key]));
        } catch {
          continue; // reported by the ICU validity test
        }
        const missing = POLISH_ARMS.filter((arm) => !arms.has(arm));
        if (missing.length) {
          gaps.push(
            `messages/pl/${namespace} "${key}" is missing the ${missing.join('/')} ` +
              `arm(s). Polish needs one (1), few (2-4), many (0, 5+) and other.`,
          );
        }
      }
    }
    expect(gaps).toEqual([]);
  });

  test.skipIf(!polish)('never addresses the reader in the past tense', () => {
    const offenders: string[] = [];
    for (const namespace of NAMESPACES) {
      for (const [key, value] of Object.entries(load('pl', namespace))) {
        if (GENDERED_PAST.test(value)) {
          offenders.push(
            `messages/pl/${namespace} "${key}" uses a gendered past tense ` +
              `(we do not know the reader's gender, use an impersonal form ` +
              `like "Zapisano"): ${value.slice(0, 80)}`,
          );
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('the gendered-past guard itself', () => {
  test.each([
    'Zapisałeś zmiany',
    'Zapisałaś zmiany',
    'Dodałeś pieczątkę',
    'Odebrałaś nagrodę',
    'Zapisałeś.',
  ])('flags %p', (text) => {
    expect(GENDERED_PAST.test(text)).toBe(true);
  });

  test.each([
    'właśnie', // the trap: contains "łaś" mid-word
    'Właśnie dodano pieczątkę',
    'właściciel',
    'Właściciele i administratorzy',
    'właściwe informacje',
    'Zmiany zapisane',
    'Zapisano',
  ])('does not flag %p', (text) => {
    expect(GENDERED_PAST.test(text)).toBe(false);
  });
});
