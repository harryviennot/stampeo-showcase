/**
 * Sign-up form validation helpers.
 *
 * Pure functions so the rules can be tested without a DOM. Mirrors
 * `_validate_birthday` and `FieldValidationError` in
 * backend/app/services/customer_fields.py — the backend is the enforcement
 * point, these just stop the round-trip and let the form point at the field.
 */

/** Days in each month, February at 29: no year is stored, so a leap-day
 *  birthday is a real birthday and must be accepted. */
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/**
 * Whether a day/month pair is a date that exists in some year.
 *
 * The month picker offers 1-31 for every month rather than reshuffling as the
 * month changes (a day silently disappearing is more surprising than an error),
 * so "31 February" has to be caught here.
 */
export function isValidBirthday(day: number, month: number): boolean {
  if (!Number.isInteger(day) || !Number.isInteger(month)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;
  return day <= DAYS_IN_MONTH[month - 1];
}

/** A field-scoped rejection from `POST /public/customers/{id}`. */
export interface SubmissionFieldError {
  field: string;
  reason: string;
}

/**
 * Pull the offending field out of the backend's error detail.
 *
 * The route answers `{"field": ..., "reason": ...}` precisely so the form can
 * highlight the input; anything else (checkout gate, plain string) returns null
 * and the caller keeps its generic message.
 */
export function mapSubmissionError(detail: unknown): SubmissionFieldError | null {
  if (!detail || typeof detail !== "object") return null;
  const record = detail as Record<string, unknown>;
  if (typeof record.field !== "string" || !record.field) return null;
  return {
    field: record.field,
    reason: typeof record.reason === "string" ? record.reason : "invalid",
  };
}
