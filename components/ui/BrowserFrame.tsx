import type { ReactNode } from "react";

/** Browser window chrome around a dashboard capture. Neutral dots: the capture brings its own colours. */
export function BrowserFrame({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="bg-white card-stamp rounded-2xl overflow-hidden">
      <div className="relative flex items-center px-5 py-3.5 bg-[var(--muted)] border-b border-[var(--border)]">
        <div className="flex gap-2 absolute left-5" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <div key={dot} className="w-3 h-3 rounded-full bg-[var(--border)]" />
          ))}
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-[var(--background)] rounded-lg px-4 py-1.5 text-xs text-[var(--muted-foreground)] border border-[var(--border)]">
            app.stampeo.app
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
