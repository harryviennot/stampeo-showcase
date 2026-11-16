/**
 * `docs/features/STA-552/claims.md` is where each product claim of the previews' copy is traced to its source.
 * The claims a reviewer found with no trace are checked here against the copy and the doc, and a row the doc marks
 * FLAGGED (a claim with no confirmed source) has to be one this file lists with its reason.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { ROOT, read } from "../testing/jsx-source";
import { ALL } from "../testing/landing-copy";

const CLAIMS = read(join(ROOT, "docs", "features", "STA-552", "claims.md"));

/** Each claim a review found untraced: where the copy says it, the words, and the words the doc traces it under. */
const TRACED: Array<[copyPath: string, words: RegExp, inDoc: string]> = [
  ["ANALYTICS_PREVIEW.recap.lead", /weekly digest.*monthly recap/i, "weekly digest"],
  ["ANALYTICS_PREVIEW.recap.facts[1].text", /unsubscribe anytime/i, "unsubscribe"],
  ["GEOLOCATION_PREVIEW.hero.sub", /ready the day it launches/i, "ready the day it launches"],
  ["GEOLOCATION_PREVIEW.faq.items[0].answer", /What's new/, "What's new"],
  ["GEOLOCATION_PREVIEW.faq.items[2].answer", /next update/i, "next update"],
  ["MOBILE_SCANNER_PREVIEW.team.facts[2].text", /name of who made it/i, "name of who made it"],
];

/** The rows the doc may still mark FLAGGED, and why they stay open. */
const OPEN_FLAGS: Record<string, string> = {
  "next update": "the backend documents that a card already in a wallet takes new content at its next fetch, but not that the launch design uses it",
};

describe("the claims the previews' copy makes are traced in claims.md", () => {
  test.each(TRACED)("%s says it, and the doc traces it", (copyPath, words, inDoc) => {
    expect({ copyPath, said: words.test(ALL.find((line) => line.path === copyPath)?.value ?? "") }).toEqual({ copyPath, said: true });
    expect({ inDoc, traced: CLAIMS.toLowerCase().includes(inDoc.toLowerCase()) }).toEqual({ inDoc, traced: true });
  });

  test("every row marked FLAGGED is one the list above gives a reason for, and none of those reasons is out of date", () => {
    const flagged = CLAIMS.split("\n").filter((row) => row.startsWith("|") && row.includes("FLAGGED"));
    const open = Object.keys(OPEN_FLAGS);

    expect(flagged.filter((row) => !open.some((key) => row.toLowerCase().includes(key)))).toEqual([]);
    expect(open.filter((key) => !flagged.some((row) => row.toLowerCase().includes(key)))).toEqual([]);
  });
});
