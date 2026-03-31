import type { Metadata } from "next";
import { Orbitron, Rajdhani, Share_Tech_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: '--font-orbitron'
});

const rajdhani = Rajdhani({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-rajdhani'
});

const shareTechMono = Share_Tech_Mono({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-share-tech-mono'
});

export const metadata: Metadata = {
  title: "FF Scrims – Free Fire Tournament Platform",
  description: "Register for premium Clash Squad and Battle Royale Free Fire Scrims.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable}`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
