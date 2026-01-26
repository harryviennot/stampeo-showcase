import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stampeo - Loyalty cards your customers actually keep",
  description:
    "Digital loyalty cards for Apple Wallet and Google Wallet. No app to download, no card to lose. Create your free loyalty card in minutes.",
  keywords: [
    "loyalty cards",
    "digital loyalty",
    "Apple Wallet",
    "Google Wallet",
    "customer rewards",
    "stamp cards",
  ],
  openGraph: {
    title: "Stampeo - Loyalty cards your customers actually keep",
    description:
      "Digital loyalty cards for Apple Wallet and Google Wallet. No app to download, no card to lose.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
