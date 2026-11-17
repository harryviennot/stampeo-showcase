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
