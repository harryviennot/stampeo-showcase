"use client";

import { useState } from "react";

import {
  BusinessPublicResponse,
  CardDesignPublicResponse,
  CustomerPublicResponse,
  createPublicCustomer,
  CustomerCreatePublic,
} from "@/lib/acquisition";
import { AcquisitionForm } from "./AcquisitionForm";
import { WalletButtons } from "./WalletButtons";
import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";

type FlowState = "form" | "submitting" | "success" | "email_sent" | "error";

interface AcquisitionFlowProps {
  business: BusinessPublicResponse;
  cardDesign: CardDesignPublicResponse | null;
}

export function AcquisitionFlow({ business, cardDesign }: AcquisitionFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>("form");
  const [customerResponse, setCustomerResponse] = useState<CustomerPublicResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get accent color from business settings or card design
  const accentColor =
    business.settings?.accentColor ||
    (cardDesign?.stamp_filled_color || "#f97316");

  const backgroundColor =
    business.settings?.backgroundColor ||
    (cardDesign?.background_color || "#1c1c1e");

  const handleSubmit = async (data: CustomerCreatePublic) => {
    setFlowState("submitting");
    setErrorMessage(null);

    const { data: response, error } = await createPublicCustomer(business.id, data);

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
      className="min-h-screen"
      style={{
        "--business-accent": accentColor,
        "--business-bg": backgroundColor,
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-[var(--border)] sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {business.logo_url ? (
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          {/* Card Preview */}
          <div className="order-1 md:order-2">
            <div className="w-full max-w-[320px] mx-auto">
              <ScaledCardWrapper baseWidth={320} aspectRatio={1.2} minScale={0.7}>
                <WalletCard
                  design={{
                    organization_name: business.name,
                    logo_url: business.logo_url || cardDesign?.logo_url || undefined,
                    background_color: backgroundColor,
                    stamp_filled_color: accentColor,
                    total_stamps: cardDesign?.total_stamps || 10,
                    description: cardDesign?.description || "Free item on completion",
                    secondary_fields: [
                      { key: "reward", label: "Reward", value: cardDesign?.description || "Free item on completion" }
                    ],
                  }}
                  stamps={3}
                  showQR={true}
                  interactive3D={true}
                />
              </ScaledCardWrapper>
            </div>
          </div>

          {/* Form / Success / Email Sent */}
          <div className="order-2 md:order-1">
            {flowState === "form" && (
              <FormCard business={business} onSubmit={handleSubmit} />
            )}

            {flowState === "submitting" && <LoadingCard />}

            {flowState === "success" && customerResponse?.pass_url && (
              <SuccessCard
                businessName={business.name}
                passUrl={customerResponse.pass_url}
              />
            )}

            {flowState === "email_sent" && (
              <EmailSentCard message={customerResponse?.message} />
            )}

            {flowState === "error" && (
              <ErrorCard message={errorMessage} onRetry={handleRetry} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center">
        <p className="text-sm text-[var(--muted-foreground)]">
          Powered by{" "}
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
}: {
  business: BusinessPublicResponse;
  onSubmit: (data: CustomerCreatePublic) => void;
}) {
  return (
    <div className="paper-card rounded-2xl p-6">
      <h2 className="text-xl font-semibold text-[var(--primary)] mb-2">
        Get your loyalty card
      </h2>
      <p className="text-[var(--muted-foreground)] mb-6">
        {business.settings?.description ||
          "Join our loyalty program and start earning rewards!"}
      </p>
      <AcquisitionForm
        dataCollection={business.settings?.customer_data_collection}
        onSubmit={onSubmit}
      />
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="paper-card rounded-2xl p-6 text-center">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
      <p className="text-[var(--muted-foreground)]">Creating your card...</p>
    </div>
  );
}

function SuccessCard({
  businessName,
  passUrl,
}: {
  businessName: string;
  passUrl: string;
}) {
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
        Your card is ready!
      </h2>
      <p className="text-[var(--muted-foreground)] mb-6">
        Add your {businessName} loyalty card to your wallet and start collecting
        stamps.
      </p>
      <WalletButtons passUrl={passUrl} />
    </div>
  );
}

function EmailSentCard({ message }: { message?: string }) {
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
        Check your email
      </h2>
      <p className="text-[var(--muted-foreground)]">
        {message || "We've sent your loyalty card to your email address."}
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
        Something went wrong
      </h2>
      <p className="text-[var(--muted-foreground)] mb-6">
        {message || "We couldn't create your card. Please try again."}
      </p>
      <button
        onClick={onRetry}
        className="btn-primary px-6 py-3 text-sm font-semibold"
      >
        Try Again
      </button>
    </div>
  );
}
