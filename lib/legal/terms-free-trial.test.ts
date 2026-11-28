import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { routing } from "@/i18n/routing";
import { MARKETS } from "../markets";
import { getLegalContent } from "./index";
import { compileLegalMDX } from "./mdx";
import { termsSection } from "./policy-test-utils";

/**
 * Terms of Service §5.1 (free trial) and the trial sentence of §12 (right of
 * withdrawal), in each locale's own words: the trial starts without a payment
 * method, ends after the market's number of days, pauses the service when no
 * plan has been chosen, and the 3-day grace period belongs to failed payments
 * of a paid Subscription only.
 */

const DAYS = new Set(Object.values(MARKETS).map((market) => market.trialDays));

const DAY_WORD: Record<string, string> = { en: "days", fr: "jours", es: "días", pl: "dni" };

interface Wording {
  /** The trial needs no payment method to start. */
  noPaymentMethod: RegExp;
  /** The retired promise: a card is requested at signup and not debited before the trial ends. */
  cardAtSignup: RegExp;
  /** Without a plan at the end of the trial, the service is paused. */
  paused: RegExp;
  /** No grace period follows a free trial. */
  noTrialGrace: RegExp;
  /** The 3-day grace period, and the failed payment it is for. */
  graceHeading: RegExp;
  graceOnlyForFailedPayment: RegExp;
}

const WORDING: Record<string, Wording> = {
  en: {
    noPaymentMethod: /no payment method is required to start it/i,
    cardAtSignup: /payment card is requested at signup|card requested at signup is not debited/i,
    paused: /the service is paused/i,
    noTrialGrace: /No grace period applies after a free trial/i,
    graceHeading: /3-day grace period/i,
    graceOnlyForFailedPayment: /3-day grace period\*\* applies only where a payment[^.]{0,120}fails/i,
  },
  fr: {
    noPaymentMethod: /aucun moyen de paiement n['’]est exigé pour le démarrer/i,
    cardAtSignup: /carte bancaire (?:est )?demandée à l['’]inscription/i,
    paused: /le service est mis en pause/i,
    noTrialGrace: /Aucune période de tolérance ne s['’]applique après un essai gratuit/i,
    graceHeading: /période de tolérance de 3 jours/i,
    graceOnlyForFailedPayment: /période de tolérance de 3 jours\*\* ne s['’]applique que lorsqu['’]un paiement[^.]{0,120}échoue/i,
  },
  es: {
    noPaymentMethod: /no se exige ningún método de pago para iniciarla/i,
    cardAtSignup: /tarjeta bancaria al registrarse|tarjeta bancaria solicitada al registrarse/i,
    paused: /el servicio se pone en pausa/i,
    noTrialGrace: /no se aplica ningún periodo de tolerancia/i,
    graceHeading: /periodo de tolerancia de 3 días/i,
    graceOnlyForFailedPayment: /periodo de tolerancia de 3 días\*\* solo se aplica cuando falla un pago/i,
  },
  pl: {
    noPaymentMethod: /nie jest wymagana żadna metoda płatności/i,
    cardAtSignup: /wymagane jest podanie karty płatniczej|karta płatnicza podana przy rejestracji/i,
    paused: /usługa zostaje wstrzymana/i,
    noTrialGrace: /nie obowiązuje okres tolerancji/i,
    graceHeading: /3-dniowy okres tolerancji/i,
    graceOnlyForFailedPayment: /3-dniowy okres tolerancji\*\* obowiązuje wyłącznie wtedy, gdy nie powiedzie się płatność/i,
  },
};

const s51 = (locale: string) => termsSection(locale, /^###\s+5\.1\s/m, /^###\s+5\.2\s/m);
const s12 = (locale: string) => termsSection(locale, /^##\s+12\.\s/m, /^##\s+13\.\s/m);

/** The paragraphs of a section, without the review markers. */
const paragraphs = (section: string) =>
  section
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\{\/\*[\s\S]*?\*\/\}/g, "").trim())
    .filter(Boolean);

describe("every market's trial is the one number the terms state", () => {
  it("is a single length", () => {
    expect([...DAYS]).toHaveLength(1);
  });
});

describe.each(routing.locales)("Terms §5.1 free trial (%s)", (locale) => {
  const wording = WORDING[locale];
  const days = [...DAYS][0];

  it("says how long the trial lasts, in the number of days the markets grant", () => {
    expect(s51(locale)).toMatch(new RegExp(`\\b${days}\\s+${DAY_WORD[locale]}\\b`, "i"));
  });

  it("says no payment method is required to start it, and no longer says a card is requested at signup", () => {
    expect(s51(locale)).toMatch(wording.noPaymentMethod);
    expect(s51(locale)).not.toMatch(wording.cardAtSignup);
  });

  it("pauses the service at the end of a trial with no plan, with no grace period", () => {
    expect(s51(locale)).toMatch(wording.paused);
    expect(s51(locale)).toMatch(wording.noTrialGrace);
  });

  it("gives the 3-day grace period to a failed payment of a paid Subscription, and to nothing else", () => {
    const graceParagraphs = paragraphs(s51(locale)).filter((paragraph) => wording.graceHeading.test(paragraph));

    expect(graceParagraphs).toHaveLength(1);
    expect(graceParagraphs[0]).toMatch(wording.graceOnlyForFailedPayment);
  });
});

describe.each(routing.locales)("Terms §12 right of withdrawal (%s)", (locale) => {
  it("does not say a card is requested at signup for the trial", () => {
    expect(s12(locale)).not.toMatch(WORDING[locale].cardAtSignup);
  });
});

describe("the terms render with their review markers", () => {
  it.each(routing.locales)("the terms still compile, and no marker reaches the page (%s)", async (locale) => {
    const legal = getLegalContent("terms", locale)!;
    const html = renderToStaticMarkup(await compileLegalMDX(legal.content));

    expect(html).not.toContain("HARRY REVIEW");
    expect(html).toContain("<h3");
  });
});
