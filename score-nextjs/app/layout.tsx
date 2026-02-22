import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/Providers";
import { PrivyProviderWrapper } from "../components/providers/PrivyProviderWrapper";
import { Alerts } from "../components/alerts/Alerts";
import { ConnectModal } from "../components/wallet/ConnectModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Agentic Alpha - Bond Credit",
  description: "Track AI agent performance with real-time metrics and analytics",
  icons: {
    icon: '/bond.credit_icon.svg',
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
        className={`${inter.variable} font-sans antialiased`}
      >
        <Providers>
          <PrivyProviderWrapper>
            <Alerts />
            <ConnectModal />
            {children}
          </PrivyProviderWrapper>
        </Providers>
      </body>
    </html>
  );
}
