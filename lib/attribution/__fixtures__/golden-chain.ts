/**
 * What every golden chain file is held to, whatever the ad platform: the file
 * hashes to the SHA-256 the other repos pin, is written in the canonical
 * layout, says what this repo's real functions produce from its inputs, and
 * hands the privacy route and the sign-up call the same carriers.
 *
 * Web and the backend carry BYTE-IDENTICAL copies of each file and pin the same
 * SHA-256. CHANGING A FILE MEANS CHANGING EVERY COPY AND EVERY CONSTANT TOGETHER.
 */

import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { computeAttributionChain, type ChainInputs, type ChainOutputs } from "./chain";

export interface GoldenChain<Backend = Record<string, unknown>> {
  fixture_version: number;
  inputs: ChainInputs;
  expected_showcase: ChainOutputs;
  expected_backend: Backend;
}

/** Registers the shared tests for one fixture file and returns its parsed content for the vendor's own. */
export function describeGoldenChain<Backend = Record<string, unknown>>(
  fileName: string,
  sha256: string,
): GoldenChain<Backend> {
  const file = join(import.meta.dir, fileName);
  const text = readFileSync(file, "utf8");
  const fixture = JSON.parse(text) as GoldenChain<Backend>;

  describe(`the shared file ${fileName}`, () => {
    test("hashes to the pinned constant, the one the other repos pin", () => {
      expect(createHash("sha256").update(readFileSync(file)).digest("hex")).toBe(sha256);
    });

    test("has LF line endings, one trailing newline, and the canonical layout", () => {
      expect(text).not.toContain("\r");
      expect(text.endsWith("}\n")).toBe(true);
      expect(text.endsWith("\n\n")).toBe(false);
      expect(JSON.stringify(JSON.parse(text), null, 2) + "\n").toBe(text);
    });
  });

  describe(`what this repo makes of the inputs of ${fileName}`, () => {
    test("is what the file says, to the byte", async () => {
      expect(await computeAttributionChain(fixture.inputs)).toEqual(fixture.expected_showcase);
    });

    test("hands the route and the sign-up call the same carriers", () => {
      const { carriers, route_request, signup_request } = fixture.expected_showcase;

      expect(route_request).toEqual({ path: "/api/privacy/cookies", body: { carriers } });
      expect(signup_request.path).toBe("/account/signup-recorded");
      expect(signup_request.body).toMatchObject({
        consent_subject_id: fixture.inputs.cookies.stampeo_sid,
        ad_attribution_v2: carriers,
        basis: { cr: "opt-out", p: 1, g: "US" },
        refused: [],
      });
    });
  });

  return fixture;
}
