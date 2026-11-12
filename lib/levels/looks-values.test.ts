import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GOLD_LOOK, LEVEL_LOOKS, SILVER_LOOK } from "./looks";

/**
 * The silver and gold palettes a level's card takes by default are a copy of
 * the backend's (`backend/app/services/programs/levels/skins.py`, `SKINS`),
 * which the showcase cannot import or read. This test pins the copy's values
 * as written here, so a stray edit shows up; it cannot tell that the backend
 * changed, so a change to `SKINS` is made in `looks.ts` and here by hand.
 */
describe("the level looks keep their pinned silver and gold values", () => {
  test("silver is a light brushed metal with near-black text and slate stamps", () => {
    expect(SILVER_LOOK).toEqual({
      background_color: "rgb(212, 216, 222)",
      foreground_color: "rgb(26, 30, 36)",
      label_color: "rgb(62, 68, 80)",
      stamp_filled_color: "rgb(58, 64, 76)",
      stamp_empty_color: "rgb(176, 182, 192)",
      stamp_border_color: "rgb(62, 68, 80)",
      strip_background_color: "rgb(212, 216, 222)",
      icon_color: "rgb(238, 241, 245)",
    });
  });

  test("gold is a warm yellow with dark brown text and deep brown stamps", () => {
    expect(GOLD_LOOK).toEqual({
      background_color: "rgb(204, 160, 52)",
      foreground_color: "rgb(38, 26, 4)",
      label_color: "rgb(74, 52, 10)",
      stamp_filled_color: "rgb(70, 46, 6)",
      stamp_empty_color: "rgb(170, 128, 34)",
      stamp_border_color: "rgb(38, 26, 4)",
      strip_background_color: "rgb(204, 160, 52)",
      icon_color: "rgb(255, 232, 166)",
    });
  });

  test("the file names where the values were copied from", () => {
    const source = readFileSync(join(import.meta.dir, "looks.ts"), "utf8");

    expect(source).toContain("backend/app/services/programs/levels/skins.py");
    expect(Object.keys(LEVEL_LOOKS)).toEqual(["silver", "gold"]);
  });
});
