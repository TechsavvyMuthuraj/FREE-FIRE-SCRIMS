"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply dark theme and grid on mount
    document.documentElement.classList.add("dark-theme");
    document.body.classList.add("grid-bg");

    return () => {
      // Cleanup on unmount (e.g. when moving to admin)
      document.documentElement.classList.remove("dark-theme");
      document.body.classList.remove("grid-bg");
    };
  }, []);

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}
