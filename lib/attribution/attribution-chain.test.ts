/**
 * The golden fixture `attribution-chain.v2.json`.
 *
 * One visitor, followed from an ad click to the sign-up call: a US visitor who
 * never touched the notice, landing on the Meta ad URL, with Google's and
 * Meta's cookies present. The file holds the inputs, what THIS repo produces
 * from them (the three carriers and the exact `POST /account/signup-recorded`
 * body), and what the backend is expected to make of them.
 *
 * Web and the backend carry BYTE-IDENTICAL copies and pin the same SHA-256, so
 * the three repos cannot disagree about the shape of a carrier without a test
 * failing in whichever one drifted. CHANGING THE FILE MEANS CHANGING ALL THREE
 * COPIES AND ALL THREE CONSTANTS TOGETHER.
 */

import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { computeAttributionChain, type ChainInputs } from "./__fixtures__/chain";

const ATTRIBUTION_CHAIN_SHA256 =
  "a5965071f36fe4046acdf365cc0b31d5d9de15c8bbbbfa263bc88d9e8d8cc8de";

const FILE = join(import.meta.dir, "__fixtures__", "attribution-chain.v2.json");
const TEXT = readFileSync(FILE, "utf8");
const FIXTURE = JSON.parse(TEXT) as {
  version: number;
  inputs: ChainInputs;
  expected_showcase: Awaited<ReturnType<typeof computeAttributionChain>>;
  expected_backend: {
    account_ad_attribution: Record<string, unknown>;
    meta: { fbc: string; fbp: string; user_data_keys: string[] };
  };
};

describe("the shared file", () => {
  test("hashes to the pinned constant, the one the other repos pin", () => {
    expect(createHash("sha256").update(readFileSync(FILE)).digest("hex")).toBe(
      ATTRIBUTION_CHAIN_SHA256,
    );
  });

  test("has LF line endings, one trailing newline, and the canonical layout", () => {
    expect(TEXT).not.toContain("\r");
    expect(TEXT.endsWith("}\n")).toBe(true);
    expect(TEXT.endsWith("\n\n")).toBe(false);
    expect(JSON.stringify(JSON.parse(TEXT), null, 2) + "\n").toBe(TEXT);
  });

  test("starts from the landing the contract names", () => {
    expect(FIXTURE.version).toBe(1);
    expect(FIXTURE.inputs).toMatchObject({
      landing_url:
        "https://stampeo.app/us?fbclid=IwAR_TEST_fbclid_0001&utm_source=meta&utm_medium=paid_social&utm_campaign=us-cr-broad&utm_content=ugc-cafe-15s&utm_term=us-broad",
      timezone: "America/New_York",
      gpc: false,
      consent: "none",
    });
    expect(Object.keys(FIXTURE.inputs.cookies).sort()).toEqual([
      "_fbp",
      "_ga",
      "_ga_ZFZ6JLPFXN",
      "stampeo_sid",
    ]);
  });
});

describe("what this repo makes of those inputs", () => {
  test("is what the file says, to the byte", async () => {
    const produced = await computeAttributionChain(FIXTURE.inputs);

    expect(produced).toEqual(FIXTURE.expected_showcase);
  });

  test("puts the click, the tags and the GA session in the three carriers", () => {
    const { carriers } = FIXTURE.expected_showcase;

    expect(carriers.ad).toMatchObject({
      v: 2,
      vn: "meta",
      ci: "IwAR_TEST_fbclid_0001",
      ct: FIXTURE.inputs.times.landed_at,
      fbp: FIXTURE.inputs.cookies._fbp,
      cr: "opt-out",
      ca: 0,
      g: "US",
    });
    expect(carriers.src).toMatchObject({ us: "meta", um: "paid_social", uc: "us-cr-broad", lp: "/us" });
    expect(carriers.ga).toMatchObject({ cid: "1234567890.1700000000", sn: 1 });
  });

  test("builds a sign-up body of the subject, the carriers as stored, the basis, and the live identifiers", () => {
    const { carriers, signup_request } = FIXTURE.expected_showcase;

    expect(signup_request.path).toBe("/account/signup-recorded");
    expect(signup_request.body).toEqual({
      consent_subject_id: FIXTURE.inputs.cookies.stampeo_sid,
      ad_attribution_v2: carriers,
      // The US row, under its opt-out default: what the call was made under.
      basis: { cr: "opt-out", p: 1, g: "US" },
      live: {
        ga: FIXTURE.inputs.cookies._ga,
        ga_sessions: { ZFZ6JLPFXN: FIXTURE.inputs.cookies._ga_ZFZ6JLPFXN },
        fbp: FIXTURE.inputs.cookies._fbp,
      },
    });
  });

  test("hands the route the same carriers it sets as cookies", () => {
    const { carriers, route_request } = FIXTURE.expected_showcase;
    expect(route_request).toEqual({ path: "/api/privacy/cookies", body: { carriers } });
  });
});
