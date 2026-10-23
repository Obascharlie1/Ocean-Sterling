import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});
import { ThemeProvider } from "@/providers/ThemeProvider";
import { TawkChat } from "@/components/ui/TawkChat";
import { SessionGuard } from "@/components/ui/SessionGuard";

const SITE_URL = 'https://tesla-bridges-capital.vercel.app'
const OG_IMAGE = `${SITE_URL}/images/og-cover.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ocean Sterling — Invest in Forex, Stocks & Crypto",
  description:
    "Putting Our Clients First For Over A Decade. Ocean Sterling is a trusted trading platform for Forex, Stock Market & Crypto — generate returns on rising and falling markets worldwide.",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Ocean Sterling — Invest in Forex, Stocks & Crypto",
    description:
      "Putting Our Clients First For Over A Decade. Ocean Sterling is a trusted trading platform for Forex, Stock Market & Crypto — generate returns on rising and falling markets worldwide.",
    siteName: "Ocean Sterling",
    images: [
      {
        url: OG_IMAGE,
        secureUrl: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Ocean Sterling — Invest, Trade & Grow",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ocean Sterling — Invest in Forex, Stocks & Crypto",
    description:
      "Putting Our Clients First For Over A Decade. Ocean Sterling is a trusted trading platform for Forex, Stock Market & Crypto — generate returns on rising and falling markets worldwide.",
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
        <SessionGuard />
        <TawkChat />
      </body>
    </html>
  );
}
