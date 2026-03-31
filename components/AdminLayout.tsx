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
        <div style={{ padding: '1.5rem 1.5rem 0.5rem' }}>
          <Link href="/" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.65rem', 
            letterSpacing: '0.1em', 
            color: 'var(--ff-primary)', 
            textDecoration: 'none',
            fontWeight: 800,
            padding: '0.5rem 0.75rem',
            background: 'rgba(255, 140, 0, 0.1)',
            borderRadius: '6px',
            transition: 'all 0.2s'
          }} className="back-website-btn">
            ← BACK TO WEBSITE
          </Link>
        </div>
        <div style={{ padding: '1.5rem 1.5rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--ff-muted)', textTransform: 'uppercase' }}>Navigation</div>
        
        <Link href="/admin/dashboard" className={`sidebar-item ${pathname === "/admin/dashboard" ? "active" : ""}`}>
          <span className="sidebar-icon">◈</span> Overview
        </Link>
        <Link href="/admin/teams" className={`sidebar-item ${pathname === "/admin/teams" ? "active" : ""}`}>
          <span className="sidebar-icon">◉</span> Team Management
        </Link>
        <Link href="/admin/schedule" className={`sidebar-item ${pathname === "/admin/schedule" ? "active" : ""}`}>
          <span className="sidebar-icon">📅</span> Team Schedule
        </Link>
        <Link href="/admin/match-lists" className={`sidebar-item ${pathname === "/admin/match-lists" ? "active" : ""}`}>
          <span className="sidebar-icon">📑</span> Team List Match
        </Link>
        <Link href="/admin/matches" className={`sidebar-item ${pathname === "/admin/matches" ? "active" : ""}`}>
          <span className="sidebar-icon">◆</span> Match Control
        </Link>
        <Link href="/admin/results" className={`sidebar-item ${pathname === "/admin/results" ? "active" : ""}`}>
          <span className="sidebar-icon">🏆</span> Season Rankings
        </Link>
        <Link href="/admin/audit" className={`sidebar-item ${pathname === "/admin/audit" ? "active" : ""}`}>
          <span className="sidebar-icon">💰</span> Financial Audit
        </Link>
        <Link href="/admin/content" className={`sidebar-item ${pathname === "/admin/content" ? "active" : ""}`}>
          <span className="sidebar-icon">✎</span> Site Content
        </Link>
        <Link href="/admin/settings" className={`sidebar-item ${pathname === "/admin/settings" ? "active" : ""}`}>
          <span className="sidebar-icon">⚙</span> Global Settings
        </Link>
        <Link href="/admin/payments" className={`sidebar-item ${pathname === "/admin/payments" ? "active" : ""}`}>
          <span className="sidebar-icon">💳</span> Payment Settings
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
