/**
 * The wording editor on the notifications preview: what a visitor sees in the message field and on the lock
 * screen as they pick "Your words" and the editor types the message in, one keystroke at a time. The editor
 * is a view over these pure functions; the section itself is rendered in `previews/push-notifications.test.tsx`.
 */

import { describe, expect, test } from "bun:test";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "../copy/previews/push-notifications";
import {
  sampleValues,
  TYPING_MS,
  parseWording,
  resolveWording,
  typedSteps,
  typedWording,
  wordingSteps,
  wordingView,
} from "./wording-editor";

const OWN = parseWording(COPY.editor.own.text);
const SAMPLE_VALUES = sampleValues(COPY.editor.sampleValues);

describe("a message with variables, as the dashboard's editor shows it", () => {
  test("splits into plain text and variables, in order, and puts back the same words", () => {
    expect(OWN).toEqual([
      { kind: "text", text: "You got stamped, " },
      { kind: "variable", name: "first name" },
      { kind: "text", text: "! " },
      { kind: "variable", name: "stamps left" },
      { kind: "text", text: " more to go." },
    ]);
    expect(parseWording("Reward redeemed. Enjoy!")).toEqual([{ kind: "text", text: "Reward redeemed. Enjoy!" }]);
    expect(parseWording("")).toEqual([]);
  });

  test("fills each variable with a sample customer's value: the preview reads as the copy says it does", () => {
    expect(resolveWording(OWN, SAMPLE_VALUES)).toBe(COPY.editor.own.preview);
  });

  test("a variable it has no value for stays as the owner typed it, never blank", () => {
    expect(resolveWording(parseWording("Hi {nickname}!"), SAMPLE_VALUES)).toBe("Hi {nickname}!");
  });
});

describe("typing the message in", () => {
  const total = wordingSteps(OWN);

  test("a letter is a keystroke and a variable is one: it lands whole, as a chip", () => {
    expect(total).toBe("You got stamped, ".length + 1 + "! ".length + 1 + " more to go.".length);
  });

  test.each([
    [0, ""],
    [5, "You g"],
    [17, "You got stamped, "],
    [18, "You got stamped, {first name}"],
    [20, "You got stamped, {first name}! "],
  ])("after %i keystrokes the field reads %j", (steps, written) => {
    const shown = typedWording(OWN, steps)
      .map((part) => (part.kind === "text" ? part.text : `{${part.name}}`))
      .join("");

    expect(shown).toBe(written);
  });

  test("every keystroke takes one step, and the whole message is in after its last one, never beyond", () => {
    expect(typedSteps(0, total)).toBe(0);
    expect(typedSteps(TYPING_MS * 10, total)).toBe(10);
    expect(typedSteps(TYPING_MS * 10 + TYPING_MS - 1, total)).toBe(10);
    expect(typedSteps(TYPING_MS * total, total)).toBe(total);
    expect(typedSteps(60_000, total)).toBe(total);
  });

  test("for a reader who asks for less motion the whole message is there at once", () => {
    expect(typedSteps(0, total, true)).toBe(total);
  });
});

describe("what the editor shows (field and lock screen)", () => {
  const view = (mode: "ready" | "own", steps: number) =>
    wordingView({ mode, steps, ready: COPY.editor.ready.text, own: COPY.editor.own.text, values: SAMPLE_VALUES });

  test("Ready-made: the default stamp message in the field and on the lock screen, no caret", () => {
    const shown = view("ready", 0);

    expect(shown.parts).toEqual([{ kind: "text", text: COPY.editor.ready.text }]);
    expect(shown.banner).toBe(COPY.editor.ready.text);
    expect(shown.typing).toBe(false);
  });

  test("Your words, as it starts: an empty field with a caret", () => {
    const shown = view("own", 0);

    expect(shown.parts).toEqual([]);
    expect(shown.banner).toBe("");
    expect(shown.typing).toBe(true);
  });

  test("Your words, half typed: the lock screen follows the field, the customer's name already filled in", () => {
    const shown = view("own", 18);

    expect(shown.banner).toBe("You got stamped, Sophie");
    expect(shown.typing).toBe(true);
  });

  test("Your words, finished: the whole message with its two chips, the lock screen showing the copy's preview, the caret gone", () => {
    const shown = view("own", wordingSteps(OWN));

    expect(shown.parts.filter((part) => part.kind === "variable").map((part) => part.name)).toEqual(["first name", "stamps left"]);
    expect(shown.banner).toBe(COPY.editor.own.preview);
    expect(shown.typing).toBe(false);
  });
});
