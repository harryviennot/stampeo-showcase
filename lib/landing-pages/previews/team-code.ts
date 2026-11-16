/** The team code the staff phone fills in on the scanner preview. */

/** A code as the Team page issues it: six characters from the Scanner app's alphabet (no 0, O, 1, I, L or U). */
export const TEAM_CODE = "H7K3MP";

/** One character is typed every this many ms. */
export const TYPE_STEP_MS = 120;

export interface CodeBox {
  char: string;
  /** The box shows its character: it has been typed. */
  typed: boolean;
}

/** One box per character of `code`, the first `typed` of them filled. */
export function codeBoxes(code: string, typed: number): CodeBox[] {
  return [...code].map((char, index) => ({ char, typed: index < typed }));
}

/** Whether the code is typed in front of the reader; one who asks for less motion sees it already entered. */
export function typesIn(reducedMotion: boolean): boolean {
  return !reducedMotion;
}
