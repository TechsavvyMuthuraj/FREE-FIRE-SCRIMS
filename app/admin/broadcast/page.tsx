"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BroadcastPage() {
  const router = useRouter();

  useEffect(() => {
    // Optional: Auto-redirect after a few seconds
    const timer = setTimeout(() => {
      router.push("/admin/matches");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="admin-panel active animate-up">
      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        EMAIL BROADCAST DISCONTINUED
      </div>
      
      <div className="dash-card modern-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📡</div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', color: 'var(--rose-900)', marginBottom: '1rem' }}>FEATURE MIGRATED</h2>
        <p style={{ color: 'var(--ff-muted)', maxWidth: '500px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
          The Email Broadcast system has been decommissioned in favor of our more efficient **WhatsApp Dispatch Center**. 
          You can now manage all match alerts and credentials directly from the Match Control panel.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/admin/matches" className="btn-primary" style={{ padding: '1rem 2rem' }}>
            GO TO WHATSAPP DISPATCH →
          </Link>
          <Link href="/admin/dashboard" className="btn-secondary" style={{ padding: '1rem 2rem' }}>
            BACK TO DASHBOARD
          </Link>
        </div>
        
        <p style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: 'var(--rose-300)', fontWeight: 600 }}>
          REDIRECTING IN 5 SECONDS...
        </p>
      </div>
    </div>
  );
}
