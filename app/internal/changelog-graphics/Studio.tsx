"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { SCENES } from "./scenes";

export type MessagesByLocale = Record<string, AbstractIntlMessages>;

/** Stage is authored at a fixed 16:9 size; pixelRatio 1.5 → 1920×1080 PNG. */
const STAGE_W = 1280;
const STAGE_H = 720;
const EXPORT_PIXEL_RATIO = 1.5;

const LOCALES = ["en", "fr", "es", "pl"] as const;
type Locale = (typeof LOCALES)[number];

export function Studio({
  messagesByLocale,
}: {
  messagesByLocale: MessagesByLocale;
}) {
  // useSearchParams must sit under Suspense so the build doesn't bail out of
  // static rendering (same reason as VariantDevToggle).
  return (
    <Suspense fallback={null}>
      <StudioInner messagesByLocale={messagesByLocale} />
    </Suspense>
  );
}

function StudioInner({
  messagesByLocale,
}: {
  messagesByLocale: MessagesByLocale;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const scene = SCENES.find((s) => s.id === params.get("scene")) ?? SCENES[0];
  const paramLocale = params.get("locale") as Locale | null;
  const locale: Locale =
    paramLocale && LOCALES.includes(paramLocale) ? paramLocale : "en";
  // During "Download all", each locale is rendered and captured in turn.
  const [localeOverride, setLocaleOverride] = useState<Locale | null>(null);
  const renderLocale = localeOverride ?? locale;
  const stageRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  function setParams(sceneId: string, loc: Locale) {
    router.replace(`?scene=${sceneId}&locale=${loc}`);
  }

  function saveDataUrl(filename: string, dataUrl: string) {
    const a = document.createElement("a");
    a.download = filename;
    a.href = dataUrl;
    a.click();
  }

  async function capture(): Promise<string> {
    const { toPng } = await import("html-to-image");
    return toPng(stageRef.current!, { pixelRatio: EXPORT_PIXEL_RATIO });
  }

  async function download() {
    if (!stageRef.current || busy) return;
    setBusy(true);
    try {
      // First call warms font/image inlining (known first-call blank quirk
      // in some browsers); the second one is the real export.
      await capture();
      saveDataUrl(`changelog-${scene.id}-${locale}.png`, await capture());
    } finally {
      setBusy(false);
    }
  }

  async function downloadAll() {
    if (!stageRef.current || busy) return;
    setBusy(true);
    try {
      await capture(); // warm-up
      for (const loc of LOCALES) {
        setLocaleOverride(loc);
        // Yield so React commits the locale switch before capturing.
        await new Promise((r) => setTimeout(r, 300));
        saveDataUrl(`changelog-${scene.id}-${loc}.png`, await capture());
      }
    } finally {
      setLocaleOverride(null);
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#111113] p-6 sm:p-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="mb-6 flex flex-wrap items-center gap-4">
          <div className="mr-auto">
            <h1 className="text-lg font-bold text-white">
              Changelog graphics
            </h1>
            <p className="text-sm text-white/50">
              Internal, dev-only. Export is {STAGE_W * EXPORT_PIXEL_RATIO}×
              {STAGE_H * EXPORT_PIXEL_RATIO} (16:9).
            </p>
          </div>
          <div className="flex overflow-hidden rounded-lg border border-white/15">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                onClick={() => setParams(scene.id, loc)}
                className={
                  loc === renderLocale
                    ? "h-10 bg-white/15 px-4 text-sm font-bold text-white"
                    : "h-10 px-4 text-sm text-white/60 hover:text-white"
                }
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>
          <select
            value={scene.id}
            onChange={(e) => setParams(e.target.value, locale)}
            className="h-10 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white outline-none focus:border-white/40"
          >
            {SCENES.map((s) => (
              <option key={s.id} value={s.id} className="bg-[#111113]">
                {s.release} — {s.title}
              </option>
            ))}
          </select>
          <button
            onClick={download}
            disabled={busy}
            className="h-10 rounded-lg bg-[var(--accent)] px-5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Exporting…" : `Download ${locale.toUpperCase()}`}
          </button>
          <button
            onClick={downloadAll}
            disabled={busy}
            className="h-10 rounded-lg border border-white/25 px-5 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
          >
            Download all locales
          </button>
        </header>

        <ScaleToFit>
          <div
            ref={stageRef}
            style={{ width: STAGE_W, height: STAGE_H }}
            className="relative overflow-hidden"
          >
            <NextIntlClientProvider
              locale={renderLocale}
              messages={messagesByLocale[renderLocale]}
            >
              <scene.Component />
            </NextIntlClientProvider>
          </div>
        </ScaleToFit>
      </div>
    </main>
  );
}

/**
 * Fits the fixed-size stage into the viewport with a CSS transform on an
 * ANCESTOR of the capture node — html-to-image clones only the stage subtree,
 * so the preview scaling never affects the exported pixels.
 */
function ScaleToFit({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setScale(Math.min(1, width / STAGE_W));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height: STAGE_H * scale }}
    >
      <div
        className="shadow-2xl"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
