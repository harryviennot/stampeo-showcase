import type {
  ConsentCategory,
  ConsentRecord,
  ConsentState,
  PriorConsent,
} from "../consent";
import {
  POLICY_MATRIX,
  UNKNOWN_ROW_KEY,
  type PolicyMatrix,
  type PolicyRegime,
  type PolicyRow,
  type PolicySurface,
} from "./policy-matrix";

/**
 * The policy resolver. Pure: every function takes what it needs and answers,
 * so none of it needs a browser.
 *
 * What a visitor is taken to have agreed to is decided in this order: the row
 * (the stricter of the server's country and the timezone's) supplies the rules;
 * GPC then overrides where the row says it does; then the stored choice; then
 * the row's default. Anything we cannot place is the UNKNOWN row, which is
 * opt-in.
 */

export const REGION_COOKIE = "stampeo_region";

const DAY_SECONDS = 60 * 60 * 24;

function normaliseCountry(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const country = value.trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : null;
}

/** The row whose countries include this one, else the UNKNOWN row. */
export function rowFor(
  country: string | null | undefined,
  matrix: PolicyMatrix = POLICY_MATRIX,
): PolicyRow {
  const code = normaliseCountry(country);
  const rows = Object.values(matrix.rows);
  return (
    (code && rows.find((row) => row.countries.includes(code))) ||
    matrix.rows[UNKNOWN_ROW_KEY]
  );
}

/** A row by its key, or null for a key the matrix does not have. */
export function rowByKey(
  key: unknown,
  matrix: PolicyMatrix = POLICY_MATRIX,
): PolicyRow | null {
  if (typeof key !== "string") return null;
  return Object.prototype.hasOwnProperty.call(matrix.rows, key) ? matrix.rows[key] : null;
}

/** The row for a regime, for a stored choice that names none. */
function rowForRegime(
  regime: PolicyRegime,
  matrix: PolicyMatrix = POLICY_MATRIX,
): PolicyRow {
  const unknown = matrix.rows[UNKNOWN_ROW_KEY];
  if (regime === "opt-in") return unknown;
  return Object.values(matrix.rows).find((row) => row.regime === regime) ?? unknown;
}

/** The row a stored choice was made under: the one it names, else the one for its regime. */
export function recordRow(
  record: { regime: PolicyRegime; regionRow?: string },
  matrix: PolicyMatrix = POLICY_MATRIX,
): PolicyRow {
  return rowByKey(record.regionRow, matrix) ?? rowForRegime(record.regime, matrix);
}

/**
 * The stricter of two rows; an opt-in row is stricter than an opt-out one. A
 * missing signal (null) defers to the other, and with both missing the answer
 * is UNKNOWN. On a tie the server row is kept.
 */
export function strictestRow(
  server: PolicyRow | null,
  timezone: PolicyRow | null,
  matrix: PolicyMatrix = POLICY_MATRIX,
): PolicyRow {
  if (!server && !timezone) return matrix.rows[UNKNOWN_ROW_KEY];
  if (!server) return timezone as PolicyRow;
  if (!timezone) return server;
  return timezone.regime === "opt-in" && server.regime === "opt-out" ? timezone : server;
}

/**
 * The country in a `stampeo_region` cookie, or null. Nothing writes it yet; a
 * value that is not exactly `{"c":"XX","v":1}` is ignored, as is a cookie whose
 * name merely ends in ours.
 */
export function readServerRegion(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const entry = part.trim();
    if (!entry.startsWith(`${REGION_COOKIE}=`)) continue;
    try {
      const parsed: unknown = JSON.parse(
        decodeURIComponent(entry.slice(REGION_COOKIE.length + 1)),
      );
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return null;
      const { c, v } = parsed as Record<string, unknown>;
      return v === 1 && typeof c === "string" && /^[A-Z]{2}$/.test(c) ? c : null;
    } catch {
      return null;
    }
  }
  return null;
}

/** The row in force: the stricter of what the server and the timezone say. */
export function effectiveRow(
  input: { serverCountry?: string | null; timezoneCountry?: string | null },
  matrix: PolicyMatrix = POLICY_MATRIX,
): PolicyRow {
  const signal = (country: string | null | undefined) => {
    const code = normaliseCountry(country);
    return code ? rowFor(code, matrix) : null;
  };
  return strictestRow(signal(input.serverCountry), signal(input.timezoneCountry), matrix);
}

/** The categories GPC denies in this row (none where the row does not override). */
export function gpcDeniedCategories(
  row: PolicyRow,
  gpc: boolean,
  matrix: PolicyMatrix = POLICY_MATRIX,
): ConsentCategory[] {
  if (!gpc || !row.gpc_overrides_choice) return [];
  return matrix.analytics_under_us_opt_out === "off"
    ? ["analytics", "marketing"]
    : ["marketing"];
}

/**
 * What this visitor is taken to have agreed to.
 *
 * GPC overrides even a recorded choice where the row says so. Otherwise a
 * current-version record decides both categories. Without one, the row's
 * default applies (GPC never falls to a granting default), minus any category
 * an older record refused: an older refusal stands, an older grant is not a
 * choice.
 */
export function resolveWithPolicy(
  input: {
    row: PolicyRow;
    record: ConsentRecord | null;
    prior: PriorConsent | null;
    gpc: boolean;
  },
  matrix: PolicyMatrix = POLICY_MATRIX,
): ConsentState {
  const { row, record, prior, gpc } = input;
  const gpcDenied = gpcDeniedCategories(row, gpc, matrix);
  const decide = (category: ConsentCategory): boolean => {
    if (gpcDenied.includes(category)) return false;
    if (record) return record[category];
    // A row GPC does not override still never falls to a granting default.
    if (gpc && !row.gpc_overrides_choice) return false;
    return row.default[category] && prior?.[category] !== false;
  };
  return { analytics: decide("analytics"), marketing: decide("marketing") };
}

/** Which consent surface, if any, this visitor should see. */
export function surfaceWithPolicy(input: {
  row: PolicyRow;
  record: ConsentRecord | null;
  prior: PriorConsent | null;
  gpc: boolean;
  trackable: boolean;
}): PolicySurface | "none" {
  if (!input.trackable || input.record) return "none";
  // An older record that refused everything has nothing left to ask.
  if (input.prior && !input.prior.analytics && !input.prior.marketing) return "none";
  // GPC already opted this visitor out, so the notice would not be true of them.
  if (input.gpc && input.row.gpc_overrides_choice) return "none";
  return input.row.surface;
}

/** Max-Age for a stored choice: the refusal lifetime if either category is refused. */
export function consentMaxAgeSeconds(row: PolicyRow, state: ConsentState): number {
  const refused = !state.analytics || !state.marketing;
  return (refused ? row.refusal_ttl_days : row.grant_ttl_days) * DAY_SECONDS;
}

/**
 * May tags be considered yet? A row that starts tracking without a choice
 * waits for the subject id to exist first.
 */
export function subjectGateOpen(row: PolicyRow, subjectId: string | null): boolean {
  return !row.mint_subject_before_tags || subjectId !== null;
}
