import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createTranslator } from "next-intl";
import { routing } from "@/i18n/routing";
import {
  PLAN_FACTS,
  TIERS,
  availability,
  planMessageArgs,
  planSummary,
} from "./plan-facts";
import { FEATURE_CATEGORIES } from "./pricing-features";

/**
 * Plan facts are stated once, in `lib/plan-facts.ts`, mirroring
 * backend/app/core/features.py. Copy that cannot read from it (translated
 * meta descriptions and pricing feature lists) is checked against it here.
 */

const MESSAGES = join(import.meta.dir, "..", "messages");
const catalog = (locale: string, file: string) =>
  JSON.parse(readFileSync(join(MESSAGES, locale, file), "utf8"));

describe("plan facts", () => {
  it("match the backend tier definitions", () => {
    expect(PLAN_FACTS).toEqual({
      starter: {
        loyaltyTypes: ["stamps", "points"],
        teamMembers: 2,
        employeeTracking: false,
        broadcastsPerMonth: 0,
        scheduledBroadcasts: false,
        milestoneNotifications: 0,
        multipleLocations: false,
        locationAnalytics: false,
        analytics: "basic",
        scheduledDesigns: false,
        geofencing: false,
      },
      growth: {
        loyaltyTypes: ["stamps", "points"],
        teamMembers: "unlimited",
        employeeTracking: true,
        broadcastsPerMonth: 8,
        scheduledBroadcasts: false,
        milestoneNotifications: 3,
        multipleLocations: false,
        locationAnalytics: false,
        analytics: "basic",
        scheduledDesigns: false,
        geofencing: false,
      },
      pro: {
        loyaltyTypes: ["stamps", "points"],
        teamMembers: "unlimited",
        employeeTracking: true,
        broadcastsPerMonth: "unlimited",
        scheduledBroadcasts: true,
        milestoneNotifications: "unlimited",
        multipleLocations: true,
        locationAnalytics: true,
        analytics: "advanced",
        scheduledDesigns: "coming_soon",
        geofencing: "coming_soon",
      },
    });
  });

  it("summarises each plan in plain English", () => {
    expect(planSummary("starter")).toBe(
      "stamps or points, 2 team members (owner + 1), no broadcasts, single location, basic analytics"
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
  });
});

describe("feature meta descriptions", () => {
  // A literal quota next to a per-month marker, in any of the four locales.
  const LITERAL_MONTHLY_QUOTA =
    /\b\d+\b[^.;{}]{0,20}?(?:\/\s*month|\/\s*mois|per month|a month|par mois|al mes|w miesiącu)/i;

  for (const locale of routing.locales) {
    const features = catalog(locale, "metadata.json").metadata.features as Record<
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
      const t = createTranslator({
        locale,
        messages: catalog(locale, "metadata.json"),
        namespace: "metadata.features",
        onError: (error) => {
          throw error;
        },
      });
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
    const messages = catalog(locale, "pricing.json");
    const page = messages.pricingPage;
    const vocab = VOCAB[locale];

    for (const section of ["pricingPage", "pricing"] as const) {
      const features = (tier: string) => messages[section][tier].features as string[];

      it(`${locale} ${section}: Starter offers points as well as stamps`, () => {
        expect(PLAN_FACTS.starter.loyaltyTypes).toContain("points");
        expect(features("starter").some((item) => vocab.points.test(item))).toBe(true);
      });

      it(`${locale} ${section}: broadcast counts match`, () => {
        expect(PLAN_FACTS.starter.broadcastsPerMonth).toBe(0);
        expect(features("starter").some((item) => vocab.broadcast.test(item))).toBe(false);
        const growth = features("growth").filter((item) => vocab.broadcast.test(item));
        expect(growth).toHaveLength(1);
        expect(growth[0].match(/\d+/g)).toEqual([String(PLAN_FACTS.growth.broadcastsPerMonth)]);
      });

      it(`${locale} ${section}: geofencing reads as coming soon on Pro`, () => {
        expect(PLAN_FACTS.pro.geofencing).toBe("coming_soon");
        const nearby = features("pro").filter((item) => vocab.nearby.test(item));
        expect(nearby).toHaveLength(1);
        expect(nearby[0]).toMatch(new RegExp(page.comparison.soon, "i"));
      });

      it(`${locale} ${section}: scheduling card styles reads as coming soon on Pro`, () => {
        expect(PLAN_FACTS.pro.scheduledDesigns).toBe("coming_soon");
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
    expect(PLAN_FACTS.pro.scheduledDesigns).toBe("coming_soon");
    expect(row).toEqual({ key: "scheduledChanges", starter: "cross", growth: "cross", pro: "soon" });
  });
});
