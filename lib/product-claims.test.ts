import { describe, expect, it } from "bun:test";
import { routing } from "@/i18n/routing";
import { catalogStrings, loadCatalog } from "./testing/catalogs";

/**
 * Wallet passes carry no locations today (`WALLET_LOCATIONS_ENABLED = False`
 * in backend/app/services/pass_generator.py), so nothing on the landing may
 * promise a notification when a customer walks past the shop. The plan facts
 * call geofencing "coming soon"; the landing has to agree.
 */
const LOCATION_CLAIM =
  /\bwalks?\s+(?:past|by)\b|\bpass(?:e|ent)\s+(?:devant\b|à côté)|\bpasan?\s+(?:por delante|al lado)\b|\bprzechodz(?:i|ą)\s+obok\b/i;

describe("location-notification claims", () => {
  it("the guard catches every phrasing that shipped", () => {
    for (const shipped of [
      "A notification when he walks past the shop",
      "Remind them you exist when they walk by.",
      "Une notification quand il passe devant la boutique",
      "Rappelez-leur que vous existez quand ils passent à côté.",
      "Un aviso cuando pasa por delante de la barbería",
      "Recuérdales que existes cuando pasan al lado.",
      "Powiadomienie, kiedy przechodzi obok salonu",
      "Przypomnij o sobie, kiedy przechodzą obok.",
    ]) {
      expect({ shipped, caught: LOCATION_CLAIM.test(shipped) }).toEqual({ shipped, caught: true });
    }
  });

  it("the guard lets ordinary copy through", () => {
    for (const fine of [
      "Card added in one scan, no app to download",
      "Carte ajoutée en un scan, aucune appli à télécharger",
      "Passez à la caisse",
      "Walk-ins welcome",
    ]) {
      expect({ fine, caught: LOCATION_CLAIM.test(fine) }).toEqual({ fine, caught: false });
    }
  });

  it.each(routing.locales)("%s: the landing makes no location-notification claim", (locale) => {
    const offenders = catalogStrings(loadCatalog(locale, "landing.json"))
      .filter(({ text }) => LOCATION_CLAIM.test(text))
      .map(({ where, text }) => `${where}: ${text}`);
    expect(offenders).toEqual([]);
  });
});

describe("feature grid", () => {
  type Tile = { title: string; description: string; link: string; badge?: string };

  it.each(routing.locales)("%s: only the geolocation tile is marked, in the pricing table's word", (locale) => {
    const tiles: Tile[] = loadCatalog(locale, "landing.json").landing.featureGrid.features;
    const soon: string = loadCatalog(locale, "pricing.json").pricingPage.comparison.soon;
    const badged = tiles.filter((tile) => tile.badge !== undefined);

    expect(badged.map((tile) => tile.link)).toEqual([tiles[2].link]);
    expect(tiles[2].link).toMatch(/^\/features\/geolo/);
    expect(tiles[2].badge).toBe(soon);
  });
});
