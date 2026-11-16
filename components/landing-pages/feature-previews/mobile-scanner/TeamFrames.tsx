"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IPhone } from "@/components/ui/IPhone";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { TEAM_CODE, TYPE_STEP_MS, codeBoxes, typesIn } from "@/lib/landing-pages/previews/team-code";
import { APP } from "./appColors";

/**
 * The three frames of the team strip: the owner's Team page giving out a code, the staff phone asking for it, and the
 * Scanner ready to scan. The words are the dashboard's and the Scanner app's own English strings (web `team.json`,
 * scanner-app `join.json` and `scanner.json`).
 */

/** The phone is drawn this wide and cut at `CUT` px, so its screen ends where its words do. */
const PHONE = 250;
const CUT =
  "-mx-8 -mt-6 flex max-h-[390px] justify-center overflow-hidden px-8 pt-6 [mask-image:linear-gradient(to_bottom,#000_88%,transparent)]";

/** A phone and what is on its screen, as one picture with a name; the screen's own words are for the eye. */
function Phone({
  label,
  background,
  statusBar = "light",
  children,
}: Readonly<{ label: string; background: string; statusBar?: "light" | "dark"; children: ReactNode }>) {
  return (
    <div className={CUT}>
      <div role="img" aria-label={label}>
        <IPhone width={PHONE} statusBar={statusBar} screenBackground={background}>
          <div aria-hidden className="h-full">
            {children}
          </div>
        </IPhone>
      </div>
    </div>
  );
}

/** A copy icon, as the dashboard draws it on a code's button. */
function CopyGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden>
      <path d="M216 32H88a8 8 0 00-8 8v40H40a8 8 0 00-8 8v128a8 8 0 008 8h128a8 8 0 008-8v-40h40a8 8 0 008-8V40a8 8 0 00-8-8zm-56 176H48V96h112zm48-48h-32V88a8 8 0 00-8-8H96V48h112z" />
    </svg>
  );
}

/** The grouped code the dashboard prints: three characters, a dash, three. */
const GROUPED = `${TEAM_CODE.slice(0, 3)}-${TEAM_CODE.slice(3)}`;

/** The owner's side: the window that gives a new team member their code, on the dashboard's white. */
export function TeamPageFrame() {
  return (
    <div
      role="img"
      aria-label="The Team page's Add a team member window, with a six-character team code and a Copy button."
      className="w-[280px] rounded-2xl bg-white p-5 text-left shadow-[0_2px_4px_rgba(25,18,16,0.05),0_24px_48px_-24px_rgba(25,18,16,0.32)] ring-1 ring-black/[0.06]"
    >
      <div aria-hidden>
        <p className="text-[17px] leading-6 font-bold text-[var(--foreground)]">Add a team member</p>
        <p className="mt-1 text-[13px] leading-[18px] text-[var(--muted-foreground)]">Hand this over and they&apos;re in.</p>
        <p className="mt-4 text-[13px] leading-[18px] text-[var(--muted-foreground)]">Give this code to Marie</p>
        <div className="mt-2 flex items-center justify-center gap-1.5 rounded-xl bg-white py-5 ring-1 ring-[var(--border)]">
          <span className="font-mono text-[28px] leading-8 font-bold tracking-[0.12em] tabular-nums text-[var(--foreground)]">{GROUPED}</span>
          <span aria-label="Copy" className="flex h-11 w-11 items-center justify-center rounded-lg text-[var(--foreground)]">
            <CopyGlyph />
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * The staff phone's team code screen with the code typed in, one character every 120ms once the phone is on screen
 * (it is already entered on the server and for a reader who asks for less motion).
 */
export function StaffPhoneFrame() {
  const reducedMotion = usePrefersReducedMotion();
  // Null until the phone is on screen and typing starts: the code is already entered.
  const [typing, setTyping] = useState<number | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const typed = reducedMotion || typing === null ? TEAM_CODE.length : typing;

  useEffect(() => {
    const element = frame.current;
    if (!element || !typesIn(reducedMotion)) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let count = 0;

        setTyping(0);
        timer = setInterval(() => {
          count += 1;
          setTyping(count);
          if (count >= TEAM_CODE.length) clearInterval(timer);
        }, TYPE_STEP_MS);
      },
      { threshold: 0.6 },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [reducedMotion]);

  return (
    <div ref={frame}>
      <Phone label="The Scanner app's team code screen: six characters typed and a Find my shop button." background={APP.paper}>
        <div className="px-4" style={{ paddingTop: "calc(var(--iphone-safe-top) + 14px)" }}>
          <p className="text-[22px] leading-[26px] font-extrabold tracking-[-0.025em]" style={{ color: APP.ink }}>
            Enter your team code
          </p>
          <p className="mt-1.5 text-[12px] leading-[16px]" style={{ color: APP.muted }}>
            Six characters, from whoever runs Stampeo at your shop.
          </p>
          <p className="mt-5 text-[11px] font-bold tracking-[0.12em] uppercase" style={{ color: APP.muted }}>
            Team code
          </p>
          <div className="mt-1.5 flex gap-1.5">
            {codeBoxes(TEAM_CODE, typed).map(({ char, typed: filled }, index) => (
              <span
                key={index}
                className="flex h-[42px] flex-1 items-center justify-center rounded-[10px] border-[1.5px] text-[19px] font-extrabold tabular-nums"
                style={{ backgroundColor: APP.field, borderColor: filled ? APP.ink : APP.line, color: APP.ink }}
              >
                {filled ? char : ""}
              </span>
            ))}
          </div>
          <span
            className="mt-4 flex h-[46px] items-center justify-between rounded-[12px] px-4 text-[14px] font-bold text-white"
            style={{ backgroundColor: APP.orange }}
          >
            Find my shop
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
          <p className="mt-2.5 text-[12px] leading-[15px]" style={{ color: APP.muted }}>
            Ask your manager if you don&apos;t have it yet.
          </p>
        </div>
      </Phone>
    </div>
  );
}

/** Four white corner brackets round the square the camera reads a QR code in. */
function Viewfinder() {
  const corner = "absolute h-6 w-6 border-white";

  return (
    <div className="relative h-[130px] w-[130px]">
      <span className={`${corner} top-0 left-0 rounded-tl-[3px] border-t-[3px] border-l-[3px]`} />
      <span className={`${corner} top-0 right-0 rounded-tr-[3px] border-t-[3px] border-r-[3px]`} />
      <span className={`${corner} bottom-0 left-0 rounded-bl-[3px] border-b-[3px] border-l-[3px]`} />
      <span className={`${corner} right-0 bottom-0 rounded-br-[3px] border-r-[3px] border-b-[3px]`} />
    </div>
  );
}

/** The Scanner once a member has joined: the shop's bar over the camera, a viewfinder and the instruction the app prints. */
export function ScannerReadyFrame() {
  return (
    <Phone
      label="The Scanner app, ready: the camera open on a viewfinder, with Point camera at the customer loyalty card QR code."
      background="#1b1411"
      statusBar="dark"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2.5 px-3.5 pb-3" style={{ backgroundColor: APP.brand, paddingTop: "calc(var(--iphone-safe-top) + 4px)" }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/25">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </span>
          <div className="leading-tight text-white">
            <p className="text-[15px] font-bold">Aurevo</p>
            <p className="text-[12px] opacity-80">Scanner</p>
          </div>
        </div>
        <div className="relative flex flex-1 items-start justify-center pt-8" style={{ background: "radial-gradient(120% 70% at 70% 30%, #3b2a22 0%, #1b1411 60%)" }}>
          <Viewfinder />
          <p className="absolute inset-x-3 top-[178px] rounded-2xl bg-black/70 px-3 py-2 text-center text-[12px] leading-4 font-medium text-white">
            Point camera at the customer loyalty card QR code
          </p>
        </div>
      </div>
    </Phone>
  );
}
