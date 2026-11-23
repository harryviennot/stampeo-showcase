import { describe, expect, it } from "bun:test";
import { statSync } from "node:fs";
import { join } from "node:path";

import { SECTOR_THEMES } from "@/components/landing-variant/sector-themes";
import {
  FAN_ARC_RADIUS_PCT,
  FAN_CARDS,
  FAN_SLOTS,
  HERO_FAN_SEASON,
  PLATFORM_FAN_CARDS,
  PLATFORM_FAN_SLOTS,
  fanSlots,
  platformFanSlots,
  resolveFanCard,
  slotStyle,
  type FanSeason,
  type FanTier,
} from "./hero-fan";
import {
  CHRISTMAS_POINTS_SAMPLES,
  CHRISTMAS_STAMP_SAMPLES,
} from "./christmas-samples";
import {
  HALLOWEEN_POINTS_SAMPLES,
  HALLOWEEN_STAMP_SAMPLES,
} from "./halloween-samples";
import { POINTS_SAMPLES, STAMP_SAMPLES } from "./loyalty-samples";

const TIERS: FanTier[] = ["sm", "md", "lg"];

const slot = (index: number) => {
  const found = FAN_SLOTS.find((s) => s.index === index);
  if (!found) throw new Error(`missing slot ${index}`);
  return found;
};

describe("FAN_SLOTS shape", () => {
  it("has 7 slots with unique indexes -3..3", () => {
    expect(FAN_SLOTS).toHaveLength(7);
    const indexes = FAN_SLOTS.map((s) => s.index).sort((a, b) => a - b);
    expect(indexes).toEqual([-3, -2, -1, 0, 1, 2, 3]);
  });

  it("references distinct cards that all exist in the sample banks", () => {
    const ids = FAN_SLOTS.map((s) => s.cardId);
    expect(new Set(ids).size).toBe(ids.length);
    const known = new Set(
      [
        ...STAMP_SAMPLES,
        ...POINTS_SAMPLES,
        ...HALLOWEEN_STAMP_SAMPLES,
        ...HALLOWEEN_POINTS_SAMPLES,
        ...CHRISTMAS_STAMP_SAMPLES,
        ...CHRISTMAS_POINTS_SAMPLES,
      ].map((s) => s.id),
    );
    for (const id of ids) expect(known.has(id)).toBe(true);
  });

  it("steps visibility 3 → 5 → 7 cards via sm/lg breakpoints", () => {
    for (const s of FAN_SLOTS) {
      const abs = Math.abs(s.index);
      if (abs <= 1) expect(s.visibility).toBe("");
      if (abs === 2) expect(s.visibility).toBe("hidden sm:block");
      if (abs === 3) expect(s.visibility).toBe("hidden lg:block");
    }
  });
});

describe("arc symmetry", () => {
  it("mirror pairs are symmetric in every tier", () => {
    for (const i of [1, 2, 3]) {
      const left = slot(-i);
      const right = slot(i);
      for (const tier of TIERS) {
        // Card centers mirror around the strip's midline.
        expect(left.x[tier] + right.x[tier]).toBeCloseTo(100);
        expect(left.r[tier]).toBeCloseTo(-right.r[tier]);
        expect(left.y[tier]).toBe(right.y[tier]);
        expect(left.width[tier]).toBe(right.width[tier]);
      }
      expect(left.z).toBe(right.z);
      expect(left.delayMs).toBe(right.delayMs);
      expect(left.driftX).toBeCloseTo(-right.driftX);
      expect(left.driftY).toBe(right.driftY);
      expect(left.driftR).toBeCloseTo(-right.driftR);
    }
  });

  it("the apex card is upright, centered and still", () => {
    const apex = slot(0);
    for (const tier of TIERS) {
      expect(apex.x[tier]).toBe(50);
      expect(apex.y[tier]).toBe(0);
      expect(apex.r[tier]).toBe(0);
    }
    expect(apex.delayMs).toBe(0);
    expect(apex.driftX).toBe(0);
    expect(apex.driftR).toBe(0);
  });

  it("right-side cards lean and drift outward (positive), like DesignTeaser", () => {
    for (const i of [1, 2, 3]) {
      const right = slot(i);
      for (const tier of TIERS) expect(right.r[tier]).toBeGreaterThan(0);
      expect(right.driftX).toBeGreaterThan(0);
      expect(right.driftR).toBeGreaterThan(0);
    }
  });
});

describe("the cards sit on a circle", () => {
  // offset = R sin0, drop = R (1 - cos0), lean = 0. Equivalently
  // drop = offset * tan(lean / 2). Tuning offset, drop and lean apart from one
  // another is what stops an arch reading as an arch, so it is asserted rather
  // than eyeballed.
  it("places every slot where its own lean says it belongs", () => {
    for (const tier of TIERS) {
      const radius = FAN_ARC_RADIUS_PCT[tier];
      for (const s of FAN_SLOTS) {
        if (s.index === 0) continue;
        const lean = (Math.abs(s.r[tier]) * Math.PI) / 180;
        const offset = Math.abs(s.x[tier] - 50);
        // Both axes are percentages of the same width, so the circle is
        // checked in pure proportions — no viewport involved.
        expect(offset).toBeCloseTo(radius * Math.sin(lean), 0);
        expect(s.y[tier]).toBeCloseTo(radius * (1 - Math.cos(lean)), 0);
        expect(s.y[tier]).toBeCloseTo(offset * Math.tan(lean / 2), 0);
      }
    }
  });
});

describe("arc ordering, center-out", () => {
  it("rotation and drop increase strictly, per tier", () => {
    for (const tier of TIERS) {
      for (const i of [1, 2, 3]) {
        const outer = slot(i);
        const inner = slot(i - 1);
        expect(Math.abs(outer.r[tier])).toBeGreaterThan(
          Math.abs(inner.r[tier]),
        );
        expect(outer.y[tier]).toBeGreaterThan(inner.y[tier]);
      }
    }
  });

  it("outer cards stack under inner cards and deal later", () => {
    for (const i of [1, 2, 3]) {
      expect(slot(i).z).toBeLessThan(slot(i - 1).z);
      expect(slot(i).delayMs).toBeGreaterThan(slot(i - 1).delayMs);
    }
  });

  it("parallax drift magnitude grows outward", () => {
    for (const i of [1, 2, 3]) {
      expect(Math.abs(slot(i).driftX)).toBeGreaterThan(
        Math.abs(slot(i - 1).driftX),
      );
      expect(slot(i).driftY).toBeGreaterThan(slot(i - 1).driftY);
    }
  });

  it("stays far below the fixed header's z-50", () => {
    for (const s of FAN_SLOTS) expect(s.z).toBeLessThan(50);
  });
});

describe("slotStyle", () => {
  it("emits every tier variable plus z, delay and drift vars", () => {
    for (const s of FAN_SLOTS) {
      const style = slotStyle(s) as Record<string, string | number>;
      for (const tier of TIERS) {
        expect(style[`--fan-x-${tier}`]).toBeDefined();
        expect(style[`--fan-y-${tier}`]).toBeDefined();
        expect(style[`--fan-r-${tier}`]).toBeDefined();
        expect(style[`--fan-w-${tier}`]).toBeDefined();
      }
      expect(style["--fan-z"]).toBe(s.z);
      expect(style["--fan-delay"]).toBe(`${s.delayMs}ms`);
      expect(style["--fan-dx"]).toBe(`${s.driftX}px`);
      expect(style["--fan-dy"]).toBe(`${s.driftY}px`);
      expect(style["--fan-dr"]).toBe(`${s.driftR}deg`);
    }
  });
});

describe("resolveFanCard", () => {
  it("resolves every slot to a typed sample", () => {
    for (const s of FAN_SLOTS) {
      const card = resolveFanCard(s.cardId);
      expect(card.sample.id).toBe(s.cardId);
      if (card.kind === "stamps") {
        expect(card.sample.stamps).toBeGreaterThan(0);
      } else {
        expect(card.sample.pointsRewards.length).toBeGreaterThan(0);
      }
    }
  });

  it("throws on an unknown id", () => {
    expect(() => resolveFanCard("not-a-brand")).toThrow();
  });
});

describe("seasons", () => {
  const SEASONS = Object.keys(FAN_CARDS) as FanSeason[];

  it("gives every season a distinct card for each of the seven slots", () => {
    for (const season of SEASONS) {
      const cards = FAN_CARDS[season];
      const ids = [-3, -2, -1, 0, 1, 2, 3].map((i) => cards[i]);
      expect(ids.every(Boolean)).toBe(true);
      expect(new Set(ids).size).toBe(7);
      for (const id of ids) expect(() => resolveFanCard(id)).not.toThrow();
    }
  });

  it("keeps a stamp card and a points card among the three a phone shows", () => {
    for (const season of SEASONS) {
      const kinds = new Set(
        fanSlots(season)
          .filter((s) => Math.abs(s.index) <= 1)
          .map((s) => resolveFanCard(s.cardId).kind),
      );
      expect(kinds).toEqual(new Set(["stamps", "points"]));
    }
  });

  it("changes only the cards, never where they sit", () => {
    const places = (season: FanSeason) =>
      fanSlots(season).map((s) => ({ ...s, cardId: "" }));
    for (const season of SEASONS) expect(places(season)).toEqual(places("default"));
  });

  it("keeps the loudest Halloween card, Pumpkin Night, at the edge", () => {
    const slots = fanSlots("halloween");
    const pumpkin = slots.find((s) => s.cardId === "halloween-pumpkin-night");
    expect(Math.abs(pumpkin?.index ?? 0)).toBe(3);
  });

  it("shows the season the config names", () => {
    expect(FAN_SLOTS).toEqual(fanSlots(HERO_FAN_SEASON));
  });

  it("keeps the loudest Christmas card, Candy Cane's solid red, at the edge", () => {
    const candy = fanSlots("christmas").find((s) => s.cardId === "christmas-candy-cane");
    expect(Math.abs(candy?.index ?? 0)).toBe(3);
  });

  // The season is a manual switch that only changes on deploy; this catches a
  // seasonal set still live after its season: Halloween outside October,
  // Christmas outside 15 November to 31 December.
  it("shows a seasonal set only while its season runs", () => {
    const now = new Date();
    const month = now.getMonth();
    const inChristmas = month === 11 || (month === 10 && now.getDate() >= 15);
    const live: Record<FanSeason, boolean> = {
      default: true,
      halloween: month === 9,
      christmas: inChristmas,
    };
    expect(live[HERO_FAN_SEASON]).toBe(true);
  });
});

describe("cards from the sector brands", () => {
  // The brands drawn for the sector carousel, which the samples don't carry.
  const SECTOR_ONLY = ["fournee", "lashwell", "harvest-row", "rolling-slice", "saltmoss", "smash-club"];

  it.each(SECTOR_ONLY)("%s resolves to its own card, on its own engine, with its own logo", (id) => {
    const theme = SECTOR_THEMES.find((t) => t.id === id);
    const card = resolveFanCard(id);

    expect(card.kind).toBe(theme?.engine === "points" ? "points" : "stamps");
    expect(card.sample.design.logo_url).toBe(theme?.walletLogoUrl);
    if (card.kind === "stamps") expect(card.sample.stamps).toBe(theme?.walletFilled ?? -1);
    else expect(card.sample.pointsBalance).toBe(theme?.pointsBalance ?? -1);
  });

  it("the barbershop wears one logo on its sample card, its sector slide and its Halloween card", () => {
    const logo = STAMP_SAMPLES.find((s) => s.id === "barber")?.design.logo_url;

    expect(logo).toBeTruthy();
    expect(SECTOR_THEMES.find((t) => t.id === "barber")?.walletLogoUrl).toBe(logo);
    expect(HALLOWEEN_STAMP_SAMPLES.find((s) => s.id === "halloween-pumpkin-night")?.design.logo_url).toBe(logo);
  });

  it("the barbershop's logo is 60 KB at most", () => {
    const logo = STAMP_SAMPLES.find((s) => s.id === "barber")?.design.logo_url ?? "-";

    expect(statSync(join(import.meta.dir, "..", "public", logo)).size).toBeLessThanOrEqual(60_000);
  });

  it("a brand both banks know resolves to the sample, as the homepage fan always drew it", () => {
    for (const id of ["aurevo", "marginalia"]) {
      const sample = [...STAMP_SAMPLES, ...POINTS_SAMPLES].find((s) => s.id === id);
      expect(resolveFanCard(id).sample.design).toBe(sample?.design ?? {});
    }
  });
});

describe("the Platform page's cards", () => {
  const SEASONS = Object.keys(FAN_CARDS) as FanSeason[];
  const places = (slots: typeof FAN_SLOTS) => slots.map((s) => ({ ...s, cardId: "" }));

  it("sit in the homepage fan's seven places in every season", () => {
    for (const season of SEASONS) expect(places(platformFanSlots(season))).toEqual(places(FAN_SLOTS));
  });

  it("are the year-round Platform set in the default season, Aurevo, the pages' sample café, at the apex", () => {
    const slots = platformFanSlots("default");

    expect(slots.map((s) => s.cardId)).toEqual([-3, -2, -1, 0, 1, 2, 3].map((i) => PLATFORM_FAN_CARDS[i]));
    expect(slots.find((s) => s.index === 0)?.cardId).toBe("aurevo");
  });

  it("deal the season's own cards in any other season, Little Santas at the apex at Christmas", () => {
    for (const season of SEASONS.filter((s) => s !== "default")) {
      expect(platformFanSlots(season).map((s) => s.cardId)).toEqual(fanSlots(season).map((s) => s.cardId));
    }
    expect(platformFanSlots("christmas").find((s) => s.index === 0)?.cardId).toBe("christmas-little-santas");
  });

  it("are seven different shops in every season, and the middle three mix stamps and points", () => {
    const kinds = (slots: typeof FAN_SLOTS) => new Set(slots.map((s) => resolveFanCard(s.cardId).kind));

    for (const season of SEASONS) {
      const slots = platformFanSlots(season);
      const logos = slots.map((s) => resolveFanCard(s.cardId).sample.design.logo_url);

      expect(new Set(logos).size).toBe(7);
      expect(kinds(slots.filter((s) => Math.abs(s.index) <= 1))).toEqual(new Set(["stamps", "points"]));
    }
  });

  it("show the season the config names", () => {
    expect(PLATFORM_FAN_SLOTS).toEqual(platformFanSlots(HERO_FAN_SEASON));
  });
});
