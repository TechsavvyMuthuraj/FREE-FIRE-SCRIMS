import type { Metadata } from "next";
import { Orbitron, Plus_Jakarta_Sans, Share_Tech_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: '--font-orbitron'
});

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: '--font-jakarta'
});

const shareTechMono = Share_Tech_Mono({ 
  weight: '400',
  subsets: ["latin"],
  variable: '--font-share-tech-mono'
});

export const metadata: Metadata = {
  title: "Demon X Scrims – Elite Free Fire Tournament Platform",
  description: "Register for premium Clash Squad and Battle Royale Free Fire Scrims.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${plusJakarta.variable} ${shareTechMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
