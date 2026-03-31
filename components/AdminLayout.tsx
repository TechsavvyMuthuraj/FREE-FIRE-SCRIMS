"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import "./AdminLayout.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    localStorage.removeItem("ffscrims_admin");
    router.push("/admin/login");
  };

  // Skip layout wrapper for the login page specifically
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="hero-badge">Verifying Admin Access...</div></div>;
  if (!isAdmin) return null;

  return (
    <div className="admin-layout" id="page-admin">
      {/* SIDEBAR */}
      <div className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0.5rem 1.5rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--ff-muted)', textTransform: 'uppercase' }}>Navigation</div>
        
        <Link href="/admin/dashboard" className={`sidebar-item ${pathname === "/admin/dashboard" ? "active" : ""}`}>
          <span className="sidebar-icon">◈</span> Overview
        </Link>
        <Link href="/admin/teams" className={`sidebar-item ${pathname === "/admin/teams" ? "active" : ""}`}>
          <span className="sidebar-icon">◉</span> Team Management
        </Link>
        <Link href="/admin/matches" className={`sidebar-item ${pathname === "/admin/matches" ? "active" : ""}`}>
          <span className="sidebar-icon">◆</span> Match Control
        </Link>
        <Link href="/admin/broadcast" className={`sidebar-item ${pathname === "/admin/broadcast" ? "active" : ""}`}>
          <span className="sidebar-icon">◎</span> Email Broadcast
        </Link>
        <Link href="/admin/content" className={`sidebar-item ${pathname === "/admin/content" ? "active" : ""}`}>
          <span className="sidebar-icon">✎</span> Site Content
        </Link>

        {/* LOGOUT */}
        <div style={{ marginTop: 'auto', padding: '1rem 1.5rem', borderTop: '1px solid var(--ff-border)' }}>
          <div onClick={handleLogout} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--ff-muted)', cursor: 'pointer', transition: 'color 0.15s' }}>
            ← LOGOUT EXIT
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}
