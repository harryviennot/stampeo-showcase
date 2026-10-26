import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { privacySource, retentionTable, section, termsSection, termsSource } from "./policy-test-utils";

/**
 * Who answers for staff activity data: which team member recorded each
 * transaction, and each member's last scan and number of scans. The business
 * (the employer) is the controller and Stampeo its processor, except for the
 * few uses Stampeo makes of it on its own account. Each case pins one statement
 * in the words each locale uses.
 */

const s21 = (locale: string) => section(locale, /^###\s+2\.1\s/m);
const s32 = (locale: string) => section(locale, /^###\s+3\.2\s/m);
const terms811 = (locale: string) => termsSection(locale, /^###\s+8\.11\s/m);
/** Terms §8's opening paragraph, before 8.1. */
const terms8Intro = (locale: string) => termsSection(locale, /^##\s+8\./m);

const WORDING: Record<
  string,
  {
    controller: RegExp;
    processor: RegExp;
    staffRow: RegExp;
    businessBasis: RegExp;
    retiredNoOwnUse: RegExp;
    ownUses: RegExp;
    positionNeverSent: RegExp;
    retentionRow: RegExp;
    termsRoles: RegExp;
    informTeam: RegExp;
    representatives: RegExp;
  }
> = {
  en: {
    controller: /The business is the \*\*data controller\*\* for staff activity data/,
    processor: /Stampeo acts as a \*\*data processor\*\* for this data/,
    staffRow: /^\|\s*(Team activity|Per-transaction attribution)/,
    businessBasis: /Determined by the business, as controller/,
    retiredNoOwnUse: /Stampeo does not use them for its own purposes/,
    ownUses: /for two purposes of its own, as controller/,
    positionNeverSent: /never sent to Stampeo/,
    retentionRow: /Staff activity data/,
    termsRoles:
      /The Business User is the controller of Staff Activity Data, and Stampeo processes it as its processor/,
    informTeam: /inform the members of its team/,
    representatives: /staff representatives/,
  },
  fr: {
    controller:
      /L'entreprise est \*\*responsable de traitement\*\* des données d'activité de l'équipe/,
    processor: /Stampeo agit en tant que \*\*sous-traitant\*\* pour ces données/,
    staffRow: /^\|\s*(Activité de l'équipe|Attribution des opérations)/,
    businessBasis: /Déterminée par l'entreprise, responsable de traitement/,
    retiredNoOwnUse: /Stampeo ne les utilise pas à ses propres fins/,
    ownUses: /deux finalités qui lui sont propres, en tant que responsable de traitement/,
    positionNeverSent: /n'est jamais envoyée à Stampeo/,
    retentionRow: /Données d'activité de l'équipe/,
    termsRoles:
      /L'Utilisateur Business est responsable de traitement des Données d'Activité de l'Équipe, et Stampeo les traite en qualité de sous-traitant/,
    informTeam: /informer les membres de son équipe/,
    representatives: /représentants du personnel/,
  },
  es: {
    controller:
      /El comercio es el \*\*responsable del tratamiento\*\* de los datos de actividad del equipo/,
    processor: /Stampeo actúa como \*\*encargado del tratamiento\*\* de estos datos/,
    staffRow: /^\|\s*(Actividad del equipo|Atribución de las operaciones)/,
    businessBasis: /Determinada por el comercio, como responsable del tratamiento/,
    retiredNoOwnUse: /Stampeo no las utiliza con fines propios/,
    ownUses: /dos finalidades propias, como responsable del tratamiento/,
    positionNeverSent: /nunca se envía a Stampeo/,
    retentionRow: /Datos de actividad del equipo/,
    termsRoles:
      /El Usuario Business es el responsable del tratamiento de los Datos de Actividad del Equipo, y Stampeo los trata como encargado del tratamiento/,
    informTeam: /informar a los miembros de su equipo/,
    representatives: /representantes de los trabajadores/,
  },
  pl: {
    controller: /Firma jest \*\*administratorem\*\* danych o aktywności zespołu/,
    processor: /Stampeo działa wobec tych danych jako \*\*podmiot przetwarzający\*\*/,
    staffRow: /^\|\s*(Aktywność zespołu|Przypisanie operacji)/,
    businessBasis: /Określa ją firma jako administrator/,
    retiredNoOwnUse: /Stampeo nie wykorzystuje ich do własnych celów/,
    ownUses: /w dwóch własnych celach, jako administrator/,
    positionNeverSent: /nigdy nie jest wysyłane do Stampeo/,
    retentionRow: /Dane o aktywności zespołu/,
    termsRoles:
      /Użytkownik Business jest administratorem Danych o Aktywności Zespołu, a Stampeo przetwarza je jako podmiot przetwarzający/,
    informTeam: /poinformować członków swojego zespołu/,
    representatives: /przedstawicieli pracowników/,
  },
};

describe("privacy: staff activity data belongs to the business", () => {
  it.each(routing.locales)(
    "§2.1 names the business as controller and Stampeo as processor (%s)",
    (locale) => {
      const w = WORDING[locale];
      expect(s21(locale)).toMatch(w.controller);
      expect(s21(locale)).toMatch(w.processor);
    },
  );

  it.each(routing.locales)(
    "§3.2 gives both staff activity rows the business's legal basis (%s)",
    (locale) => {
      const w = WORDING[locale];
      const rows = s32(locale)
        .split("\n")
        .filter((line) => w.staffRow.test(line.trim()));
      expect(rows, `${locale} §3.2 staff activity rows`).toHaveLength(2);
      for (const row of rows) {
        const basis = row.split("|").filter((cell) => cell.trim()).pop();
        expect(basis, `${locale} §3.2 row "${row}"`).toMatch(w.businessBasis);
      }
    },
  );

  it.each(routing.locales)(
    "§3.2 states Stampeo's own uses instead of denying any (%s)",
    (locale) => {
      // Stampeo's support console and the inactivity rule do use this data, so
      // the old denial was untrue and must not come back.
      const w = WORDING[locale];
      expect(privacySource(locale)).not.toMatch(w.retiredNoOwnUse);
      expect(s32(locale)).toMatch(w.ownUses);
    },
  );

  it.each(routing.locales)(
    "§3.2 says the phone's position is never sent to Stampeo (%s)",
    (locale) => {
      expect(s32(locale)).toMatch(WORDING[locale].positionNeverSent);
    },
  );

  it.each(routing.locales)("§8 has a retention row for it, citing §3.2 (%s)", (locale) => {
    const w = WORDING[locale];
    expect(
      retentionTable(locale).some((row) => w.retentionRow.test(row) && /3\.2/.test(row)),
      `${locale} retention table has no staff activity row citing §3.2`,
    ).toBe(true);
  });
});

describe("terms: §8 covers staff activity data", () => {
  it.each(routing.locales)("§8's opening extends the processing terms to §8.11 (%s)", (locale) => {
    expect(terms8Intro(locale)).toContain("8.11");
  });

  it.each(routing.locales)(
    "§8.11 sets the roles and the business's duty to inform its team (%s)",
    (locale) => {
      const w = WORDING[locale];
      const text = terms811(locale);
      expect(text).toMatch(w.termsRoles);
      expect(text).toMatch(w.informTeam);
      expect(text).toMatch(w.representatives);
    },
  );

  it.each(routing.locales)("§8's subsections still run 8.1 to 8.11 in order (%s)", (locale) => {
    // Emails and other sections cite these numbers, so a new subsection goes last.
    const numbers = termsSource(locale)
      .split("\n")
      .map((line) => line.match(/^###\s+(8\.\d+)\s/)?.[1])
      .filter(Boolean);
    expect(numbers).toEqual(Array.from({ length: 11 }, (_, i) => `8.${i + 1}`));
  });
});
