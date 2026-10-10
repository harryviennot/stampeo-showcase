import type { Metadata } from "next";
import { NOINDEX } from "@/lib/seo/page-robots";

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = { robots: NOINDEX };

export default function WalletSelectLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
