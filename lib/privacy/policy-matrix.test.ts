/**
 * The regional policy matrix.
 *
 * `policy-matrix.v1.json` is the one description of what each region's rules
 * are. The backend holds a BYTE-IDENTICAL copy and pins the same SHA-256 in its
 * own constant, so the two sides cannot drift apart unnoticed.
 *
 * CHANGING THE FILE MEANS CHANGING BOTH COPIES AND BOTH CONSTANTS TOGETHER:
 * edit the JSON here and in `backend/app/services/privacy/`, then update
 * `POLICY_MATRIX_SHA256` in `policy-matrix.ts` and in the backend module. A
 * failing hash in one repo is the signal that the other has not caught up.
 */

import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import raw from "./policy-matrix.v1.json";
import {
  POLICY_MATRIX,
  POLICY_MATRIX_SHA256,
  buildPolicyMatrix,
} from "./policy-matrix";
import { consentMaxAgeSeconds, effectiveRow, resolveWithPolicy, rowFor } from "./policy";

const FILE = join(import.meta.dir, "policy-matrix.v1.json");

describe("the shared file", () => {
  test("hashes to the pinned constant, the same one the backend pins", () => {
    const digest = createHash("sha256").update(readFileSync(FILE)).digest("hex");
    expect(digest).toBe(POLICY_MATRIX_SHA256);
  });

  test("is the matrix the app loads, version 1", () => {
    expect(POLICY_MATRIX.version).toBe(1);
    expect(POLICY_MATRIX.analytics_under_us_opt_out).toBe("off");
    expect(Object.keys(POLICY_MATRIX.rows).sort()).toEqual(["EEA_UK_CH", "UNKNOWN", "US"]);
  });

  test("puts every country in exactly one row", () => {
    const seen = new Map<string, string>();
    for (const row of Object.values(POLICY_MATRIX.rows)) {
      for (const country of row.countries) {
        expect(country).toMatch(/^[A-Z]{2}$/);
        expect(seen.has(country)).toBe(false);
        seen.set(country, row.key);
      }
    }
    expect(POLICY_MATRIX.rows.EEA_UK_CH.countries).toHaveLength(32);
  });

  test("carries the rules each region is held to", () => {
    const { EEA_UK_CH, US, UNKNOWN } = POLICY_MATRIX.rows;
    expect(EEA_UK_CH).toMatchObject({
      regime: "opt-in",
      surface: "banner",
      grant_ttl_days: 182,
      refusal_ttl_days: 182,
      refusal_sliding: false,
      mint_subject_before_tags: false,
    });
    expect(US).toMatchObject({
      regime: "opt-out",
      surface: "notice",
      default: { analytics: true, marketing: true },
      gpc_overrides_choice: true,
      refusal_ttl_days: 400,
      refusal_sliding: true,
      mint_subject_before_tags: true,
    });
    // Everything we cannot place is held to the strict row.
    expect(UNKNOWN).toMatchObject({
      countries: [],
      regime: "opt-in",
      default: { analytics: false, marketing: false },
    });
  });
});

describe("a row added to the matrix is applied with no other code change", () => {
  // A hypothetical opt-out country with a short refusal lifetime and no
  // subject minting: every field the resolver reads comes from the row.
  const matrix = buildPolicyMatrix({
    ...raw,
    rows: {
      ...raw.rows,
      TEST_LAND: {
        countries: ["TL"],
        regime: "opt-out",
        surface: "notice",
        default: { analytics: true, marketing: false },
        gpc_overrides_choice: false,
        grant_ttl_days: 30,
        refusal_ttl_days: 60,
        refusal_sliding: false,
        mint_subject_before_tags: false,
      },
    },
  });

  test("the country finds it, and a stricter signal still wins", () => {
    expect(rowFor("TL", matrix).key).toBe("TEST_LAND");
    expect(effectiveRow({ serverCountry: "TL", timezoneCountry: null }, matrix).key).toBe(
      "TEST_LAND",
    );
    expect(effectiveRow({ serverCountry: "TL", timezoneCountry: "FR" }, matrix).key).toBe(
      "EEA_UK_CH",
    );
  });

  test("its defaults and lifetimes decide what the visitor is taken to have agreed to", () => {
    const row = rowFor("TL", matrix);
    expect(
      resolveWithPolicy({ row, record: null, prior: null, gpc: false }, matrix),
    ).toEqual({ analytics: true, marketing: false });
    expect(consentMaxAgeSeconds(row, { analytics: false, marketing: false })).toBe(
      60 * 86_400,
    );
    expect(consentMaxAgeSeconds(row, { analytics: true, marketing: true })).toBe(30 * 86_400);
  });

  test("a matrix without the UNKNOWN row is refused at load", () => {
    const withoutUnknown = Object.fromEntries(
      Object.entries(raw.rows).filter(([key]) => key !== "UNKNOWN"),
    );
    expect(() => buildPolicyMatrix({ ...raw, rows: withoutUnknown })).toThrow();
  });
});
