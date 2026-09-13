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

/**
 * Pull the offending field out of a FastAPI **validation** error.
 *
 * A 422 answers with `detail` as an ARRAY of `{loc, msg, type}`, which is a
 * different shape from the route's own `{field, reason}` rejections above.
 * Without this the array fell through to the generic branch and a mistyped
 * email blew the whole page away to "Something went wrong" with a Try Again
 * that emptied every field the visitor had filled in.
 *
 * `loc` is path-like (`["body", "email"]`, `["body", "custom_fields", "size"]`),
 * so the last non-"body" segment is the input to point at, and it is already
 * the key the form stores its errors under.
 *
 * The `msg` is deliberately ignored: it is Pydantic's English, and this form is
 * shown to end customers of French, Spanish and Polish merchants.
 */
export function mapValidationError(detail: unknown): SubmissionFieldError | null {
  if (!Array.isArray(detail)) return null;
  for (const entry of detail) {
    if (!entry || typeof entry !== 'object') continue;
    const loc = (entry as { loc?: unknown }).loc;
    if (!Array.isArray(loc)) continue;
    const field = [...loc]
      .reverse()
      .find((part): part is string => typeof part === 'string' && part !== 'body');
    if (!field) continue;
    return { field, reason: validationReason(field) };
  }
  return null;
}

/** The two fields with wording better than "we could not accept this". */
function validationReason(field: string): string {
  if (field === 'email') return 'invalid_email';
  if (field === 'phone') return 'invalid_phone';
  return 'rejected';
}
