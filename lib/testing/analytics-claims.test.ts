import { describe, expect, it } from "bun:test";
import { OFF_PICTURE, PER_CUSTOMER, REAL_TIME, plansNamed } from "./analytics-claims";

describe("off-picture rules", () => {
  it.each([
    ["prediction", "Sophie's coming back tomorrow"],
    ["prediction", "She will come back next week."],
    ["prediction", "Sophie revient demain"],
    ["prediction", "Ils reviendront."],
    ["prediction", "Sophie vuelve mañana"],
    ["prediction", "Tu cliente volverá"],
    ["prediction", "Sophie wraca jutro"],
    ["prediction", "Klienci wrócą"],
    ["customerName", "Sophie M. visited today"],
    ["money", "Tracked spend: €1,240"],
    ["money", "Dépenses enregistrées"],
    ["proOnly", "Monthly cohorts"],
    ["proOnly", "Kohorty miesięczne"],
    ["proOnly", "Statystyki dla każdego lokalu"],
    ["proOnly", "Historia z 1 rok"],
    ["export", "Export your data anytime"],
  ] as const)("%s catches %p", (rule, text) => {
    expect(OFF_PICTURE[rule].test(text)).toBe(true);
  });

  it.each([
    ["prediction", "of first-time customers came back"],
    ["prediction", "des nouveaux venus sont revenus"],
    ["customerName", "Screens from the Growth plan. Charts come with Growth and Pro."],
    ["proOnly", "Wizyty w czasie, z historią z 90 dni"],
    ["proOnly", "Krok po kroku"],
  ] as const)("%s leaves %p alone", (rule, text) => {
    expect(OFF_PICTURE[rule].test(text)).toBe(false);
  });
});

describe("real-time and per-customer rules", () => {
  it.each([
    [REAL_TIME, "Real-time dashboard: visits, busiest times"],
    [REAL_TIME, "Tableau de bord en direct"],
    [REAL_TIME, "Panel en tiempo real"],
    [REAL_TIME, "Panel na żywo"],
    [PER_CUSTOMER, "Loyalty Analytics: Who Comes Back, Who Drifts"],
    [PER_CUSTOMER, "qui revient, qui décroche"],
    [PER_CUSTOMER, "quién vuelve y quién se aleja"],
    [PER_CUSTOMER, "kto wraca, a kto nie"],
    [PER_CUSTOMER, "retention, visit frequency, top customers."],
    [PER_CUSTOMER, "Who stopped coming"],
    [PER_CUSTOMER, "Qui a arrêté de venir"],
    [PER_CUSTOMER, "Quién ha dejado de venir"],
    [PER_CUSTOMER, "Kto przestał przychodzić"],
    [PER_CUSTOMER, "Know your regulars. Not just by sight."],
    [PER_CUSTOMER, "Connaissez vos habitués. Pas juste de vue."],
    [PER_CUSTOMER, "Conoce a tus habituales. No solo de vista."],
    [PER_CUSTOMER, "Poznaj swoich stałych klientów. Nie tylko z widzenia."],
  ])("%p catches %p", (rule, text) => {
    expect(rule.test(text)).toBe(true);
  });

  it.each([
    [REAL_TIME, "Updated every few minutes from every scan"],
    [REAL_TIME, "Delivered to their lock screen"],
    [PER_CUSTOMER, "How many customers came back within 30 days"],
  ])("%p leaves %p alone", (rule, text) => {
    expect(rule.test(text)).toBe(false);
  });
});

describe("plansNamed", () => {
  it("lists the plans a line names, in the order it names them", () => {
    expect(plansNamed("Charts come with Growth and Pro.")).toEqual(["growth", "pro"]);
    expect(plansNamed("Starter shows a sentence; Pro and Growth the grid")).toEqual(["starter", "pro", "growth"]);
    expect(plansNamed("Produit, Programme, Promo")).toEqual([]);
  });
});
