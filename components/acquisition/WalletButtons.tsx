"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { walletBadges } from "@/lib/store-badges";

interface WalletButtonsProps {
  passUrl: string;
  googleWalletUrl?: string | null;
}

export function WalletButtons({ passUrl, googleWalletUrl }: WalletButtonsProps) {
  const t = useTranslations("common.wallet");
  const locale = useLocale();
  const { apple: appleSrc, google: googleSrc } = walletBadges(locale);
  return (
    <div className="flex flex-row items-center justify-center gap-3">
      {/* Apple Wallet Button */}
      <a href={passUrl} className="block hover:opacity-90 transition-opacity">
        <Image
          src={appleSrc}
          alt={t("addToAppleWallet")}
          width={200}
          height={50}
          className="h-[50px] w-auto"
        />
      </a>

      {/* Google Wallet Button */}
      {googleWalletUrl ? (
        <a
          href={googleWalletUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
        >
          <Image
            src={googleSrc}
            alt={t("addToGoogleWallet")}
            width={200}
            height={50}
            className="h-[50px] w-auto"
          />
        </a>
      ) : (
        <div className="relative">
          <Image
            src={googleSrc}
            alt={t("addToGoogleWallet")}
            width={200}
            height={50}
            className="h-[50px] w-auto opacity-50 grayscale"
          />
          <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {t("soon")}
          </span>
        </div>
      )}
    </div>
  );
}
