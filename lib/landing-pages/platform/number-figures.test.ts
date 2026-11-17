/**
 * The row of figures under "By the numbers": the two counts Platform takes from the site's catalog, then its own
 * measured figure. The catalog is the homepage's too, so the row finds its counts by position (the same in every
 * language) and never edits it.
 */

import { describe, expect, test } from "bun:test";
import { numbersRow } from "./number-figures";

const CATALOG = [
  { value: "120+", label: "active businesses" },
  { value: "20,000+", label: "stamps issued" },
  { value: "25+", label: "countries" },
];
const MEASURED = [{ value: "95%", text: "card retention rate", source: "Stampeo data: 2,786 cards from 73 businesses" }];

describe("the numbers row", () => {
  test("is the businesses and the countries of the catalog, then the measured figure, without its study line", () => {
    expect(numbersRow(CATALOG, MEASURED)).toEqual([
      { value: "120+", label: "active businesses" },
      { value: "25+", label: "countries" },
      { value: "95%", label: "card retention rate" },
    ]);
  });

  test("finds the counts by position, so a catalog in another language reads the same and the stamps count stays out", () => {
    const french = [
      { value: "+120", label: "commerces actifs" },
      { value: "+20 000", label: "tampons distribués" },
      { value: "+25", label: "pays" },
    ];

    expect(numbersRow(french, MEASURED).map((figure) => figure.label)).toEqual(["commerces actifs", "pays", "card retention rate"]);
  });

  test("fails when the catalog has lost a count, rather than printing a row with a hole", () => {
    expect(() => numbersRow(CATALOG.slice(0, 2), MEASURED)).toThrow(/countries/);
  });
});
