import { describe, expect, it } from "bun:test";
import { allOpen, toggleAll, toggleRow } from "./open-rows";

const IDS = ["card.where", "languages", "price.entry"];

describe("the rows of the table a reader has opened", () => {
  it("open one row at a time, and close it again", () => {
    const one = toggleRow(new Set(), "languages");
    expect([...one]).toEqual(["languages"]);
    expect([...toggleRow(one, "languages")]).toEqual([]);
  });

  it("leave the set they were given alone, so a render never sees it change underneath", () => {
    const before = new Set(["card.where"]);
    toggleRow(before, "languages");
    expect([...before]).toEqual(["card.where"]);
  });

  it("open every row with the button above the table, whatever was open, and close every row with the next press", () => {
    const everything = toggleAll(new Set(["languages"]), IDS);
    expect([...everything].sort()).toEqual([...IDS].sort());
    expect([...toggleAll(everything, IDS)]).toEqual([]);
  });

  it("read as all open only when every row is, so the button says what its next press does", () => {
    expect(allOpen(new Set(), IDS)).toBe(false);
    expect(allOpen(new Set(["card.where", "languages"]), IDS)).toBe(false);
    expect(allOpen(new Set(IDS), IDS)).toBe(true);
    expect(allOpen(toggleRow(new Set(IDS), "price.entry"), IDS)).toBe(false);
  });

  it("are never all open when there is no row to open", () => {
    expect(allOpen(new Set(), [])).toBe(false);
  });
});
