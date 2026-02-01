"use client";

interface WalletButtonsProps {
  passUrl: string;
}

export function WalletButtons({ passUrl }: WalletButtonsProps) {
  return (
    <div className="space-y-3">
      {/* Apple Wallet Button */}
      <a
        href={passUrl}
        className="flex items-center justify-center gap-3 w-full bg-black text-white rounded-xl py-3.5 px-6 font-semibold hover:bg-gray-900 transition-colors"
      >
        <AppleWalletIcon />
        <span>Add to Apple Wallet</span>
      </a>

      {/* Google Wallet Button (Coming Soon) */}
      <button
        disabled
        className="flex items-center justify-center gap-3 w-full bg-gray-100 text-gray-400 rounded-xl py-3.5 px-6 font-semibold cursor-not-allowed relative group"
      >
        <GoogleWalletIcon />
        <span>Add to Google Wallet</span>
        <span className="absolute -top-2 -right-2 bg-[var(--accent)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
          Soon
        </span>
      </button>
    </div>
  );
}

function AppleWalletIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
    </svg>
  );
}

function GoogleWalletIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
    </svg>
  );
}
