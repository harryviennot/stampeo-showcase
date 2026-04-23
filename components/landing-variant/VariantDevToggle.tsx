"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

/**
 * Dev-only floating toggle between control and the fidelatoo variant.
 * Rendered only when NODE_ENV=development AND locale=fr.
 * Writes to the `variant` query param, preserving other params.
 */
export function VariantDevToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  if (process.env.NODE_ENV !== "development") return null;
  if (locale !== "fr") return null;

  const isVariant = searchParams.get("variant") === "fidelatoo";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isVariant) {
      params.delete("variant");
    } else {
      params.set("variant", "fidelatoo");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 bg-black/90 text-white rounded-full px-3 py-2 shadow-2xl backdrop-blur-sm text-xs font-mono">
      <span className="opacity-60">dev ·</span>
      <span className="font-bold">
        {isVariant ? "variant: fidelatoo" : "variant: control"}
      </span>
      <button
        onClick={toggle}
        className="ml-1 px-3 py-1 rounded-full bg-[var(--accent)] text-white font-bold hover:brightness-110 active:scale-95 transition-all"
      >
        switch →
      </button>
    </div>
  );
}
