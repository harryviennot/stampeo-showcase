/**
 * The golden fixture `attribution-chain.chatgpt.v1.json`.
 *
 * The ChatGPT twin of `attribution-chain.v2.json`: a US visitor who never
 * touched the notice, landing on a ChatGPT ad URL (`?oppref=`) with Google's
 * and Meta's cookies present, then signing up. The file holds the inputs, what
 * THIS repo produces from them (the three carriers and the exact
 * `POST /account/signup-recorded` body), and what the backend is expected to
 * make of them: the click goes to ChatGPT Ads alone.
 *
 * Web and the backend carry BYTE-IDENTICAL copies and pin the same SHA-256.
 * CHANGING THE FILE MEANS CHANGING EVERY COPY AND EVERY CONSTANT TOGETHER.
 */

import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { computeAttributionChain, type ChainInputs } from "./__fixtures__/chain";

const CHATGPT_CHAIN_SHA256 = "859f0bfb7f3255a8f22c10c2a173d9ff3151e9c1d804bdaa2aa583266fc33a30";

const FILE = join(import.meta.dir, "__fixtures__", "attribution-chain.chatgpt.v1.json");
const TEXT = readFileSync(FILE, "utf8");
const FIXTURE = JSON.parse(TEXT) as {
  fixture_version: number;
  inputs: ChainInputs;
  expected_showcase: Awaited<ReturnType<typeof computeAttributionChain>>;
  expected_backend: {
    account_ad_attribution: Record<string, unknown>;
    acquisition_source: string;
    chatgpt_ads: { oppref: string; click_captured_at: number };
  };
};

const OPPREF = "OAI_TEST_oppref_0001-a8F3kQ2xT7Lw";

describe("the shared file", () => {
  test("hashes to the pinned constant, the one the other repos pin", () => {
    expect(createHash("sha256").update(readFileSync(FILE)).digest("hex")).toBe(CHATGPT_CHAIN_SHA256);
  });

  test("has LF line endings, one trailing newline, and the canonical layout", () => {
    expect(TEXT).not.toContain("\r");
    expect(TEXT.endsWith("}\n")).toBe(true);
    expect(TEXT.endsWith("\n\n")).toBe(false);
    expect(JSON.stringify(JSON.parse(TEXT), null, 2) + "\n").toBe(TEXT);
  });

  test("starts from a US landing with the oppref and the paid ChatGPT tags", () => {
    expect(FIXTURE.fixture_version).toBe(1);
    expect(FIXTURE.inputs).toMatchObject({
      landing_url: `https://stampeo.app/us?oppref=${OPPREF}&utm_source=chatgpt&utm_medium=cpc&utm_campaign=us-chatgpt-brand`,
      timezone: "America/New_York",
      gpc: false,
      consent: "none",
    });
  });
});

describe("what this repo makes of a ChatGPT ad landing", () => {
  test("is what the file says, to the byte", async () => {
    expect(await computeAttributionChain(FIXTURE.inputs)).toEqual(FIXTURE.expected_showcase);
  });

  test("puts the oppref in the ad carrier unchanged, under consent version 5, with the campaign and the GA session beside it", () => {
    const { carriers } = FIXTURE.expected_showcase;

    expect(carriers.ad).toMatchObject({
      v: 2,
      vn: "openai",
      ci: OPPREF,
      ct: FIXTURE.inputs.times.landed_at,
      cv: 5,
      cr: "opt-out",
      ca: 0,
      g: "US",
    });
    expect(carriers.src).toMatchObject({ us: "chatgpt", um: "cpc", uc: "us-chatgpt-brand", lp: "/us", rh: "chatgpt.com" });
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

describe("what the backend is expected to make of it", () => {
  test("stores the click as OpenAI's, unchanged, under version 5, and classifies the visit as a ChatGPT ad", () => {
    const { carriers } = FIXTURE.expected_showcase as { carriers: { ad: Record<string, unknown>; src: Record<string, unknown> } };
    const { account_ad_attribution: row, acquisition_source, chatgpt_ads } = FIXTURE.expected_backend;

    expect(row).toMatchObject({
      vendor: carriers.ad.vn,
      click_id: carriers.ad.ci,
      click_captured_at: carriers.ad.ct,
      consent_version: carriers.ad.cv,
      consent_regime: "opt-out",
      consent_at: null,
      utm_source: carriers.src.us,
      utm_medium: carriers.src.um,
      utm_campaign: carriers.src.uc,
      referrer_host: carriers.src.rh,
    });
    expect(row).toMatchObject({ vendor: "openai", click_id: OPPREF, consent_version: 5 });
    expect(acquisition_source).toBe("chatgpt_ad");
    expect(chatgpt_ads).toEqual({ oppref: OPPREF, click_captured_at: FIXTURE.inputs.times.landed_at });
  });
});
