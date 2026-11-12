import { APP, PhoneScreen } from "./AppScreen";

/**
 * The two screens of the team toggle, on the same iPhone as the Scanner loop,
 * cut short. The words are the Scanner app's own English strings
 * (scanner-app `src/locales/en/join.json` and `stamp.json`).
 */

/** A team code as the join screen shows it: six characters from the app's alphabet, with no 0, O, 1, I, L or U to misread. */
const CODE = ["H", "7", "K", "3", "M", "P"];

/** What staff see first: the code from the Team page, typed into six cells, then the one action. */
export function JoinCodeMini() {
  return (
    <PhoneScreen
      label="The Scanner app's team code screen: six characters typed and a Find my shop button."
      background={APP.paper}
    >
      <p className="text-[21px] leading-[25px] font-extrabold tracking-[-0.025em]" style={{ color: APP.ink }}>
        Enter your team code
      </p>
      <p className="mt-1.5 text-[11.5px] leading-[16px]" style={{ color: APP.muted }}>
        Six characters, from whoever runs Stampeo at your shop.
      </p>
      <p className="mt-5 text-[9px] font-bold tracking-[0.12em] uppercase" style={{ color: APP.muted }}>
        Team code
      </p>
      <div className="mt-1.5 flex gap-1.5">
        {CODE.map((char, index) => (
          <span
            key={index}
            className="flex h-[40px] flex-1 items-center justify-center rounded-[10px] border-[1.5px] text-[18px] font-extrabold tabular-nums"
            style={{ backgroundColor: APP.field, borderColor: APP.ink, color: APP.ink }}
          >
            {char}
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
      <p className="mt-2.5 text-[10.5px] leading-[14px]" style={{ color: APP.muted }}>
        Ask your manager if you don&apos;t have it yet.
      </p>
    </PhoneScreen>
  );
}

/** What an owner or admin sees when a customer has reached the day's limit: the way through, and the way out. */
export function LimitMini() {
  return (
    <PhoneScreen label="The Scanner app telling an owner that Sophie reached the daily limit, with an Add anyway button and a Scan next customer button.">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-[54px] w-[54px] items-center justify-center rounded-full" style={{ backgroundColor: APP.amberTint }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={APP.amber} strokeWidth="2.6" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M5.6 5.6l12.8 12.8" />
          </svg>
        </span>
        <p className="mt-2.5 text-[19px] leading-[23px] font-bold" style={{ color: "#1a1a1a" }}>
          Daily limit reached
        </p>
        <p className="mt-0.5 text-[11.5px]" style={{ color: "#6b7280" }}>
          Sophie
        </p>
        <p className="mt-3 text-[11.5px] leading-[16px]" style={{ color: "#374151" }}>
          Your program limits each customer to 3 per day.
        </p>
        <p className="mt-1 text-[10.5px] leading-[14px]" style={{ color: "#9ca3af" }}>
          You can let this one through.
        </p>
        <span
          className="mt-4 flex h-[40px] w-full items-center justify-center rounded-[12px] border-[1.5px] text-[13px] font-semibold"
          style={{ borderColor: APP.amber, color: APP.amber }}
        >
          Add anyway
        </span>
        <span
          className="mt-2 flex h-[40px] w-full items-center justify-center rounded-[12px] border text-[13px] font-semibold"
          style={{ backgroundColor: "#f3f4f6", borderColor: "#e5e7eb", color: "#374151" }}
        >
          Scan next customer
        </span>
      </div>
    </PhoneScreen>
  );
}
