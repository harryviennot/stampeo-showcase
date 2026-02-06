"use client";

import Image from "next/image";

interface WalletButtonsProps {
  passUrl: string;
}

export function WalletButtons({ passUrl }: WalletButtonsProps) {
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

      {/* Google Wallet Button (Coming Soon) */}
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
    </div>
  );
}
