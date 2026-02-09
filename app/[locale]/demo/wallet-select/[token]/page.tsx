"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function WalletSelectPage() {
  const t = useTranslations("auth.walletSelect");
  const tw = useTranslations("common.wallet");
  const params = useParams();
  const token = params.token as string;

  const appleUrl = `${API_URL}/demo/pass/${token}?wallet=apple`;
  const googleUrl = `${API_URL}/demo/pass/${token}?wallet=google`;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-[var(--foreground)]">
              Stampeo
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg border border-[var(--border)]">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {t("title")}
          </h1>
          <p className="text-[var(--muted-foreground)] mb-8">
            {t("subtitle")}
          </p>

          <div className="space-y-4">
            {/* Apple Wallet Button */}
            <a
              href={appleUrl}
              className="block hover:opacity-90 transition-opacity"
            >
              <Image
                src="/AppleWallet.svg"
                alt={tw("addToAppleWallet")}
                width={280}
                height={56}
                className="w-full h-auto"
              />
            </a>

            {/* Google Wallet Button */}
            <a
              href={googleUrl}
              className="block hover:opacity-90 transition-opacity"
            >
              <Image
                src="/GoogleWallet.svg"
                alt={tw("addToGoogleWallet")}
                width={280}
                height={56}
                className="w-full h-auto"
              />
            </a>
          </div>

          <p className="mt-8 text-sm text-[var(--muted-foreground)]">
            {t("tip")}
          </p>
        </div>

        {/* Back link */}
        <div className="mt-6">
          <Link
            href="/"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {t("backToStampeo")}
          </Link>
        </div>
      </div>
    </div>
  );
}
