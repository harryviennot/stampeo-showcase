/**
 * The golden fixture `attribution-chain.google.v1.json`.
 *
 * The Google twin of `attribution-chain.v2.json`: a US visitor who never touched
 * the notice, landing on a Google ad URL (`?gclid=`) with Google's and Meta's
 * cookies present. The shared checks are in `__fixtures__/golden-chain.ts`; what
 * is asserted here is what makes this one a Google click.
 */

import { describe, expect, test } from "bun:test";

import { describeGoldenChain } from "./__fixtures__/golden-chain";

const GOOGLE_CHAIN_SHA256 = "b1cf0e456ab8d772edd54eae735c5098ccae1e8330b918f9f290a6bf97569de1";

const FIXTURE = describeGoldenChain("attribution-chain.google.v1.json", GOOGLE_CHAIN_SHA256);

describe("what this repo makes of a Google ad landing", () => {
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
});
