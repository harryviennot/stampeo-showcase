/**
 * The golden fixture `attribution-chain.v2.json`.
 *
 * One visitor, followed from an ad click to the sign-up call: a US visitor who
 * never touched the notice, landing on the Meta ad URL, with Google's and
 * Meta's cookies present. The file holds the inputs, what THIS repo produces
 * from them (the three carriers and the exact `POST /account/signup-recorded`
 * body), and what the backend is expected to make of them. The checks every
 * golden file shares are in `__fixtures__/golden-chain.ts`; what is asserted
 * here is what makes this one a Meta click.
 */

import { describe, expect, test } from "bun:test";

import { describeGoldenChain } from "./__fixtures__/golden-chain";

const ATTRIBUTION_CHAIN_SHA256 =
  "c096d97e97c350c8c51a68c28d8f349d1f4fa3622246f21aef4afe51b67288d6";

const FIXTURE = describeGoldenChain("attribution-chain.v2.json", ATTRIBUTION_CHAIN_SHA256);

describe("the Meta landing the contract names", () => {
  test("starts from the landing the contract names", () => {
    expect(FIXTURE.fixture_version).toBe(1);
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

  test("builds a sign-up body of the subject, the carriers as stored, the basis, what is refused, and the live identifiers", () => {
    const { carriers, signup_request } = FIXTURE.expected_showcase;

    expect(signup_request.body).toEqual({
      consent_subject_id: FIXTURE.inputs.cookies.stampeo_sid,
      ad_attribution_v2: carriers,
      // The US row, under its opt-out default: what the call was made under.
      basis: { cr: "opt-out", p: 1, g: "US" },
      refused: [],
      live: {
        ga: FIXTURE.inputs.cookies._ga,
        ga_sessions: { ZFZ6JLPFXN: FIXTURE.inputs.cookies._ga_ZFZ6JLPFXN },
        fbp: FIXTURE.inputs.cookies._fbp,
      },
    });
  });
});
