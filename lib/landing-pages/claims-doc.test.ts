/**
 * `docs/features/STA-552/claims.md` is where each product claim of the previews' copy is traced to its source.
 * The claims a reviewer found with no trace are checked here against the copy and the doc, and each claim the doc
 * marks FLAGGED (no confirmed source) has to be one this file lists with its reason and that the copy still makes.
 */

import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { ROOT, read } from "../testing/jsx-source";
import { ALL } from "../testing/landing-copy";

const CLAIMS = read(join(ROOT, "docs", "features", "STA-552", "claims.md"));

const line = (copyPath: string) => ALL.find((candidate) => candidate.path === copyPath)?.value ?? "";

/** Each claim a review found untraced: where the copy says it, the words, and the words the doc traces it under. */
const TRACED: Array<[copyPath: string, words: RegExp, inDoc: string]> = [
  ["GEOLOCATION_PREVIEW.band.sub", /ready when geolocation launches/i, "ready when geolocation launches"],
  ["GEOLOCATION_PREVIEW.faq.items[0].answer", /What's new/, "What's new"],
];

/** The claims the doc marks FLAGGED: where the copy says each, in which words, the words the doc flags it under, and why it stays open. */
const OPEN_FLAGS: Array<{ inDoc: string; copyPath: string; words: RegExp; why: string }> = [
  { inDoc: "joined in the last month", copyPath: "PROMOTIONAL_CAMPAIGNS_PREVIEW.ideas.rows[3].body", words: /joined in the last month/, why: "join-date targeting on every plan rests on STA-549 and the pricing page; STAMPEO.md still says Starter has no campaigns" },
  { inDoc: "Removed the card", copyPath: "PROMOTIONAL_CAMPAIGNS_PREVIEW.delivery.metrics[3].label", words: /Removed the card/, why: "the dashboard's own wording, not in STAMPEO.md" },
  { inDoc: "check the distance itself", copyPath: "GEOLOCATION_PREVIEW.privacy.facts[0].text", words: /check the distance itself/, why: "from the live geolocation page and the pass generator, not STAMPEO.md" },
  { inDoc: "never receive their location", copyPath: "GEOLOCATION_PREVIEW.privacy.facts[1].text", words: /never receive their location/, why: "from the live geolocation page, not STAMPEO.md" },
  { inDoc: "turn it off in their phone's settings", copyPath: "GEOLOCATION_PREVIEW.privacy.facts[2].text", words: /turn it off in their phone's settings/, why: "from the live geolocation page, not STAMPEO.md" },
  { inDoc: "next update", copyPath: "GEOLOCATION_PREVIEW.faq.items[1].answer", words: /next update/i, why: "the backend documents that a card already in a wallet takes new content at its next fetch, but not that the launch design uses it" },
  { inDoc: "A laptop runs the web scanner", copyPath: "MOBILE_SCANNER_PREVIEW.ways.cells[1].devices[2]", words: /^Laptop$/, why: "Harry's statement of 16 Nov 2026; STAMPEO.md says a phone or a tablet" },
  { inDoc: "first visits and returning customers", copyPath: "ANALYTICS_PREVIEW.charts.rows[0].line", words: /first visits and returning customers/, why: "the dashboard's legend, not STAMPEO.md" },
  { inDoc: "quietest open hour", copyPath: "ANALYTICS_PREVIEW.charts.rows[3].line", words: /quietest open hour/, why: "the dashboard's own words, not STAMPEO.md" },
  { inDoc: "about once a month, or came once", copyPath: "ANALYTICS_PREVIEW.charts.rows[4].line", words: /about once a month, or came once/, why: "the dashboard's frequency buckets, not STAMPEO.md" },
  { inDoc: "What each customer group means", copyPath: "ANALYTICS_PREVIEW.customers.segments[0].definition", words: /joined in the last two weeks/, why: "the dashboard's segment help, not STAMPEO.md, which names the segments only" },
  { inDoc: "searchable by name", copyPath: "CARD_DESIGN_PREVIEW.icons.facts[0]", words: /searchable by name/, why: "the live card design page's line, not STAMPEO.md" },
  { inDoc: "every card already in a wallet updates", copyPath: "CARD_DESIGN_PREVIEW.wallets.cells[2].body", words: /every card already in a wallet updates/, why: "the live card design page's FAQ, not STAMPEO.md" },
];

describe("the claims the previews' copy makes are traced in claims.md", () => {
  test.each(TRACED)("%s says it, and the doc traces it", (copyPath, words, inDoc) => {
    expect({ copyPath, said: words.test(line(copyPath)) }).toEqual({ copyPath, said: true });
    expect({ inDoc, traced: CLAIMS.toLowerCase().includes(inDoc.toLowerCase()) }).toEqual({ inDoc, traced: true });
  });
});

describe("the claims marked FLAGGED have no confirmed source, and each is listed here with its reason (the `why` of each entry)", () => {
  const flagged = CLAIMS.split("\n").filter((row) => row.startsWith("|") && row.includes("FLAGGED"));
  const rowFor = (inDoc: string) => flagged.find((row) => row.toLowerCase().includes(inDoc.toLowerCase()));

  test("every FLAGGED row of the doc is one this list gives a reason for", () => {
    expect(flagged.filter((row) => !OPEN_FLAGS.some(({ inDoc }) => row.toLowerCase().includes(inDoc.toLowerCase())))).toEqual([]);
  });

  test.each(OPEN_FLAGS)("$inDoc: still flagged in the doc, and still said by the copy", ({ inDoc, copyPath, words }) => {
    expect({ inDoc, flagged: rowFor(inDoc) !== undefined }).toEqual({ inDoc, flagged: true });
    expect({ copyPath, said: words.test(line(copyPath)) }).toEqual({ copyPath, said: true });
  });
});
