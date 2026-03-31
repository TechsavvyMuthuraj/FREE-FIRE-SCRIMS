"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import "./Navbar.css";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (window.location.pathname !== "/") {
      router.push(`/#${targetId}`);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="main-nav">
      <Link href="/" className="nav-logo">DEMON X</Link>
      <ul className="nav-links">
        <li><a href="#tournaments" onClick={(e) => handleNavClick(e, 'tournaments')} className="nav-anchor">Tournaments</a></li>
        <li><a href="#prizes" onClick={(e) => handleNavClick(e, 'prizes')} className="nav-anchor">Prizes</a></li>
        <li><a href="#rules" onClick={(e) => handleNavClick(e, 'rules')} className="nav-anchor">Rules</a></li>
      </ul>
      <Link href="/register" className="nav-btn">REGISTER NOW</Link>
    </nav>
  );
}
