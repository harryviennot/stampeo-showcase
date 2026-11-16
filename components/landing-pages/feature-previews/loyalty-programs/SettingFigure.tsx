import type { SourcedFigure } from "@/lib/landing-pages/copy/types";

/** The study behind the welcome gift: its number large, what it counted, and where it comes from, always together. */
export function SettingFigure({ figure }: Readonly<{ figure: SourcedFigure }>) {
  return (
    <figure className="mt-8 flex flex-col items-center gap-2 text-center lg:mt-10">
      <div className="flex flex-col items-center gap-1 sm:flex-row sm:gap-5">
        {figure.value && (
          <span className="text-[3.5rem] leading-none font-bold tracking-[-0.03em] text-[var(--accent)] lg:text-[4rem]">{figure.value}</span>
        )}
        <p className="max-w-md text-base text-pretty text-[var(--foreground)] sm:text-left">{figure.text}</p>
      </div>
      <figcaption className="max-w-xl text-xs text-pretty text-[var(--muted-foreground)]">{figure.source}</figcaption>
    </figure>
  );
}
