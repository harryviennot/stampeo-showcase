/**
 * The two switches that compare design variants on the US landing pages: `?hero=` picks the Platform hero and
 * `?menu=` the phone menu. Each reads the first value in the list, and anything that is not a variant (or no
 * query at all) is the default, the list's first entry.
 */

export const HERO_VARIANTS = ["stack", "shelf"] as const;
export const MENU_VARIANTS = ["sheet", "drill"] as const;

export type HeroVariant = (typeof HERO_VARIANTS)[number];
export type MenuVariant = (typeof MENU_VARIANTS)[number];

/** What the helpers read: `URLSearchParams` and Next's read-only search params both have it. */
export interface SearchParamsLike {
  get(name: string): string | null;
}

function pick<Variant extends string>(
  params: SearchParamsLike | null | undefined,
  name: string,
  variants: readonly Variant[],
): Variant {
  const value = params?.get(name)?.toLowerCase();

  return variants.find((variant) => variant === value) ?? variants[0];
}

export const heroVariant = (params: SearchParamsLike | null | undefined): HeroVariant => pick(params, "hero", HERO_VARIANTS);

export const menuVariant = (params: SearchParamsLike | null | undefined): MenuVariant => pick(params, "menu", MENU_VARIANTS);
