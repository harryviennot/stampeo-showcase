/**
 * Stampeo's side of every comparison: one value per standard table row, plus
 * the inline facts a page can cite as `<Fact id="stampeo.…" />`.
 *
 * Plan limits come from `lib/plans/plan-facts.ts`, prices from the live plan
 * catalog in the market's currency (the baked ladder when the backend is
 * unreachable, as /pricing does), the trial length from `lib/markets.ts`, the
 * languages from `i18n/routing.ts`. Values are plain text in the market's
 * language, worded from STAMPEO.md (`stampeo-seo/stampeo seo fr/STAMPEO.md`,
 * outside this repo).
 */

import { routing } from "../../i18n/routing";
import { getPlanCatalog } from "../plan-catalog";
import { MARKETS } from "../markets";
import { PLAN_FACTS, PLAN_NAMES, TIERS, tiersWhere, type PlanFacts } from "../plans/plan-facts";
import { formatMoney, type Pricing, type TierId } from "../pricing";
import { MARKET_LOCALE, NBSP, languageList } from "./page/format";
import { pageSetup } from "./page/setup";
import type { Market, StandardFactId } from "./types";

/** Facts a page cites by id: monthly prices, the trial, and the plan numbers pages quote in prose. */
export const STAMPEO_FACT_IDS = [
  "stampeo.price.starter",
  "stampeo.price.growth",
  "stampeo.price.pro",
  "stampeo.trial",
  "stampeo.broadcasts.growth",
  "stampeo.team.starter",
  "stampeo.levels",
] as const;

export type StampeoFactId = (typeof STAMPEO_FACT_IDS)[number];

export function isStampeoFactId(id: string): id is StampeoFactId {
  return (STAMPEO_FACT_IDS as readonly string[]).includes(id);
}

export interface StampeoColumn {
  market: Market;
  /** Lower-case currency code of the prices: `usd` or `eur`. */
  currency: string;
  /** Stampeo's cell for each standard table row. */
  rows: Record<StandardFactId, string>;
  /** The values behind `<Fact id="stampeo.…" />`. */
  facts: Record<StampeoFactId, string>;
}

// The most levels a ladder can have: backend/app/services/programs/levels/core.py `MAX_LEVELS`.
const MAX_LEVELS = 5;

interface Copy {
  /** Rows that do not depend on plan limits, prices, the trial or the languages. */
  fixed: Pick<
    Record<StandardFactId, string>,
    "card.where" | "customer.app_required" | "staff.scanning" | "pos.integration" | "commitment" | "export" | "designer"
  >;
  /** The automatic notifications, given the plans that add milestone messages. */
  pushAutomatic: (milestonePlans: string) => string;
  /** The languages row, given the languages' names. */
  languages: (names: string) => string;
  /** The word that joins the last two items of a list. */
  and: string;
  programTypes: (plans: string) => string;
  /** One clause per plan, cheapest first, for the promotional-message allowance. */
  broadcasts: (plan: string, facts: PlanFacts) => string;
  multipleLocations: (plans: string) => string;
  /** "every plan" / "Growth and Pro", from the plan facts. */
  plans: (names: string[], all: boolean) => string;
  price: (amount: string) => string;
  priceEntry: (plan: string, price: string) => string;
  trial: (days: number) => string;
}

const EN: Copy = {
  fixed: {
    "card.where": "Apple Wallet and Google Wallet, on the customer's phone",
    "customer.app_required": "None: no app to download and no account to create",
    "staff.scanning":
      "The Stampeo Scanner app on iPhone and Android, with a connection required (offline scanning isn't available yet)",
    "pos.integration": "None: staff add stamps or points by hand in the Scanner app",
    commitment:
      "None: no setup fee, pay monthly or yearly and cancel any time. A canceled plan stays active until the end of the paid period",
    export: "The customer list as a CSV file with sign-up details (not stamps or points), on every plan, owner only",
    designer: "Self-service card designer with a live Apple Wallet and Google Wallet preview, on every plan",
  },
  pushAutomatic: (milestonePlans) =>
    `Yes, on every stamp, reward and level-up, on the lock screen (Apple Wallet and Google Wallet), plus milestone messages on ${milestonePlans}`,
  languages: (names) =>
    `${names}: dashboard, Scanner app, card and notifications; each customer's card follows their phone's language`,
  and: "and",
  programTypes: (plans) =>
    `Stamps or points on ${plans}, with optional loyalty levels (up to ${MAX_LEVELS}), each of which can have its own card look`,
  broadcasts: (plan, facts) => {
    const { broadcastsPerMonth: limit } = facts;
    if (limit === 0) return `${plan}: none`;
    if (limit === "unlimited") {
      return `${plan}: unlimited${facts.scheduledBroadcasts ? ", scheduled, with targeting by balance, activity and location" : ""}`;
    }
    return `${plan}: up to ${limit} a month${facts.scheduledBroadcasts ? "" : ", sent right away"}`;
  },
  multipleLocations: (plans) =>
    `On ${plans}: several locations, with stats and sign-up links for each, no cap and no extra charge per location`,
  plans: (names, all) => (all ? "every plan" : names.join(" and ")),
  price: (amount) => `${amount} a month`,
  priceEntry: (plan, price) => `${plan}, ${price}`,
  trial: (days) => `${days}-day free trial`,
};

const FR: Copy = {
  fixed: {
    "card.where": "Dans Apple Wallet ou Google Wallet, sur le téléphone du client",
    "customer.app_required": `Aucune${NBSP}: ni application à télécharger, ni compte à créer`,
    "staff.scanning":
      "L'application Scanner Stampeo sur iPhone et Android, avec une connexion nécessaire (le scan hors ligne n'est pas encore disponible)",
    "pos.integration": `Aucune${NBSP}: l'équipe ajoute les tampons ou les points à la main dans l'application Scanner`,
    commitment: `Aucun${NBSP}: sans frais de mise en service, paiement mensuel ou annuel, résiliable à tout moment. Un plan résilié reste actif jusqu'à la fin de la période payée`,
    export: "La liste des clients en fichier CSV, avec les informations d'inscription (sans tampons ni points), sur tous les plans (réservé au propriétaire)",
    designer: "Éditeur de carte en libre-service, avec un aperçu en direct de la carte dans Apple Wallet et Google Wallet, sur tous les plans",
  },
  pushAutomatic: (milestonePlans) =>
    `Oui, à chaque tampon ou point ajouté, chaque récompense et chaque changement de niveau, sur l'écran de verrouillage (Apple Wallet et Google Wallet), plus des messages de palier avec ${milestonePlans}`,
  languages: (names) =>
    `${names}${NBSP}: tableau de bord, application Scanner, carte et notifications${NBSP}; la carte suit la langue du téléphone du client`,
  and: "et",
  programTypes: (plans) =>
    `Tampons ou points sur ${plans}, avec des niveaux de fidélité en option (jusqu'à ${MAX_LEVELS}), chacun pouvant avoir sa propre apparence de carte`,
  broadcasts: (plan, facts) => {
    const { broadcastsPerMonth: limit } = facts;
    if (limit === 0) return `${plan}${NBSP}: aucune diffusion`;
    if (limit === "unlimited") {
      return `${plan}${NBSP}: illimitées${facts.scheduledBroadcasts ? ", programmables, avec ciblage par solde, activité et établissement" : ""}`;
    }
    return `${plan}${NBSP}: jusqu'à ${limit} diffusions par mois${facts.scheduledBroadcasts ? "" : ", envoyées tout de suite"}`;
  },
  multipleLocations: (plans) =>
    `Avec ${plans}${NBSP}: plusieurs établissements, avec statistiques et lien d'inscription pour chacun, sans plafond ni supplément par établissement`,
  plans: (names, all) => (all ? "tous les plans" : names.join(" et ")),
  price: (amount) => `${amount} par mois, TVA non applicable`,
  priceEntry: (plan, price) => `${plan}, ${price}`,
  trial: (days) => `essai gratuit de ${days} jours`,
};

const STAMPEO_COPY: Record<Market, Copy> = { us: EN, fr: FR };

const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** A plan limit written into prose: it must be a number, not "unlimited". */
function quotedNumber(limit: number | "unlimited"): string {
  if (limit === "unlimited") throw new Error("An unlimited plan limit cannot be quoted as a number");
  return String(limit);
}

/** Stampeo's column for a market, from a plan catalog already in that market's currency. */
export function buildStampeoColumn(market: Market, pricing: Pricing): StampeoColumn {
  const copy = STAMPEO_COPY[market];
  const money = (tier: TierId) => formatMoney(pricing.tiers[tier].month, pricing.currency, MARKET_LOCALE[market]);
  const plansWhere = (has: (facts: PlanFacts) => boolean) => {
    const tiers = tiersWhere(has);
    return copy.plans(tiers.map((tier) => PLAN_NAMES[tier]), tiers.length === TIERS.length);
  };

  const trial = copy.trial(MARKETS[pageSetup(market).siteMarket].trialDays);
  const facts: StampeoColumn["facts"] = {
    "stampeo.price.starter": copy.price(money("starter")),
    "stampeo.price.growth": copy.price(money("growth")),
    "stampeo.price.pro": copy.price(money("pro")),
    "stampeo.trial": trial,
    "stampeo.broadcasts.growth": quotedNumber(PLAN_FACTS.growth.broadcastsPerMonth),
    "stampeo.team.starter": quotedNumber(PLAN_FACTS.starter.teamMembers),
    "stampeo.levels": String(MAX_LEVELS),
  };

  const cheapest = TIERS[0];
  const rows: StampeoColumn["rows"] = {
    ...copy.fixed,
    "push.automatic": copy.pushAutomatic(plansWhere((plan) => plan.milestoneNotifications !== 0)),
    languages: copy.languages(languageList(market, routing.locales, copy.and)),
    "program.types": copy.programTypes(plansWhere((plan) => plan.loyaltyTypes.length > 1)),
    "push.broadcasts": TIERS.map((tier) => copy.broadcasts(PLAN_NAMES[tier], PLAN_FACTS[tier])).join(". "),
    "locations.multiple": copy.multipleLocations(plansWhere((plan) => plan.multipleLocations)),
    "price.entry": copy.priceEntry(PLAN_NAMES[cheapest], facts[`stampeo.price.${cheapest}`]),
    trial: upperFirst(trial),
  };

  return { market, currency: pricing.currency.toLowerCase(), rows, facts };
}

/** Stampeo's column for a market, priced from the live catalog in the market's currency. */
export async function getStampeoColumn(market: Market): Promise<StampeoColumn> {
  return buildStampeoColumn(market, await getPlanCatalog(pageSetup(market).currency));
}
