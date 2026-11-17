import { describe, expect, it } from "bun:test";

import { SECTOR_THEMES } from "@/components/landing-variant/sector-themes";
import {
  FAN_ARC_RADIUS_PCT,
  FAN_CARDS,
  FAN_SLOTS,
  HERO_FAN_SEASON,
  PLATFORM_FAN_SLOTS,
  fanSlots,
  resolveFanCard,
  slotStyle,
  type FanSeason,
  type FanTier,
} from "./hero-fan";
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

  // The season is a manual switch that only changes on deploy; this catches a
  // Halloween set still live in November.
  it.skipIf(new Date().getMonth() === 9)("outside October, the hero shows the year-round cards", () => {
    expect(HERO_FAN_SEASON).toBe("default");
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

  it("a brand both banks know resolves to the sample, as the homepage fan always drew it", () => {
    for (const id of ["aurevo", "marginalia"]) {
      const sample = [...STAMP_SAMPLES, ...POINTS_SAMPLES].find((s) => s.id === id);
      expect(resolveFanCard(id).sample.design).toBe(sample?.design ?? {});
    }
  });
});

describe("the Platform page's cards", () => {
  const BARBER_LOGO = STAMP_SAMPLES.find((s) => s.id === "barber")?.design.logo_url;

  it("sit in the homepage fan's seven places, Aurevo, the pages' sample café, at the apex", () => {
    const places = (slots: typeof FAN_SLOTS) => slots.map((s) => ({ ...s, cardId: "" }));

    expect(places(PLATFORM_FAN_SLOTS)).toEqual(places(FAN_SLOTS));
    expect(PLATFORM_FAN_SLOTS.find((s) => s.index === 0)?.cardId).toBe("aurevo");
  });

  it("are seven different shops, and the middle three mix stamps and points", () => {
    const ids = PLATFORM_FAN_SLOTS.map((s) => s.cardId);
    const kinds = (slots: typeof FAN_SLOTS) => new Set(slots.map((s) => resolveFanCard(s.cardId).kind));

    expect(new Set(ids).size).toBe(7);
    expect(kinds(PLATFORM_FAN_SLOTS.filter((s) => Math.abs(s.index) <= 1))).toEqual(new Set(["stamps", "points"]));
  });

  it("never show the barbershop, whose name and logo belong to a real shop", () => {
    expect(BARBER_LOGO).toBeDefined();
    for (const s of PLATFORM_FAN_SLOTS) {
      expect(s.cardId).not.toBe("barber");
      expect(resolveFanCard(s.cardId).sample.design.logo_url).not.toBe(BARBER_LOGO);
    }
  });
});
