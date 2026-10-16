/**
 * The golden fixture `attribution-chain.google.v1.json`.
 *
 * The Google twin of `attribution-chain.v2.json`: a US visitor who never touched
 * the notice, landing on a Google ad URL (`?gclid=`) with Google's and Meta's
 * cookies present. The file holds the inputs, what THIS repo produces from them
 * (the three carriers and the exact `POST /account/signup-recorded` body), and
 * what the backend is expected to make of them: the click goes to Google Ads
 * alone.
 *
 * Web and the backend carry BYTE-IDENTICAL copies and pin the same SHA-256.
 * CHANGING THE FILE MEANS CHANGING EVERY COPY AND EVERY CONSTANT TOGETHER.
 */

import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { computeAttributionChain, type ChainInputs } from "./__fixtures__/chain";

const GOOGLE_CHAIN_SHA256 = "c549ee7b49d2779a6e2640e681b6e6c05677849c9965d42d0ebbab88da0b6a80";

const FILE = join(import.meta.dir, "__fixtures__", "attribution-chain.google.v1.json");
const TEXT = readFileSync(FILE, "utf8");
const FIXTURE = JSON.parse(TEXT) as {
  fixture_version: number;
  inputs: ChainInputs;
  expected_showcase: Awaited<ReturnType<typeof computeAttributionChain>>;
};

describe("the shared file", () => {
  test("hashes to the pinned constant, the one the other repos pin", () => {
    expect(createHash("sha256").update(readFileSync(FILE)).digest("hex")).toBe(GOOGLE_CHAIN_SHA256);
  });

  test("has LF line endings, one trailing newline, and the canonical layout", () => {
    expect(TEXT).not.toContain("\r");
    expect(TEXT.endsWith("}\n")).toBe(true);
    expect(TEXT.endsWith("\n\n")).toBe(false);
    expect(JSON.stringify(JSON.parse(TEXT), null, 2) + "\n").toBe(TEXT);
  });
});

describe("what this repo makes of a Google ad landing", () => {
  test("is what the file says, to the byte", async () => {
    expect(await computeAttributionChain(FIXTURE.inputs)).toEqual(FIXTURE.expected_showcase);
  });

  test("puts the Google click in the ad carrier, with the campaign and the GA session beside it", () => {
    const { carriers } = FIXTURE.expected_showcase;

    expect(carriers.ad).toMatchObject({
      v: 2,
      vn: "google",
      ci: "Cj0KCQ_TEST_gclid_0001",
      ct: FIXTURE.inputs.times.landed_at,
      cr: "opt-out",
      ca: 0,
      g: "US",
    });
    expect(carriers.src).toMatchObject({ us: "google", um: "cpc", uc: "us-search-brand", lp: "/us" });
    expect(carriers.ga).toMatchObject({ cid: "1234567890.1700000000", sn: 1 });
  });

  test("hands the route and the sign-up call the same carriers", () => {
    const { carriers, route_request, signup_request } = FIXTURE.expected_showcase;

    expect(route_request).toEqual({ path: "/api/privacy/cookies", body: { carriers } });
    expect(signup_request.path).toBe("/account/signup-recorded");
    expect(signup_request.body).toMatchObject({
      consent_subject_id: FIXTURE.inputs.cookies.stampeo_sid,
      ad_attribution_v2: carriers,
      basis: { cr: "opt-out", p: 1, g: "US" },
      refused: [],
    });
  });
});
