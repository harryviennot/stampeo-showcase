"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface WalletButtonsProps {
  passUrl: string;
  customerId?: string;
}

interface GoogleWalletResponse {
  save_url: string;
  object_id: string;
  configured: boolean;
}

export function WalletButtons({ passUrl, customerId }: WalletButtonsProps) {
  const [googleSaveUrl, setGoogleSaveUrl] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(!!customerId);
  const [googleAvailable, setGoogleAvailable] = useState(false);

  useEffect(() => {
    if (!customerId) {
      setLoadingGoogle(false);
      return;
    }

    // Fetch Google Wallet save URL
    async function fetchGoogleUrl() {
      try {
        const response = await fetch(
          `${API_URL}/google-wallet/save-url/${customerId}`
        );

        if (response.ok) {
          const data: GoogleWalletResponse = await response.json();
          setGoogleSaveUrl(data.save_url);
          setGoogleAvailable(data.configured);
        } else if (response.status === 503) {
          // Google Wallet not configured
          setGoogleAvailable(false);
        }
      } catch (error) {
        console.error("Failed to fetch Google Wallet URL:", error);
        setGoogleAvailable(false);
      } finally {
        setLoadingGoogle(false);
      }
    }

    fetchGoogleUrl();
  }, [customerId]);

  return (
    <div className="flex flex-row items-center justify-center gap-3">
      {/* Apple Wallet Button */}
      <a href={passUrl} className="block hover:opacity-90 transition-opacity">
        <Image
          src="/AppleWallet.svg"
          alt="Add to Apple Wallet"
          width={200}
          height={50}
          className="h-[50px] w-auto"
        />
      </a>

      {/* Google Wallet Button */}
      {loadingGoogle ? (
        <div className="h-[50px] w-[170px] bg-gray-100 animate-pulse rounded-lg" />
      ) : googleSaveUrl && googleAvailable ? (
        <a
          href={googleSaveUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          <Image
            src="/GoogleWallet.svg"
            alt="Add to Google Wallet"
            width={200}
            height={50}
            className="h-[50px] w-auto"
          />
        </a>
      ) : (
        <div className="relative">
          <Image
            src="/GoogleWallet.svg"
            alt="Add to Google Wallet"
            width={200}
            height={50}
            className="h-[50px] w-auto opacity-50 grayscale"
          />
          <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            Soon
          </span>
        </div>
      )}
    </div>
  );
}
