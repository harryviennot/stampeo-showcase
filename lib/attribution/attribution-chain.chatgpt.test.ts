/**
 * The golden fixture `attribution-chain.chatgpt.v1.json`.
 *
 * The ChatGPT twin of `attribution-chain.v2.json`: a US visitor who never
 * touched the notice, landing on a ChatGPT ad URL (`?oppref=`) with Google's
 * and Meta's cookies present, then signing up. The `oppref` holds `+`, `/`, `=`
 * and a percent-encoded `+`, so the chain proves the id reaches OpenAI as the
 * original string. The file holds the inputs, what THIS repo produces from them
 * (the three carriers and the exact `POST /account/signup-recorded` body), and
 * what the backend is expected to make of them: the click goes to ChatGPT Ads
 * alone. The checks every golden file shares are in `__fixtures__/golden-chain.ts`.
 */

import { describe, expect, test } from "bun:test";

import { describeGoldenChain } from "./__fixtures__/golden-chain";
import { readClickIds } from "./landing";

const CHATGPT_CHAIN_SHA256 = "b4b4b38648c6502436b26a0e380026bf0e6cd738e70ae9675eae6cddc87c99a5";

const FIXTURE = describeGoldenChain<{
  account_ad_attribution: Record<string, unknown>;
  acquisition_source: string;
  chatgpt_ads: { oppref: string; click_captured_at: number };
}>("attribution-chain.chatgpt.v1.json", CHATGPT_CHAIN_SHA256);

/** The id as the landing address spells it, and as `readClickIds` must read it. */
const OPPREF_IN_URL = "OAI_TEST+a8F3/kQ2x=T7%2BLw";
const OPPREF = "OAI_TEST+a8F3/kQ2x=T7+Lw";

describe("the ChatGPT ad landing", () => {
  test("starts from a US landing with the oppref and the paid ChatGPT tags", () => {
    expect(FIXTURE.fixture_version).toBe(1);
    expect(FIXTURE.inputs).toMatchObject({
      landing_url: `https://stampeo.app/us?oppref=${OPPREF_IN_URL}&utm_source=chatgpt&utm_medium=cpc&utm_campaign=us-chatgpt-brand`,
      timezone: "America/New_York",
      gpc: false,
      consent: "none",
    });
    expect(readClickIds(new URL(FIXTURE.inputs.landing_url).search).oppref).toBe(OPPREF);
  });

  test("puts the oppref in the ad carrier unchanged, under the current consent version, with the campaign and the GA session beside it", () => {
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

  // expected_backend comes from the same file, so this checks the file agrees
  // with itself; the backend's own reading of the file is pinned in the backend.
  test("the file's expected backend rows agree with the carriers showcase makes", () => {
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
