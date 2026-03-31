"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOverviewStats } from "../actions";
import Toast from "../../../components/Toast";

export default function AuditPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const stats = await getOverviewStats();
        setData(stats);
      } catch (err) {
        notify("AUDIT RECORDS OFFLINE", "error");
      }
      setLoading(false);
    };
    fetchAudit();
  }, []);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'var(--font-head)', color: 'var(--rose-400)' }}>FETCHING FINANCIAL RECORDS...</div>;

  return (
    <div className="admin-panel active animate-up">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        FINANCIAL AUDIT PORTAL
      </div>

      <div className="dash-grid" style={{ marginBottom: '2.5rem' }}>
         <div className="dash-card modern-card" style={{ background: '#FFF', borderLeft: '4px solid #F43F5E' }}>
            <div className="dash-card-label">TOTAL ACCUMULATED REVENUE</div>
            <div className="dash-card-value font-head" style={{ color: '#F43F5E', fontSize: '3.5rem' }}>₹{data.revenue.toLocaleString()}</div>
            <p style={{ fontSize: '0.65rem', opacity: 0.5 }}>Calculated from {data.approved} approved squads.</p>
         </div>
      </div>

      <div className="table-wrap">
         <div className="section-label" style={{ marginBottom: '2rem' }}>VERIFIED PAYMENT REGISTRY</div>
         
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {data.verifiedTeams.length === 0 ? (
               <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.4 }}>NO APPROVED TRANSACTIONS IN CURRENT SESSION</div>
            ) : (
               data.verifiedTeams.map((t: any, i: number) => (
                  <div key={i} className="animate-scale-in" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 2rem', background: '#FFF', border: '1px solid var(--rose-100)', borderRadius: '24px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <span style={{ fontWeight: 900, color: 'var(--rose-200)' }}>#{i+1}</span>
                        <div>
                           <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '1rem' }}>{t.team_name}</div>
                           <div style={{ fontSize: '0.65rem', color: '#F43F5E', fontWeight: 800 }}>LEADER: {t.leader_name}</div>
                        </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', textAlign: 'right' }}>
                        <div style={{ flexShrink: 0 }}>
                           <div style={{ fontWeight: 900, fontSize: '1.2rem', color: '#F43F5E' }}>₹{data.revenue / data.approved}</div>
                           <div style={{ fontSize: '0.5rem', color: '#059669', fontWeight: 900, textTransform: 'uppercase' }}>PAID ✓</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 900, minWidth: '40px' }}>{t.mode}</div>
                        <div style={{ width: '40px', height: '40px', background: 'var(--rose-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           🛡️
                        </div>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>

      <div style={{ marginTop: '3rem', padding: '2rem', background: 'rgba(244, 63, 94, 0.03)', borderRadius: '24px', border: '1px solid rgba(244, 63, 94, 0.1)', textAlign: 'center' }}>
         <p style={{ fontSize: '0.75rem', color: 'var(--ff-muted)', margin: 0 }}>This portal serves as an official financial audit for <strong>Demon Darkness</strong> Season Competitive operations. Total revenue is derived from approved payment screenshots.</p>
      </div>
    </div>
  );
}
