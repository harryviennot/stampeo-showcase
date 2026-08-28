"use client";

import { useRouter } from "next/navigation";

export interface FilterChipArea {
  slug: string;
  label: string;
  dotHex: string;
}

/**
 * Area filter row for the changelog timeline. Renders <button>s (not <a>
 * links) on purpose: crawlers were discovering every ?area= permutation as a
 * separate URL (Search Console "Alternative page with proper canonical tag"),
 * so the filter must not exist as anchors in the HTML. Navigation still goes
 * through the URL (router.replace) so ?area= deep links keep working and the
 * server re-renders the filtered timeline.
 */
export function ChangelogFilterChips({
  base,
  allLabel,
  areas,
  activeArea,
}: {
  base: string;
  allLabel: string;
  areas: FilterChipArea[];
  activeArea?: string;
}) {
  const router = useRouter();
  const select = (slug?: string) =>
    router.replace(slug ? `${base}?area=${slug}` : base, { scroll: false });

  return (
    <div className="mb-12 flex flex-wrap justify-center gap-2">
      <button
        type="button"
        onClick={() => select()}
        className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
          !activeArea
            ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--paper)]"
            : "border-[var(--foreground)]/15 text-[var(--foreground)]/70 hover:border-[var(--foreground)]/30"
        }`}
      >
        {allLabel}
      </button>
      {areas.map((a) => {
        const isActive = a.slug === activeArea;
        return (
          <button
            key={a.slug}
            type="button"
            onClick={() => select(isActive ? undefined : a.slug)}
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-[var(--foreground)]/30 bg-[var(--foreground)]/[0.06] text-[var(--foreground)]"
                : "border-[var(--foreground)]/15 text-[var(--foreground)]/70 hover:border-[var(--foreground)]/30"
            }`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: a.dotHex }}
            />
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
