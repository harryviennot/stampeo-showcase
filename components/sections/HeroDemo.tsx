"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { Segmented } from "../ui/Segmented";
import { AppleIcon, GoogleIcon } from "../icons";
import { useDemoSession } from "@/hooks/useDemoSession";
import { useIsMobilePhone } from "@/hooks/useIsMobilePhone";
import type { RewardTier, PointsRewardIcons } from "@/lib/types/design";
import { STAMPEO_LOGO } from "@/lib/stampeo-card";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Points demo ladder: mid reward at 60, top reward at 120 (matches the backend
// demo). PointsStrip renders thresholds + icons (percent for the mid reward,
// crown for the top), not names, so the names are only used off-card.
const POINTS_MID = 60;
const POINTS_TOP = 120;
const POINTS_STEP = 20;
const POINTS_REWARD_ICONS: PointsRewardIcons = {
  r_mid: { type: "preset", ref: "percent" },
  r_top: { type: "preset", ref: "crown" },
};

function StampButton({
  onClick,
  stamps,
  isDisabled,
  t,
}: {
  onClick: () => void;
  stamps: number;
  isDisabled: boolean;
  t: ReturnType<typeof useTranslations<"landing.hero">>;
}) {
  const isComplete = stamps >= 8;

  return (
    <div className="relative mt-6 max-w-[380px] mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-[var(--accent)]/10">
        <div className="text-center mb-4">
          <p className="text-sm font-bold text-[var(--muted-foreground)]">
            {isComplete
              ? t("stamp.complete")
              : t("stamp.ready")}
          </p>
        </div>

        {isComplete ? (
          <Link
            href="/onboarding"
            className="block w-full py-4 rounded-full font-bold text-lg transition-all text-center bg-[var(--accent)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:scale-[0.98] animate-pulse"
          >
            {t("stamp.claimFree")}
          </Link>
        ) : (
          <button
            onClick={onClick}
            disabled={isDisabled}
            className={`
              w-full py-4 rounded-full font-bold text-lg transition-all
              ${isDisabled
                ? "bg-gray-200 text-gray-400 cursor-wait"
                : "bg-[var(--accent)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:scale-[0.98]"
              }
            `}
          >
            {t("stamp.addStamp")}
          </button>
        )}

        <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
          {t("stamp.watchPhone")}
        </p>
      </div>
    </div>
  );
}

function PointsScanButton({
  onClick,
  points,
  isDisabled,
  t,
}: {
  onClick: () => void;
  points: number;
  isDisabled: boolean;
  t: ReturnType<typeof useTranslations<"landing.hero">>;
}) {
  const isComplete = points >= POINTS_TOP;

  return (
    <div className="relative mt-6 max-w-[380px] mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-[var(--accent)]/10">
        <div className="text-center mb-4">
          <p className="text-sm font-bold text-[var(--muted-foreground)]">
            {isComplete ? t("points.complete") : t("points.ready")}
          </p>
        </div>

        {isComplete ? (
          <Link
            href="/onboarding"
            className="block w-full py-4 rounded-full font-bold text-lg transition-all text-center bg-[var(--accent)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:scale-[0.98] animate-pulse"
          >
            {t("points.claimReward")}
          </Link>
        ) : (
          <button
            onClick={onClick}
            disabled={isDisabled}
            className={`
              w-full py-4 rounded-full font-bold text-lg transition-all
              ${isDisabled
                ? "bg-gray-200 text-gray-400 cursor-wait"
                : "bg-[var(--accent)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:scale-[0.98]"
              }
            `}
          >
            {t("points.scanButton")}
          </button>
        )}

        <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
          {t("points.watchPhone")}
        </p>
      </div>
    </div>
  );
}

function MobileWalletButton({
  sessionToken,
  t,
  prefix,
}: {
  sessionToken: string | null;
  t: ReturnType<typeof useTranslations<"landing.hero">>;
  prefix: "stamp" | "points";
}) {
  if (!sessionToken) return null;

  const passUrl = `${API_URL}/demo/pass/${sessionToken}`;

  return (
    <div className="relative mt-6 max-w-[380px] mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-[var(--accent)]/10">
        <a
          href={passUrl}
          className="block w-full py-4 px-4 rounded-full font-bold text-sm sm:text-base transition-all text-center bg-[var(--accent)] text-white hover:scale-[1.02] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:scale-[0.98]"
        >
          {t(`${prefix}.mobileAddWallet`)}
        </a>
        <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
          {t(`${prefix}.mobileHint`)}
        </p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <AppleIcon className="w-4 h-4" />
            <span>Apple Wallet</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <GoogleIcon className="w-4 h-4" />
            <span>Google Wallet</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoStatusHint({
  status,
  t,
  prefix,
}: {
  status: string;
  t: ReturnType<typeof useTranslations<"landing.hero">>;
  prefix: "stamp" | "points";
}) {
  if (status === "pending") {
    return (
      <div className="relative mt-6 max-w-[380px] mx-auto">
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-[var(--accent)]/10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            {t.rich(`${prefix}.scanQR`, {
              bold: (chunks) => <span className="font-semibold">{chunks}</span>,
            })}
          </p>
        </div>
      </div>
    );
  }

  if (status === "pass_downloaded") {
    return (
      <div className="relative mt-6 max-w-[380px] mx-auto">
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 border border-[var(--accent)]/10 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            <span className="inline-block animate-pulse mr-2">⏳</span>
            {t(`${prefix}.addToWallet`)}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function useOfflineStampAnimation(isOffline: boolean, totalStamps: number) {
  const [animatedStamps, setAnimatedStamps] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOffline) return;

    const startDelay = setTimeout(() => {
      let current = 0;
      timerRef.current = setInterval(() => {
        current += 1;
        setAnimatedStamps(current);
        if (current >= totalStamps) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 400);
    }, 800);

    return () => {
      clearTimeout(startDelay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOffline, totalStamps]);

  return animatedStamps;
}

// Offline fallback for the points card: steps 0 -> 120 in +20 increments so the
// hero still animates if the demo backend is unreachable. Mirrors the stamp
// offline animation.
function useOfflinePointsAnimation(isOffline: boolean) {
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOffline) return;

    const startDelay = setTimeout(() => {
      let current = 0;
      timerRef.current = setInterval(() => {
        current += POINTS_STEP;
        setAnimatedPoints(current);
        if (current >= POINTS_TOP) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 550);
    }, 800);

    return () => {
      clearTimeout(startDelay);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOffline]);

  return animatedPoints;
}

export function HeroDemo() {
  const stamp = useDemoSession();
  const t = useTranslations("landing.hero");
  const tCommon = useTranslations("common");
  const isMobilePhone = useIsMobilePhone();

  // Which engine the visitor is previewing. "stamps" is the eager, real demo;
  // "points" lazy-inits its own real session the first time it's selected, so
  // stamp-only visitors never create a points session.
  const [mode, setMode] = useState<"stamps" | "points">("stamps");
  const [pointsActivated, setPointsActivated] = useState(false);

  // Latch the points session on first selection (kept alive afterwards) so
  // stamp-only visitors never create a points session.
  const handleModeChange = (value: "stamps" | "points") => {
    setMode(value);
    if (value === "points") setPointsActivated(true);
  };

  const points = useDemoSession({ cardType: "points", enabled: pointsActivated });

  // Stamp offline fallback (unchanged)
  const [qrTimedOut, setQrTimedOut] = useState(false);
  useEffect(() => {
    if (!stamp.isLoading && !stamp.isStamping) return;
    const timer = setTimeout(() => setQrTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [stamp.isLoading, stamp.isStamping]);

  const isOffline = !stamp.isLoading && stamp.status === "error";
  const showFakeDemo = isOffline || (qrTimedOut && !stamp.qrUrl);
  const offlineStamps = useOfflineStampAnimation(showFakeDemo, 8);
  const displayStamps = showFakeDemo ? offlineStamps : stamp.stamps;

  // Points offline fallback (only after the points session is activated)
  const [pointsQrTimedOut, setPointsQrTimedOut] = useState(false);
  useEffect(() => {
    if (!pointsActivated) return;
    if (!points.isLoading && !points.isStamping) return;
    const timer = setTimeout(() => setPointsQrTimedOut(true), 3000);
    return () => clearTimeout(timer);
  }, [pointsActivated, points.isLoading, points.isStamping]);

  const pointsOffline = pointsActivated && !points.isLoading && points.status === "error";
  const showFakePoints = pointsOffline || (pointsActivated && pointsQrTimedOut && !points.qrUrl);
  const offlinePoints = useOfflinePointsAnimation(showFakePoints);
  const displayPoints = showFakePoints ? offlinePoints : points.points;

  const pointsRewards: RewardTier[] = [
    { id: "r_mid", name: t("points.rewardMid"), threshold: POINTS_MID },
    { id: "r_top", name: t("points.rewardTop"), threshold: POINTS_TOP },
  ];
  const pointsRewardValue =
    displayPoints >= POINTS_TOP
      ? t("points.rewardAllUnlocked")
      : displayPoints >= POINTS_MID
        ? t("points.rewardTop")
        : t("points.rewardMid");

  return (
    <>
      {/* Engine toggle: stamps (real interactive demo) vs points (real demo,
          lazy-initialized on first selection) */}
      <div className="w-full max-w-[380px] mb-5">
        <Segmented
          ariaLabel={t("demoToggleLabel")}
          options={[
            { value: "stamps", label: tCommon("stamps") },
            { value: "points", label: tCommon("points") },
          ]}
          value={mode}
          onChange={handleModeChange}
        />
      </div>

      {/* Both branches stay mounted, stacked in one grid cell: the wrapper
          keeps the height of the tallest branch, so toggling never resizes
          the hero (no flash or jiggle on mobile) and neither live session is
          torn down. The inactive branch crossfades out; visibility flips at the
          end of the fade so it can't be tapped. */}
      <div className="grid w-full justify-items-center">
        <div
          className={`col-start-1 row-start-1 w-full flex flex-col items-center transition-[opacity,visibility,transform] duration-300 ease-out ${
            mode === "stamps"
              ? "opacity-100"
              : "opacity-0 invisible pointer-events-none -translate-y-1"
          }`}
          aria-hidden={mode !== "stamps"}
        >
          {/* Desktop demo hint */}
          {!isMobilePhone && !showFakeDemo && stamp.status !== "pass_installed" && stamp.status !== "pass_downloaded" && (
            <p className="text-base font-bold text-[var(--foreground)] mb-4 text-center">
              {t("stamp.demoCallout")}
              <svg className="inline-block w-5 h-5 text-[var(--accent)] animate-bounce ml-1.5 -mb-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </p>
          )}

          <div className="w-full max-w-[380px]">
            <ScaledCardWrapper baseWidth={280} targetWidth={380}>
              <WalletCard
                design={{
                  organization_name: "Stampeo",
                  total_stamps: 8,
                  background_color: "#1c1c1e",
                  stamp_filled_color: "#f97316",
                  label_color: "#fff",
                  logo_url: STAMPEO_LOGO,
                  secondary_fields: [
                    { key: "reward", label: tCommon("reward"), value: displayStamps === 8 ? tCommon("rewarded") : tCommon("rewardText") }
                  ],
                }}
                stamps={displayStamps}
                showQR={!isMobilePhone}
                qrUrl={stamp.qrUrl}
                isQRLoading={!qrTimedOut && (stamp.isLoading || stamp.isStamping)}
                interactive3D={true}
              />
            </ScaledCardWrapper>
          </div>

          {/* Demo controls */}
          {isMobilePhone ? (
            stamp.status === "pass_installed" ? (
              <StampButton onClick={stamp.addStamp} stamps={stamp.stamps} isDisabled={stamp.isStamping} t={t} />
            ) : stamp.status === "pass_downloaded" ? (
              <DemoStatusHint status={stamp.status} t={t} prefix="stamp" />
            ) : (
              <MobileWalletButton sessionToken={stamp.sessionToken} t={t} prefix="stamp" />
            )
          ) : (
            stamp.status === "pass_installed" ? (
              <StampButton onClick={stamp.addStamp} stamps={stamp.stamps} isDisabled={stamp.isStamping} t={t} />
            ) : (
              <DemoStatusHint status={stamp.status} t={t} prefix="stamp" />
            )
          )}
        </div>

        <div
          className={`col-start-1 row-start-1 w-full flex flex-col items-center transition-[opacity,visibility,transform] duration-300 ease-out ${
            mode === "points"
              ? "opacity-100"
              : "opacity-0 invisible pointer-events-none -translate-y-1"
          }`}
          aria-hidden={mode !== "points"}
        >
          {/* Desktop demo hint */}
          {!isMobilePhone && !showFakePoints && points.status !== "pass_installed" && points.status !== "pass_downloaded" && (
            <p className="text-base font-bold text-[var(--foreground)] mb-4 text-center">
              {t("points.demoCallout")}
              <svg className="inline-block w-5 h-5 text-[var(--accent)] animate-bounce ml-1.5 -mb-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
              </svg>
            </p>
          )}

          <div className="w-full max-w-[380px]">
            <ScaledCardWrapper baseWidth={280} targetWidth={380}>
              <WalletCard
                design={{
                  organization_name: "Stampeo",
                  card_type: "points",
                  points_strip_style: "progress_icons",
                  background_color: "#1c1c1e",
                  progress_accent_color: "#f97316",
                  label_color: "#fff",
                  logo_url: STAMPEO_LOGO,
                  points_reward_icons: POINTS_REWARD_ICONS,
                  secondary_fields: [
                    { key: "reward", label: tCommon("reward"), value: pointsRewardValue },
                  ],
                }}
                pointsBalance={displayPoints}
                pointsRewards={pointsRewards}
                showQR={!isMobilePhone}
                qrUrl={points.qrUrl}
                isQRLoading={!pointsQrTimedOut && (points.isLoading || points.isStamping)}
                interactive3D={true}
              />
            </ScaledCardWrapper>
          </div>

          {/* Demo controls (mirror the stamp branch) */}
          {isMobilePhone ? (
            points.status === "pass_installed" ? (
              <PointsScanButton onClick={points.scan} points={points.points} isDisabled={points.isStamping} t={t} />
            ) : points.status === "pass_downloaded" ? (
              <DemoStatusHint status={points.status} t={t} prefix="points" />
            ) : (
              <MobileWalletButton sessionToken={points.sessionToken} t={t} prefix="points" />
            )
          ) : (
            points.status === "pass_installed" ? (
              <PointsScanButton onClick={points.scan} points={points.points} isDisabled={points.isStamping} t={t} />
            ) : (
              <DemoStatusHint status={points.status} t={t} prefix="points" />
            )
          )}
        </div>
      </div>
    </>
  );
}
