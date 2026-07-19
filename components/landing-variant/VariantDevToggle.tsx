"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useRouter as useLocaleRouter } from "@/i18n/navigation";

/**
 * Dev-only floating switcher for the landing variants + country pilots, so we
 * can flip between them in one click. Rendered only when NODE_ENV=development.
 *
 *   int (fr)  →  /            int (en)  →  /en
 *   uk        →  /uk          us        →  /us
 *   control   →  /?variant=control  (legacy landing)
 *
 * The homepage locale is resolved from the NEXT_LOCALE cookie, so "int · fr" /
 * "int · en" go through next-intl's router (it sets that cookie); otherwise an
 * English browser just 307s back to /en and you can never reach the FR page.
 * The pilots (/uk, /us) are plain hard navigations — the middleware serves them.
 */
type Target = { key: string; label: string; locale?: "fr" | "en"; href?: string };

const TARGETS: Target[] = [
  { key: "int-fr", label: "int · fr", locale: "fr" },
  { key: "int-en", label: "int · en", locale: "en" },
  { key: "uk", label: "uk", href: "/uk" },
  { key: "us", label: "us", href: "/us" },
  { key: "control", label: "control", href: "/?variant=control" },
];

export function VariantDevToggle() {
  const router = useRouter();
  const localeRouter = useLocaleRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (process.env.NODE_ENV !== "development") return null;

  const isControl = searchParams.get("variant") === "control";
  const current = isControl
    ? "control"
    : pathname === "/uk" || pathname.endsWith("/uk")
      ? "uk"
      : pathname === "/us" || pathname.endsWith("/us")
        ? "us"
        : pathname.startsWith("/en")
          ? "int-en"
          : "int-fr";

  const go = (t: Target) => {
    if (t.locale) {
      // next-intl sets NEXT_LOCALE + navigates to the homepage in that locale.
      localeRouter.push("/", { locale: t.locale });
    } else if (t.href) {
      // Literal path (the middleware serves /uk, /us); plain router keeps it verbatim.
      router.push(t.href);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] flex items-center gap-1 bg-black/90 text-white rounded-full px-2 py-1.5 shadow-2xl backdrop-blur-sm text-xs font-mono">
      <span className="opacity-60 px-1">dev ·</span>
      {TARGETS.map((tgt) => {
        const active = tgt.key === current;
        return (
          <button
            key={tgt.key}
            onClick={() => go(tgt)}
            className={`px-2.5 py-1 rounded-full font-bold transition-all active:scale-95 ${
              active
                ? "bg-[var(--accent)] text-white"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {tgt.label}
          </button>
        );
      })}
    </div>
  );
}
