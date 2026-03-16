import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AirqCoreProvider } from "@/components/AirqCoreProvider";
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
  title: "Air Signal — Environmental Comfort Dashboard",
  description: "Real-time air quality, comfort index, and environmental signals for any city. Powered by Rust WASM.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AirqCoreProvider>{children}</AirqCoreProvider>
      </body>
    </html>
  );
}
