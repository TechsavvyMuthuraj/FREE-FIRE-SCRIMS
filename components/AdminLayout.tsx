"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import "./AdminLayout.css";
import "./admin-responsive.css";

const NAV_ITEMS = [
  { href: "/admin/dashboard",   icon: "◈", label: "Overview" },
  { href: "/admin/teams",       icon: "◉", label: "Team Management" },
  { href: "/admin/schedule",    icon: "📅", label: "Team Schedule" },
  { href: "/admin/match-lists", icon: "📑", label: "Team List Match" },
  { href: "/admin/matches",     icon: "◆", label: "Match Control" },
  { href: "/admin/results",     icon: "🏆", label: "Season Rankings" },
  { href: "/admin/audit",       icon: "💰", label: "Financial Audit" },
  { href: "/admin/content",     icon: "✎", label: "Site Content" },
  { href: "/admin/settings",    icon: "⚙", label: "Global Settings" },
  { href: "/admin/payments",    icon: "💳", label: "Payment Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem("ffscrims_admin") === "true";
      if (!isAuthenticated && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else {
        if (isAuthenticated) setIsAdmin(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, [pathname, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("ffscrims_admin");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="hero-badge">Verifying Admin Access...</div>
    </div>
  );
  if (!isAdmin) return null;

  return (
    <div className="admin-layout" id="page-admin">

      {/* MOBILE OVERLAY — closes sidebar when tapping outside */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <div className={`admin-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Sidebar header */}
        <div className="sidebar-header">
          <Link href="/" className="back-website-btn">
            ← BACK TO WEBSITE
          </Link>
          {/* Close button (mobile only) */}
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="sidebar-nav-label">Navigation</div>

        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-item ${pathname === item.href ? "active" : ""}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </Link>
        ))}

        {/* LOGOUT */}
        <div className="sidebar-logout">
          <div onClick={handleLogout} className="logout-btn">
            ← LOGOUT EXIT
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        {/* MOBILE TOP BAR */}
        <div className="mobile-topbar">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
          <span className="mobile-topbar-title">⚡ DEMON X ADMIN</span>
        </div>

        {children}
      </div>
    </div>
  );
}
