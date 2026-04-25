"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

/**
 * Dev-only floating toggle between the live FR landing (variant) and the
 * legacy control via the `?variant=control` escape hatch.
 * Rendered only when NODE_ENV=development AND locale=fr.
 */
export function VariantDevToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();

  if (process.env.NODE_ENV !== "development") return null;
  if (locale !== "fr") return null;

  const isControl = searchParams.get("variant") === "control";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isControl) {
      params.delete("variant");
    } else {
      params.set("variant", "control");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-2 bg-black/90 text-white rounded-full px-3 py-2 shadow-2xl backdrop-blur-sm text-xs font-mono">
      <span className="opacity-60">dev ·</span>
      <span className="font-bold">
        {isControl ? "viewing: control (legacy)" : "viewing: variant (live)"}
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
