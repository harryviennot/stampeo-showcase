import type { CSSProperties, ReactNode } from "react";
import { APP } from "./appColors";
import { StampsScreen } from "./CounterScreens";

/** The picture is drawn at this size and shrunk by `--s`. */
const CANVAS = { width: 540, height: 450 } as const;

/** `--s` at each width, so the whole picture fits its column. */
const SCALE =
  "[--s:0.53] min-[360px]:[--s:0.6] min-[390px]:[--s:0.66] min-[430px]:[--s:0.74] min-[480px]:[--s:0.83] min-[560px]:[--s:0.94] sm:[--s:1] lg:[--s:0.84] xl:[--s:1.05] min-[1360px]:[--s:1.12]";

const BROWSER = { width: 450, height: 340, bar: 30 } as const;
const WEB_SCANNER_URL = "scan.stampeo.app";

/** A browser window on the web scanner: its address bar, and the Scanner's own screen in the app's colours. */
function BrowserWindow() {
  return (
    <div
      className="absolute top-0 left-0 overflow-hidden rounded-[14px] bg-white shadow-[0_2px_4px_rgba(25,18,16,0.04),0_32px_72px_-24px_rgba(25,18,16,0.22)] ring-1 ring-[var(--border)]"
      style={{ width: BROWSER.width, height: BROWSER.height }}
    >
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-white px-4" style={{ height: BROWSER.bar }}>
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-black/15" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-black/15" />
        <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-black/15" />
        <span className="mx-auto rounded-full bg-[var(--background-subtle)] px-4 py-px text-xs font-medium text-[var(--muted-foreground)]">
          {WEB_SCANNER_URL}
        </span>
        <span aria-hidden className="w-[46px]" />
      </div>
      <div style={{ backgroundColor: APP.surface, height: BROWSER.height - BROWSER.bar }}>
        <div className="ml-[40px] w-[250px] px-4 pt-5">
          <StampsScreen />
        </div>
      </div>
    </div>
  );
}

/**
 * The scanner hero's picture: the web scanner in a browser window, and the Scanner app (the `phone` the page
 * passes, drawn 210px wide) over the window's lower right corner. One picture for a screen reader, named by `alt`.
 */
export function ScannerDuo({ phone, alt }: Readonly<{ phone: ReactNode; alt: string }>) {
  const scaled = { width: `calc(${CANVAS.width}px * var(--s))`, height: `calc(${CANVAS.height}px * var(--s))` } satisfies CSSProperties;

  return (
    <div role="img" aria-label={alt} className={`mx-auto shrink-0 ${SCALE}`} style={scaled}>
      <div
        aria-hidden
        className="relative origin-top-left"
        style={{ width: CANVAS.width, height: CANVAS.height, transform: "scale(var(--s))" }}
      >
        <BrowserWindow />
        <div className="absolute right-0 bottom-0">{phone}</div>
      </div>
    </div>
  );
}
