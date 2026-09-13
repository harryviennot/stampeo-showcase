import { describe, expect, test } from "bun:test";
import {
  isValidBirthday,
  mapSubmissionError,
  mapValidationError,
} from "./signup-validation";

describe("isValidBirthday", () => {
  test.each([
    [1, 1],
    [31, 1],
    [29, 2], // no year is stored, so a leap-day birthday must enroll
    [30, 4],
    [31, 12],
  ])("accepts %i/%i", (day, month) => {
    expect(isValidBirthday(day, month)).toBe(true);
  });

  test.each([
    [30, 2],
    [31, 2],
    [31, 4],
    [31, 6],
    [31, 9],
    [31, 11],
  ])("rejects %i/%i, which exists in no year", (day, month) => {
    expect(isValidBirthday(day, month)).toBe(false);
  });

  test.each([
    [0, 1],
    [32, 1],
    [1, 0],
    [1, 13],
    [Number.NaN, 3],
  ])("rejects out-of-range %i/%i", (day, month) => {
    expect(isValidBirthday(day, month)).toBe(false);
  });
});

describe("mapSubmissionError", () => {
  test("maps a structured field rejection to its field and reason", () => {
    expect(
      mapSubmissionError({ field: "favorite_drink", reason: "not_an_option" })
    ).toEqual({ field: "favorite_drink", reason: "not_an_option" });
  });

  test("maps the birthday reasons the backend can return", () => {
    expect(mapSubmissionError({ field: "birthday", reason: "invalid" })).toEqual({
      field: "birthday",
      reason: "invalid",
    });
  });

  test("ignores a detail with no field", () => {
    expect(mapSubmissionError({ code: "CHECKOUT_REQUIRED" })).toBeNull();
    expect(mapSubmissionError("Something went wrong")).toBeNull();
    expect(mapSubmissionError(undefined)).toBeNull();
  });

  test("keeps an unknown reason so the caller can fall back on generic copy", () => {
    expect(mapSubmissionError({ field: "email", reason: "brand_new" })).toEqual({
      field: "email",
      reason: "brand_new",
    });
  });
});

describe("mapValidationError", () => {
  test("points at the field a 422 names", () => {
    const detail = [
      {
        type: "value_error",
        loc: ["body", "email"],
        msg: "value is not a valid email address",
        input: "nope",
      },
    ];
    expect(mapValidationError(detail)).toEqual({
      field: "email",
      reason: "invalid_email",
    });
  });

  test("reaches into a nested loc, which is already the form's error key", () => {
    expect(
      mapValidationError([{ loc: ["body", "custom_fields", "size"], msg: "bad" }])
    ).toEqual({ field: "size", reason: "rejected" });
  });

  test("phone gets its own wording too", () => {
    expect(mapValidationError([{ loc: ["body", "phone"], msg: "bad" }])).toEqual({
      field: "phone",
      reason: "invalid_phone",
    });
  });

  test("skips entries it cannot place rather than guessing", () => {
    expect(mapValidationError([{ msg: "no loc here" }])).toBeNull();
    expect(mapValidationError([{ loc: ["body"] }])).toBeNull();
    expect(mapValidationError([])).toBeNull();
  });

  test("ignores shapes that are not a validation array", () => {
    // The route's own rejections are objects and belong to mapSubmissionError.
    expect(mapValidationError({ field: "email", reason: "required" })).toBeNull();
    expect(mapValidationError("Something went wrong")).toBeNull();
    expect(mapValidationError(null)).toBeNull();
  });
});
