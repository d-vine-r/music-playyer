import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Player from "@/components/Player";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: 'swap',
  weight: 'variable', // Enables all weights (100 to 900)
  style: ['normal', 'italic']
})

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"]
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Muson",
  description: "The only home for vibezz",
};

import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isHome = pathname === '/' || pathname === '';
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} ${outfit.variable} antialiased`}
      >
        {!isHome && <Navbar/>}
        {children}
        {!isHome && <Player/>}
      </body>
    </html>
  );
}
