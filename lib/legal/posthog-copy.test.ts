import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { cookiesOf, retentionTable, s4, s53 } from "./policy-test-utils";

/**
 * PostHog in the privacy policy and in the cookie dialog, in every language: what a visitor reads once PostHog
 * remembers a browser who allows audience measurement, records sessions with every form field masked and links
 * the visits to the account they create. The policy names PostHog Inc. as the processor on its EU Cloud, lists
 * the `ph_*` cookie among those that need consent, and gives each kind of PostHog data its retention.
 */

/** The cells of a Markdown table row. */
const cells = (row: string) =>
  row
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());

const rowWith = (rows: string[], pattern: RegExp) => rows.find((row) => pattern.test(row));

const tableRows = (text: string) => text.split("\n").filter((line) => line.trim().startsWith("|"));

/** What each locale's §4 row for PostHog says, cell by cell: the processor, what it does for us, where it is hosted. */
const SUB_PROCESSOR_ROW: Record<string, { vendor: RegExp; purpose: RegExp; where: RegExp }> = {
  en: {
    vendor: /^PostHog Inc\. \(PostHog EU Cloud\)$/,
    purpose: /Product analytics and audience measurement: visit counts and, depending on your choice, session recordings, heatmaps and the steps of an account's life \(see 5\.4\)/,
    where: /^Frankfurt, Germany \(EU\)$/,
  },
  fr: {
    vendor: /^PostHog Inc\. \(PostHog EU Cloud\)$/,
    purpose: /comptage des visites et, selon votre choix, enregistrements de session, cartes de chaleur et étapes de la vie d'un compte \(voir 5\.4\)/,
    where: /^Francfort, Allemagne \(UE\)$/,
  },
  es: {
    vendor: /^PostHog Inc\. \(PostHog EU Cloud\)$/,
    purpose: /recuento de visitas y, según lo que elijas, grabaciones de sesión, mapas de calor y pasos de la vida de una cuenta \(véase 5\.4\)/,
    where: /^Fráncfort, Alemania \(UE\)$/,
  },
  pl: {
    vendor: /^PostHog Inc\. \(PostHog EU Cloud\)$/,
    purpose: /liczenie wizyt oraz, zależnie od Twojego wyboru, nagrania sesji, mapy cieplne i etapy historii konta \(zob\. 5\.4\)/,
    where: /^Frankfurt, Niemcy \(UE\)$/,
  },
};

/** The `ph_*` row of the cookies that need consent: its purpose, the host-only scope and the six months at most. */
const PH_COOKIE_ROW: Record<string, { purpose: RegExp; scope: RegExp }> = {
  en: { purpose: /^Audience measurement, session recordings and heatmaps$/, scope: /^`ph_\*` \(stampeo\.app only, 6 months at most; see 5\.4\)$/ },
  fr: { purpose: /^Mesure d'audience, enregistrements de session et cartes de chaleur$/, scope: /^`ph_\*` \(stampeo\.app uniquement, 6 mois au plus ; voir 5\.4\)$/ },
  es: { purpose: /^Medición de audiencia, grabaciones de sesión y mapas de calor$/, scope: /^`ph_\*` \(solo stampeo\.app, 6 meses como máximo; véase 5\.4\)$/ },
  pl: { purpose: /^Pomiar ruchu, nagrania sesji i mapy cieplne$/, scope: /^`ph_\*` \(tylko stampeo\.app, najwyżej 6 miesięcy; zob\. 5\.4\)$/ },
};

/** §8: events and profiles 13 months, recordings 30 days, the steps prepared on our servers 13 months. */
const RETENTION: Record<string, { events: [RegExp, RegExp]; recordings: [RegExp, RegExp]; steps: [RegExp, RegExp] }> = {
  en: {
    events: [/^PostHog events and visitor profiles \(§5\.4\)$/, /^13 months at most\. When an account is deleted, we also ask PostHog to delete the profile linked to it$/],
    recordings: [/^PostHog session recordings \(§5\.4\)$/, /^30 days$/],
    steps: [/^Account steps prepared on our servers for PostHog \(§5\.4\)$/, /^13 months at most, and deleted with the account$/],
  },
  fr: {
    events: [/^Événements et profils de visiteurs PostHog \(§5\.4\)$/, /^13 mois au plus\. À la suppression d'un compte, nous demandons aussi à PostHog de supprimer le profil qui lui est rattaché$/],
    recordings: [/^Enregistrements de session PostHog \(§5\.4\)$/, /^30 jours$/],
    steps: [/^Étapes d'un compte préparées sur nos serveurs pour PostHog \(§5\.4\)$/, /^13 mois au plus, et supprimées avec le compte$/],
  },
  es: {
    events: [/^Eventos y perfiles de visitantes en PostHog \(§5\.4\)$/, /^13 meses como máximo\. Cuando se elimina una cuenta, pedimos también a PostHog que elimine el perfil vinculado a ella$/],
    recordings: [/^Grabaciones de sesión en PostHog \(§5\.4\)$/, /^30 días$/],
    steps: [/^Pasos de una cuenta preparados en nuestros servidores para PostHog \(§5\.4\)$/, /^13 meses como máximo, y se eliminan con la cuenta$/],
  },
  pl: {
    events: [/^Zdarzenia i profile odwiedzających w PostHog \(§5\.4\)$/, /^Najwyżej 13 miesięcy\. Po usunięciu konta prosimy też PostHog o usunięcie powiązanego z nim profilu$/],
    recordings: [/^Nagrania sesji w PostHog \(§5\.4\)$/, /^30 dni$/],
    steps: [/^Etapy konta przygotowane na naszych serwerach dla PostHog \(§5\.4\)$/, /^Najwyżej 13 miesięcy; usuwane razem z kontem$/],
  },
};

describe("the privacy policy names PostHog as a processor, a cookie and a retention", () => {
  it.each(routing.locales)("§4 lists PostHog Inc. on its EU Cloud in Frankfurt, with what it does for us (%s)", (locale) => {
    const row = rowWith(tableRows(s4(locale)), /PostHog/);

    expect(row, `${locale} §4 PostHog row`).toBeDefined();
    const [vendor, purpose, where] = cells(row!);
    expect(vendor).toMatch(SUB_PROCESSOR_ROW[locale].vendor);
    expect(purpose).toMatch(SUB_PROCESSOR_ROW[locale].purpose);
    expect(where).toMatch(SUB_PROCESSOR_ROW[locale].where);
    expect(tableRows(s4(locale)).filter((line) => /PostHog/.test(line)), `${locale} §4 has one PostHog row`).toHaveLength(1);
  });

  it.each(routing.locales)("§5.3 lists the ph_* cookie under audience measurement, set for stampeo.app alone, for 6 months at most (%s)", (locale) => {
    const row = rowWith(tableRows(s53(locale)), /`ph_\*`/);

    expect(row, `${locale} §5.3 ph_* row`).toBeDefined();
    const [purpose, vendor, scope] = cells(row!);
    expect(purpose).toMatch(PH_COOKIE_ROW[locale].purpose);
    expect(vendor).toBe("PostHog");
    expect(scope).toMatch(PH_COOKIE_ROW[locale].scope);
  });

  it.each(routing.locales)("§8 gives PostHog events and profiles 13 months, recordings 30 days and the steps on our servers 13 months (%s)", (locale) => {
    const rows = retentionTable(locale).filter((row) => /PostHog/.test(row));
    const expected = RETENTION[locale];

    expect(rows, `${locale} §8 PostHog rows`).toHaveLength(3);
    for (const [row, [what, howLong]] of [
      [rows[0], expected.events],
      [rows[1], expected.recordings],
      [rows[2], expected.steps],
    ] as const) {
      const [first, second] = cells(row);
      expect(first).toMatch(what);
      expect(second).toMatch(howLong);
    }
  });
});

/** The analytics cards: PostHog by name, the masked recordings, and what turning the card off leaves. */
const CARD: Record<string, { masked: RegExp; recordingsNeedSave: RegExp; offLeaves: RegExp; noEmailOrName: RegExp }> = {
  en: {
    masked: /session recordings with every form field masked|Session recordings, with every form field masked/,
    recordingsNeedSave: /start only if you save your choice with this turned on/,
    offLeaves: /PostHog only counts visits, without a cookie/,
    noEmailOrName: /without ever receiving your email or name/,
  },
  fr: {
    masked: /enregistre vos sessions en masquant chaque champ de formulaire|chaque champ de formulaire masqué/,
    recordingsNeedSave: /ne démarrent que si vous validez votre choix avec cette finalité activée/,
    offLeaves: /PostHog se contente de compter les visites, sans cookie/,
    noEmailOrName: /sans jamais recevoir votre adresse email ni votre nom/,
  },
  es: {
    masked: /graba tus sesiones con todos los campos de formulario ocultos|con todos los campos de formulario ocultos/,
    recordingsNeedSave: /solo empiezan si guardas tu elección con esta finalidad activada/,
    offLeaves: /PostHog solo cuenta las visitas, sin cookies/,
    noEmailOrName: /sin recibir nunca tu correo electrónico ni tu nombre/,
  },
  pl: {
    masked: /nagrywa sesje, maskując wszystkie pola formularzy|z zamaskowanymi polami formularzy/,
    recordingsNeedSave: /włączają się dopiero wtedy, gdy zapiszesz swój wybór przy włączonym tym celu/,
    offLeaves: /PostHog tylko liczy wizyty, bez plików cookie/,
    noEmailOrName: /nigdy nie otrzymując twojego adresu e-mail ani imienia i nazwiska/,
  },
};

describe("the audience measurement cards name PostHog and its masked recordings", () => {
  it.each(routing.locales)("both cards name Google Analytics and PostHog, the masked recordings, and the link to the account without email or name (%s)", (locale) => {
    const { prefs } = cookiesOf(locale);

    for (const body of [prefs.analytics.body, prefs.us.analytics.body]) {
      expect(body).toContain("Google Analytics");
      expect(body).toContain("PostHog");
      expect(body).toMatch(CARD[locale].masked);
      expect(body).toMatch(CARD[locale].noEmailOrName);
      expect(body).toMatch(CARD[locale].offLeaves);
    }
  });

  it.each(routing.locales)("the United States card says recordings start only once the choice is saved with the card on (%s)", (locale) => {
    expect(cookiesOf(locale).prefs.us.analytics.body).toMatch(CARD[locale].recordingsNeedSave);
  });

  it.each(routing.locales)("the advertising cards, the banner and the notice do not mention PostHog (%s)", (locale) => {
    const { prefs, banner, notice } = cookiesOf(locale);

    for (const body of [prefs.marketing.body, prefs.us.marketing.body, banner.body, notice.body]) {
      expect(body).not.toContain("PostHog");
    }
  });
});
