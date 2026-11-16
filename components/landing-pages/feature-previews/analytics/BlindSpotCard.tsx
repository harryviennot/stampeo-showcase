import { INK } from "./ink";

/** Both faces share one grid cell, so the card is as tall as the taller of the two, and never shows the one it is turned away from. */
const FACE =
  "col-start-1 row-start-1 flex min-h-[168px] flex-col rounded-[20px] card-stamp p-4 text-left sm:min-h-[196px] sm:p-6 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]";

/** A card turns about its vertical axis on a phone and its horizontal one from `md`, as production's cards do. */
const TURN = "[--flip:rotateY(180deg)] md:[--flip:rotateX(180deg)]";

/**
 * One blind-spot card: a stamped question that turns over to its answer. The paper face is the question and a
 * handwritten ???; the Stampeo face is the answer in the dashboard's figure type. The card is one button, and a
 * screen reader reads only the face that is showing.
 */
export function BlindSpotCard({
  cardKey,
  question,
  unknown,
  figure,
  trend,
  line,
  word = false,
  flipped,
  delayMs,
  durationMs,
  onFlip,
}: Readonly<{
  cardKey: string;
  question: string;
  unknown: string;
  figure: string;
  trend?: string;
  line: string;
  /** The answer is a word, so its figure is set smaller than a number. */
  word?: boolean;
  flipped: boolean;
  delayMs: number;
  durationMs: number;
  onFlip: () => void;
}>) {
  return (
    <li data-card={cardKey} className="[perspective:1000px]">
      <button
        type="button"
        aria-pressed={flipped}
        onClick={onFlip}
        className="block min-h-14 w-full rounded-[20px] text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
      >
        <span
          className={`grid transition-transform ease-in-out motion-reduce:transition-none ${TURN} [transform-style:preserve-3d]`}
          style={{
            transitionDuration: `${durationMs}ms`,
            transitionDelay: `${delayMs}ms`,
            transform: flipped ? "var(--flip)" : undefined,
          }}
        >
          <span data-face="paper" aria-hidden={flipped} className={`${FACE} bg-white`}>
            <span className="block text-[15px] leading-snug font-semibold text-[var(--foreground)] sm:text-[17px]">{question}</span>
            <span
              className="ink-figure mt-auto block origin-left -rotate-3 pt-3"
              style={{ color: "rgba(25, 18, 16, 0.3)", fontSize: "clamp(2.25rem, 1rem + 5vw, 3.5rem)" }}
            >
              {unknown}
            </span>
          </span>

          <span data-face="stampeo" aria-hidden={!flipped} className={`${FACE} bg-[#fff6ec]`} style={{ transform: "var(--flip)" }}>
            <span className="block text-[12px] leading-4 text-[var(--muted-foreground)] sm:text-[13px]">{question}</span>
            <span className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span
                className={`font-semibold tracking-[-0.04em] tabular-nums leading-none text-[var(--foreground)] ${
                  word ? "text-[1.625rem] sm:text-[2.5rem]" : "text-[2rem] sm:text-[3rem]"
                }`}
              >
                {figure}
              </span>
              {trend && (
                <span className="text-[13px] font-semibold tabular-nums" style={{ color: INK.up }}>
                  {trend}
                </span>
              )}
            </span>
            <span className="mt-2 block min-h-[2.75em] text-[13px] leading-snug text-pretty text-[var(--muted-foreground)] sm:min-h-0 sm:text-[15px]">{line}</span>
          </span>
        </span>
      </button>
    </li>
  );
}
