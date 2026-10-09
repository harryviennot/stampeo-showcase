import type { Metadata } from "next";
import { NOINDEX } from "@/lib/page-robots";

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = { robots: NOINDEX };

export default function LoginLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
