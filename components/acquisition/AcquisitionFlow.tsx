"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";

import {
  BusinessPublicResponse,
  CardDesignPublicResponse,
  CustomerPublicResponse,
  createPublicCustomer,
  CustomerCreatePublic,
} from "@/lib/acquisition";
import { AcquisitionForm } from "./AcquisitionForm";
import { WalletButtons } from "./WalletButtons";
import { useDevicePlatform, type DevicePlatform } from "@/hooks/useDevicePlatform";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { renderPreviewFields, pickSampleName } from "@/lib/template-variables";
import type { SubmissionFieldError } from "@/lib/signup-validation";

type FlowState = "form" | "submitting" | "success" | "email_sent" | "error" | "not_open";

interface AcquisitionFlowProps {
  business: BusinessPublicResponse;
  cardDesign: CardDesignPublicResponse | null;
  /** From a per-store enrollment URL (`/{slug}/l/{locationSlug}`); tags where the customer signed up. */
  locationSlug?: string | null;
}

export function AcquisitionFlow({ business, cardDesign, locationSlug }: AcquisitionFlowProps) {
  const t = useTranslations("acquisition");
  const locale = useLocale();
  const platform = useDevicePlatform();
  const [flowState, setFlowState] = useState<FlowState>("form");
  const [customerResponse, setCustomerResponse] = useState<CustomerPublicResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // A rejection the backend pinned to one input, handed back to the form so it
  // highlights that field instead of replacing the page with an error card.
  const [serverFieldError, setServerFieldError] = useState<SubmissionFieldError | null>(null);
  // Remembered so the success screen can say "we emailed it to <address>".
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  // Get accent color from business settings or card design
  const accentColor =
    business.settings?.accentColor ||
    (cardDesign?.stamp_filled_color || "#f97316");

  const backgroundColor =
    business.settings?.backgroundColor ||
    (cardDesign?.background_color || "#1c1c1e");

  // Preview state: a brand-new card starts at the program's head-start
  // stamps; without a prestamp we show a few demo stamps so the strip
  // doesn't look empty. Field {{variables}} render with the same numbers
  // (and real program data) so the preview is coherent.
  const isPoints = cardDesign?.card_type === "points";
  const previewStamps =
    cardDesign?.initial_stamps && cardDesign.initial_stamps > 0
      ? cardDesign.initial_stamps
      : 3;

  // Points preview: pick a believable balance partway to the first reward so
  // every strip style (big number, ring, track) shows visible progress.
  const sortedRewards = [...(cardDesign?.points_rewards ?? [])].sort(
    (a, b) => a.threshold - b.threshold
  );
  const previewBalance =
    sortedRewards.length > 0 ? Math.round(sortedRewards[0].threshold * 0.6) : 0;
  const nextReward = sortedRewards.find((r) => r.threshold > previewBalance) ?? null;

  // A believable cardholder name, stable per business (seeded by id) so the
  // preview never shows a raw {{customer_first_name}} placeholder.
  const sampleFirstName = pickSampleName(locale, business.id);

  const previewContext = {
    stampCount: previewStamps,
    totalStamps: cardDesign?.total_stamps ?? 10,
    rewardName: cardDesign?.reward_name,
    businessName: business.name,
    sampleFirstName,
    pointsBalance: previewBalance,
    pointsToNext: nextReward ? Math.max(0, nextReward.threshold - previewBalance) : 0,
    nextRewardName: nextReward?.name,
    nextRewardPoints: nextReward?.threshold,
    lastRewardName: sortedRewards[0]?.name ?? cardDesign?.reward_name,
    pointsLadderCleared: sortedRewards.length > 0 && !nextReward,
    locale,
  };

  const handleSubmit = async (data: CustomerCreatePublic) => {
    setFlowState("submitting");
    setErrorMessage(null);
    setSubmittedEmail(data.email ?? null);

    // On desktop the visitor can't add the card to a phone wallet from here, so
    // ask the backend to also email it (it only sends when an email was given).
    const { data: response, error, code, fieldError } = await createPublicCustomer(
      business.id,
      { ...data, send_email: platform === "desktop" },
      locationSlug
    );

    if (code === "CHECKOUT_REQUIRED") {
      // The business hasn't finished setting up its subscription, so it isn't
      // accepting signups yet. Retrying won't help — show a calm closed state.
      setFlowState("not_open");
      return;
    }

    if (fieldError) {
      // One input is wrong, not the whole attempt: keep the form (and
      // everything typed into it) mounted and point at the offending field.
      setServerFieldError(fieldError);
      setFlowState("form");
      return;
    }

    if (error || !response) {
      setErrorMessage(error || "Something went wrong. Please try again.");
      setFlowState("error");
      return;
    }

    setCustomerResponse(response);

    if (response.status === "exists_email_sent") {
      setFlowState("email_sent");
    } else {
      setFlowState("success");
    }
  };

  const handleRetry = () => {
    setFlowState("form");
    setErrorMessage(null);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        "--business-accent": accentColor,
        "--business-bg": backgroundColor,
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          {business.logo_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: accentColor }}
            >
              {business.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-semibold text-[var(--primary)]">{business.name}</h1>
            {business.settings?.category && (
              <p className="text-sm text-[var(--muted-foreground)] capitalize">
                {business.settings.category}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          {/* Card Preview */}
          <div className="order-2">
            <div className="w-full max-w-[380px] mx-auto">
              <ScaledCardWrapper size="lg">
                <WalletCard
                  design={cardDesign ? {
                    ...cardDesign,
                    logo_text: cardDesign.logo_text ?? undefined,
                    logo_url: cardDesign.logo_url ?? undefined,
                    stamp_icon: cardDesign.stamp_icon ?? undefined,
                    reward_icon: cardDesign.reward_icon ?? undefined,
                    icon_color: cardDesign.icon_color ?? undefined,
                    custom_filled_stamp_url: cardDesign.custom_filled_stamp_url ?? undefined,
                    custom_empty_stamp_url: cardDesign.custom_empty_stamp_url ?? undefined,
                    strip_background_url: cardDesign.strip_background_url ?? undefined,
                    // Points card design — drives the points strip + branch.
                    card_type: cardDesign.card_type ?? undefined,
                    points_strip_style: cardDesign.points_strip_style ?? undefined,
                    progress_accent_color: cardDesign.progress_accent_color ?? undefined,
                    points_reward_icons: cardDesign.points_reward_icons,
                    strip_background_color: cardDesign.strip_background_color ?? undefined,
                    strip_background_opacity: cardDesign.strip_background_opacity,
                    // Substitute {{variables}} with real program data + a
                    // sample cardholder so the preview never shows raw
                    // placeholder syntax.
                    secondary_fields: renderPreviewFields(
                      cardDesign.secondary_fields,
                      previewContext
                    ),
                    auxiliary_fields: renderPreviewFields(
                      cardDesign.auxiliary_fields,
                      previewContext
                    ),
                  } : {
                    organization_name: business.name,
                    background_color: "#1c1c1e",
                    stamp_filled_color: "#f97316",
                    total_stamps: 10,
                  }}
                  organizationName={business.name}
                  stamps={previewStamps}
                  pointsBalance={isPoints ? previewBalance : undefined}
                  pointsRewards={isPoints ? sortedRewards : undefined}
                  showQR={true}
                  interactive3D={true}
                />
              </ScaledCardWrapper>
            </div>
          </div>

          {/* Form / Success / Email Sent */}
          <div className="order-1 min-h-[320px] flex flex-col justify-center">
            {cardDesign ? (
              <>
                {flowState === "form" && (
                  <FormCard
                    business={business}
                    onSubmit={handleSubmit}
                    serverFieldError={serverFieldError}
                  />
                )}

                {flowState === "submitting" && <LoadingCard />}

                {flowState === "success" && customerResponse?.pass_url && (
                  <SuccessCard
                    businessName={business.name}
                    passUrl={customerResponse.pass_url}
                    googleWalletUrl={customerResponse.google_wallet_url}
                    platform={platform}
                    emailedTo={customerResponse.emailed ? submittedEmail : null}
                  />
                )}

                {flowState === "email_sent" && (
                  <EmailSentCard message={customerResponse?.message} />
                )}

                {flowState === "error" && (
                  <ErrorCard message={errorMessage} onRetry={handleRetry} />
                )}

                {flowState === "not_open" && <NotOpenCard />}
              </>
            ) : (
              <NotReadyCard />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          {t("poweredBy")}{" "}
          <a
            href="https://stampeo.app"
            className="font-medium hover:text-[var(--accent)] transition-colors"
          >
            Stampeo
          </a>
        </p>
      </footer>
    </div>
  );
}

// Sub-components

function FormCard({
  business,
  onSubmit,
  serverFieldError,
}: {
  business: BusinessPublicResponse;
  onSubmit: (data: CustomerCreatePublic) => void;
  serverFieldError?: SubmissionFieldError | null;
}) {
  const t = useTranslations("acquisition");
  return (
    <div className="paper-card rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">
        {t("getCard")}
      </h2>
      <p className="text-[var(--muted-foreground)] mb-6">
        {business.settings?.description ||
          t("defaultDescription")}
      </p>
      <AcquisitionForm
        dataCollection={business.settings?.customer_data_collection}
        primaryLocale={business.primary_locale}
        businessName={business.name}
        onSubmit={onSubmit}
        serverFieldError={serverFieldError}
      />
    </div>
  );
}

function LoadingCard() {
  const t = useTranslations("acquisition");
  return (
    <div className="paper-card rounded-2xl p-6 text-center min-h-[280px] flex flex-col items-center justify-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
      <p className="text-[var(--muted-foreground)]">{t("loading")}</p>
    </div>
  );
}

function SuccessCard({
  businessName,
  passUrl,
  googleWalletUrl,
  platform,
  emailedTo,
}: {
  businessName: string;
  passUrl: string;
  googleWalletUrl?: string;
  platform: DevicePlatform;
  /** Set when the backend emailed the card (desktop + email given). */
  emailedTo?: string | null;
}) {
  const t = useTranslations("acquisition");
  const autoTriggered = useRef(false);
  // On a phone we hand off to the OS wallet automatically. `revealButtons`
  // stays false until that hand-off fires, so the visitor sees a calm loading
  // state instead of Apple/Google buttons they're not meant to touch.
  const [revealButtons, setRevealButtons] = useState(false);

  const isDesktop = platform === "desktop";
  // Which wallet URL (if any) we'll auto-open for this device.
  const autoAddUrl =
    platform === "ios"
      ? passUrl
      : platform === "android"
        ? googleWalletUrl ?? null
        : null;

  // The card is ready, so on a phone we kick off the native "Add to Wallet"
  // flow automatically. Navigating to the Apple .pkpass URL makes iOS present
  // its native "Add to Apple Wallet" sheet over the page; the Android save URL
  // opens Google Wallet. Once we've handed off we reveal the manual buttons, so
  // a visitor who dismisses the sheet (or whose device blocked the hand-off)
  // isn't stranded. Desktop can't add to a phone wallet, so it shows a QR /
  // email instead and never auto-navigates.
  useEffect(() => {
    if (!autoAddUrl || autoTriggered.current) return;
    // Set the guard INSIDE the timeout, not before scheduling it: React
    // StrictMode (Next dev) mounts effects twice, and a ref flipped before the
    // timer would make the second mount bail without ever navigating.
    const timer = setTimeout(() => {
      autoTriggered.current = true;
      window.location.href = autoAddUrl;
      setRevealButtons(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [autoAddUrl]);

  // A phone that we're about to (or just did) auto-open the wallet for.
  const showAutoAddLoading = !!autoAddUrl && !revealButtons;

  return (
    <div className="paper-card rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center stamp-fill-animation">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">
        {t("success.title")}
      </h2>

      {showAutoAddLoading ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-[var(--muted-foreground)]">{t("success.autoAdding")}</p>
        </div>
      ) : isDesktop ? (
        <>
          <p className="text-[var(--muted-foreground)] mb-6">
            {t("success.desktopDescription")}
          </p>
          <div className="flex flex-col items-center gap-4">
            {emailedTo && (
              <p className="text-sm text-[var(--muted-foreground)]">
                {t("success.emailedNote", { email: emailedTo })}
              </p>
            )}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white p-3 rounded-xl border border-[var(--border)]">
                <QRCodeSVG value={passUrl} size={148} />
              </div>
              <p className="text-sm font-medium text-[var(--primary)]">
                {t("success.scanTitle")}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] max-w-[240px]">
                {t("success.scanHint")}
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="text-[var(--muted-foreground)] mb-6">
            {revealButtons ? t("success.fallbackHint") : t("success.description", { businessName })}
          </p>
          <WalletButtons passUrl={passUrl} googleWalletUrl={googleWalletUrl} />
        </>
      )}
    </div>
  );
}

function EmailSentCard({ message }: { message?: string }) {
  const t = useTranslations("acquisition");
  return (
    <div className="paper-card rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">
        {t("emailSent.title")}
      </h2>
      <p className="text-[var(--muted-foreground)]">
        {message || t("emailSent.defaultMessage")}
      </p>
    </div>
  );
}

function NotReadyCard() {
  const t = useTranslations("acquisition");
  return (
    <div className="paper-card rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">
        {t("notReady.title")}
      </h2>
      <p className="text-[var(--muted-foreground)]">
        {t("notReady.description")}
      </p>
    </div>
  );
}

function NotOpenCard() {
  const t = useTranslations("acquisition");
  return (
    <div className="paper-card rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-amber-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">
        {t("notOpen.title")}
      </h2>
      <p className="text-[var(--muted-foreground)]">
        {t("notOpen.description")}
      </p>
    </div>
  );
}

function ErrorCard({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  const t = useTranslations("acquisition");
  const tc = useTranslations("common.buttons");
  return (
    <div className="paper-card rounded-2xl p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">
        {t("error.title")}
      </h2>
      <p className="text-[var(--muted-foreground)] mb-6">
        {message || t("error.defaultMessage")}
      </p>
      <button
        onClick={onRetry}
        className="btn-primary px-6 py-3 text-sm font-semibold"
      >
        {tc("tryAgain")}
      </button>
    </div>
  );
}
