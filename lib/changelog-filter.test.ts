import { describe, expect, it } from "bun:test";
import {
  filterReleasesByArea,
  type ChangelogItem,
  type ChangelogRelease,
} from "./changelog";

function item(id: string, area: string | null): ChangelogItem {
  return {
    id,
    category: "feature",
    area,
    affects: ["owner"],
    title_fr: `Titre ${id}`,
    title_en: null,
    title_es: null,
    title_pl: null,
    body_fr: null,
    body_en: null,
    body_es: null,
    body_pl: null,
    sort_order: 0,
  };
}

function release(id: string, items: ChangelogItem[]): ChangelogRelease {
  return {
    id,
    version: null,
    title_fr: `Version ${id}`,
    title_en: null,
    title_es: null,
    title_pl: null,
    body_fr: null,
    body_en: null,
    body_es: null,
    body_pl: null,
    image_url_fr: null,
    image_url_en: null,
    image_url_es: null,
    image_url_pl: null,
    published_at: "2026-08-01T00:00:00Z",
    changelog_items: items,
  };
}

const RELEASES: ChangelogRelease[] = [
  release("r1", [item("a", "wallet"), item("b", "billing")]),
  release("r2", [item("c", "billing"), item("d", null)]),
  release("r3", [item("e", "wallet")]),
];

describe("filterReleasesByArea", () => {
  it("returns releases untouched when no area is selected", () => {
    expect(filterReleasesByArea(RELEASES, undefined)).toBe(RELEASES);
  });

  it("keeps only items of the selected area and drops emptied releases", () => {
    const out = filterReleasesByArea(RELEASES, "billing");
    expect(out.map((r) => r.id)).toEqual(["r1", "r2"]);
    expect(out[0].changelog_items.map((i) => i.id)).toEqual(["b"]);
    expect(out[1].changelog_items.map((i) => i.id)).toEqual(["c"]);
  });

  it("returns an empty list when no release has the area", () => {
    expect(filterReleasesByArea(RELEASES, "scanner")).toEqual([]);
  });

  it("does not match items with a null area", () => {
    const out = filterReleasesByArea(RELEASES, "wallet");
    expect(out.map((r) => r.id)).toEqual(["r1", "r3"]);
  });

  it("does not mutate the input releases", () => {
    filterReleasesByArea(RELEASES, "billing");
    expect(RELEASES[0].changelog_items).toHaveLength(2);
  });
});
