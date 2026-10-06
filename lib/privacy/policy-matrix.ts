import raw from "./policy-matrix.v1.json";

/**
 * The regional policy matrix: one row per set of rules a visitor can fall
 * under. The data lives in `policy-matrix.v1.json`, which the backend holds an
 * identical copy of; this module only types it and builds the lookup.
 */

export type PolicyRegime = "opt-in" | "opt-out";
export type PolicySurface = "banner" | "notice";

export interface PolicyRow {
  /** The row's key in the matrix (`EEA_UK_CH`, `US`, `UNKNOWN`). */
  key: string;
  countries: readonly string[];
  regime: PolicyRegime;
  surface: PolicySurface;
  default: { analytics: boolean; marketing: boolean };
  gpc_overrides_choice: boolean;
  grant_ttl_days: number;
  refusal_ttl_days: number;
  refusal_sliding: boolean;
  mint_subject_before_tags: boolean;
}

export interface PolicyMatrix {
  version: number;
  analytics_under_us_opt_out: "off" | "service_provider";
  rows: Readonly<Record<string, PolicyRow>>;
}

/** The row for anything we cannot place. It must exist in every matrix. */
export const UNKNOWN_ROW_KEY = "UNKNOWN";

/**
 * SHA-256 of `policy-matrix.v1.json`. The backend pins the same value for its
 * copy; changing the file means updating both copies and both constants.
 */
export const POLICY_MATRIX_SHA256 =
  "ebbacb154791add81d3007c19d5c3e8094c35674dc219b4ad4cfa4ef02e42273";

type RawRow = Omit<PolicyRow, "key" | "regime" | "surface"> & {
  regime: string;
  surface: string;
};

export interface RawPolicyMatrix {
  version: number;
  analytics_under_us_opt_out: string;
  rows: Record<string, RawRow>;
}

/** Validate a raw matrix and key its rows. Throws on anything malformed. */
export function buildPolicyMatrix(input: RawPolicyMatrix): PolicyMatrix {
  if (!input.rows[UNKNOWN_ROW_KEY]) {
    throw new Error(`policy matrix has no ${UNKNOWN_ROW_KEY} row`);
  }
  const flag = input.analytics_under_us_opt_out;
  if (flag !== "off" && flag !== "service_provider") {
    throw new Error(`policy matrix: bad analytics_under_us_opt_out "${flag}"`);
  }

  const rows: Record<string, PolicyRow> = {};
  for (const [key, row] of Object.entries(input.rows)) {
    if (row.regime !== "opt-in" && row.regime !== "opt-out") {
      throw new Error(`policy matrix: row ${key} has regime "${row.regime}"`);
    }
    if (row.surface !== "banner" && row.surface !== "notice") {
      throw new Error(`policy matrix: row ${key} has surface "${row.surface}"`);
    }
    rows[key] = { ...row, key, regime: row.regime, surface: row.surface };
  }
  return { version: input.version, analytics_under_us_opt_out: flag, rows };
}

export const POLICY_MATRIX: PolicyMatrix = buildPolicyMatrix(raw);
