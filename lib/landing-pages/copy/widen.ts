/** Fields that name something in code (a tab, a chart, a program) rather than words a visitor reads: they keep their literal type. */
type IdentifierField = "key" | "program";

/**
 * The shape of an English copy module with every word widened to `string`, so another language can fill the same
 * shape with its own words. Identifier fields keep their literal values, and functions keep their signature.
 */
export type Widen<T> = T extends string
  ? string
  : T extends number | boolean | null | undefined
    ? T
    : T extends (...args: never[]) => unknown
      ? T
      : T extends readonly (infer Item)[]
        ? readonly Widen<Item>[]
        : { readonly [K in keyof T]: K extends IdentifierField ? T[K] : Widen<T[K]> };

/**
 * A copy shape in which any word may be left out, to override some of another language's words. A list is
 * overridden by position: an entry left `undefined` keeps the word it already has.
 */
export type DeepPartial<T> = T extends string | number | boolean | null | undefined
  ? T
  : T extends (...args: never[]) => unknown
    ? T
    : T extends readonly (infer Item)[]
      ? readonly (DeepPartial<Item> | undefined)[]
      : { readonly [K in keyof T]?: DeepPartial<T[K]> };

/** `base` with the words of `overlay` laid over it; `base` is never changed. */
export function overlaid<T>(base: T, overlay: DeepPartial<T> | undefined): T {
  if (overlay === undefined) return base;
  if (Array.isArray(base)) {
    const words = overlay as readonly unknown[];
    return base.map((item, index) => overlaid(item, words[index] as DeepPartial<typeof item> | undefined)) as T;
  }
  if (typeof base === "object" && base !== null) {
    const words = overlay as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(base).map(([key, value]) => [key, overlaid(value, words[key] as DeepPartial<typeof value> | undefined)]),
    ) as T;
  }
  return overlay as T;
}
