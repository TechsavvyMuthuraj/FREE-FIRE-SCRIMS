"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOverviewStats, createBroadcast } from "../actions";
import Toast from "../../../components/Toast";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    total: 0,
    cs: 0,
    br: 0,
    approved: 0,
    revenue: 0,
    cs_rooms_needed: 0,
    br_rooms_needed: 0,
    total_rooms_needed: 0
  });
  const [loading, setLoading] = useState(true);
  const [dispatching, setDispatching] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });
  const [broadcast, setBroadcast] = useState({
    title: "",
    category: "TOURNAMENT",
    content: ""
  });

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getOverviewStats();
        setStats(result as any);
      } catch (err) {
        notify("STATS SYNC FAILED", "error");
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const handleDispatch = async () => {
    if (!broadcast.title || !broadcast.content) return notify("COMPLETE ALL FIELDS", "warning");
    setDispatching(true);
    try {
      await createBroadcast({
        title: broadcast.title,
        category: broadcast.category,
        content: broadcast.content,
        is_active: true
      });
      notify("ARTICLE PUBLISHED TO LANDING PAGE", "success");
      setBroadcast({ title: "", category: "TOURNAMENT", content: "" });
    } catch (err) { notify("PUBLISH FAILED", "error"); }
    setDispatching(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', color: 'var(--rose-400)', fontFamily: 'var(--font-head)', letterSpacing: '0.1em' }}>
      INITIALIZING COMMAND CENTER...
    </div>
  );

  return (
    <div className="admin-panel active animate-scale-in" style={{ paddingBottom: '5rem' }}>
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '1.2rem' }}>📊</span> COMMAND OVERVIEW
      </div>
      
      <div className="dash-grid" style={{ marginBottom: '3rem' }}>
        <div className="dash-card modern-card" style={{ borderLeft: '4px solid var(--ff-primary)' }}>
          <div className="dash-card-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            REGISTRATION POOL <span style={{ fontSize: '1.2rem' }}>👥</span>
          </div>
          <div className="dash-card-value font-head" style={{ color: 'var(--ff-primary)', fontSize: '3.5rem', marginBottom: '0.2rem' }}>{stats.total}</div>
          <div className="dash-card-sub" style={{ fontSize: '0.65rem', fontWeight: 600 }}>{stats.approved} SQUADS VERIFIED (PAYMENT)</div>
        </div>
        
        <Link href="/admin/audit" className="dash-card modern-card" style={{ borderLeft: '4px solid #F43F5E', cursor: 'pointer', display: 'block', textDecoration: 'none' }}>
          <div className="dash-card-label" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ff-muted)' }}>
            ESTIMATED REVENUE <span style={{ fontSize: '1.2rem' }}>💰</span>
          </div>
          <div className="dash-card-value font-head" style={{ color: '#F43F5E', fontSize: '3.5rem', marginBottom: '0.2rem' }}>₹{stats.revenue.toLocaleString()}</div>
          <div className="dash-card-sub" style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--ff-muted)' }}>
            ✓ {stats.approved} PAYMENTS AUTHENTICATED
          </div>
        </Link>
        
        <div className="dash-card modern-card" style={{ borderLeft: '4px solid #F59E0B' }}>
          <div className="dash-card-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            CS ALLOCATION <span style={{ fontSize: '1.2rem' }}>⚔️</span>
          </div>
          <div className="dash-card-value font-head" style={{ color: '#F59E0B', fontSize: '3.5rem', marginBottom: '0.2rem' }}>{stats.cs_rooms_needed}</div>
          <div className="dash-card-sub" style={{ fontSize: '0.65rem', fontWeight: 600 }}>MATCH ROOMS / DEPLOYMENT</div>
        </div>
        
        <div className="dash-card modern-card" style={{ borderLeft: '4px solid #10B981' }}>
          <div className="dash-card-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            BR ALLOCATION <span style={{ fontSize: '1.2rem' }}>🛸</span>
          </div>
          <div className="dash-card-value font-head" style={{ color: '#10B981', fontSize: '3.5rem', marginBottom: '0.2rem' }}>{stats.br_rooms_needed}</div>
          <div className="dash-card-sub" style={{ fontSize: '0.65rem', fontWeight: 600 }}>TOTAL CAPACITY {stats.br}/∞</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '2rem' }}>
        <section>
          <div className="dash-card modern-card" style={{ padding: '2.5rem', background: '#FFFFFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div className="section-label" style={{ marginBottom: 0 }}>ENROLLMENT ANALYTICS</div>
              <div style={{ fontSize: '0.6rem', padding: '0.3rem 0.8rem', background: 'var(--rose-50)', borderRadius: '20px', color: 'var(--rose-400)', fontWeight: 800 }}>LIVE SYNC ENABLED</div>
            </div>
            
            <div style={{ marginBottom: '2.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--rose-900)', marginBottom: '1rem', fontWeight: 800 }}>
                <span>PENDING SQUADS (UNVERIFIED)</span>
                <span style={{ color: '#FB7185' }}>{stats.total - stats.approved}</span>
              </div>
              <div style={{ height: '14px', background: 'var(--rose-50)', borderRadius: '7px', overflow: 'hidden', padding: '2px' }}>
                <div style={{ height: '100%', width: `${((stats.total - stats.approved) / stats.total) * 100 || 0}%`, background: 'rgba(251, 113, 133, 0.5)', borderRadius: '7px', transition: 'width 1.2s' }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--rose-900)', marginBottom: '1rem', fontWeight: 800 }}>
                <span>CLASH SQUAD POOL</span>
                <span style={{ color: '#F43F5E' }}>{stats.cs} TEAMS</span>
              </div>
              <div style={{ height: '14px', background: 'var(--rose-50)', borderRadius: '7px', overflow: 'hidden', padding: '2px' }}>
                <div style={{ height: '100%', width: `${((stats.cs % 12) / 12) * 100}%`, background: 'linear-gradient(90deg, #FDA4AF, #F43F5E)', borderRadius: '7px', transition: 'width 1.2s' }}></div>
              </div>
              <p style={{ fontSize: '0.6rem', opacity: 0.5, marginTop: '0.5rem' }}>Next auto-settle trigger at 12 squads.</p>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--rose-900)', marginBottom: '1rem', fontWeight: 800 }}>
                <span>BATTLE ROYALE POOL</span>
                <span style={{ color: '#F59E0B' }}>{stats.br} TEAMS</span>
              </div>
              <div style={{ height: '14px', background: 'var(--rose-50)', borderRadius: '7px', overflow: 'hidden', padding: '2px' }}>
                <div style={{ height: '100%', width: `${((stats.br % 12) / 12) * 100}%`, background: 'linear-gradient(90deg, #FDE68A, #F59E0B)', borderRadius: '7px', transition: 'width 1.2s' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* SITE BROADCAST */}
        <section>
          <div className="dash-card modern-card" style={{ padding: '2.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ width: '10px', height: '10px', background: '#F43F5E', borderRadius: '50%', animation: 'pulse-glow 1.5s infinite' }}></div>
                <div className="section-label" style={{ marginBottom: 0 }}>SITE BROADCAST CENTER</div>
              </div>
            </div>

            <div className="broadcast-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              <div className="form-group">
                <label className="form-label">CATEGORY</label>
                <select className="form-input" value={broadcast.category} onChange={e => setBroadcast({...broadcast, category: e.target.value})} style={{ background: 'var(--rose-50)', border: 'none' }}>
                  <option value="TOURNAMENT">ANNNOUNCEMENT</option>
                  <option value="LIVE">MATCH LIVE</option>
                  <option value="RESULT">WINNER DECLARED</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">BROADCAST TITLE</label>
                <input className="form-input" placeholder="URGENT: MATCH #12..." value={broadcast.title} onChange={e => setBroadcast({...broadcast, title: e.target.value})} style={{ background: 'var(--rose-50)', border: 'none' }} />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">MESSAGE CONTENT</label>
                <textarea className="form-input" rows={4} placeholder="Type message for landing page alert..." value={broadcast.content} onChange={e => setBroadcast({...broadcast, content: e.target.value})} style={{ background: 'var(--rose-50)', border: 'none' }} />
              </div>

              <button className="btn-primary" onClick={handleDispatch} disabled={dispatching}>
                {dispatching ? 'DISPATCHING...' : 'DISPATCH ARTICLE 📡'}
              </button>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .modern-card { background: #FFFFFF; border-radius: 28px; border: 1px solid rgba(225, 29, 72, 0.08); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03); transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); }
        .dash-card:hover { transform: translateY(-8px); box-shadow: 0 30px 60px rgba(0, 0, 0, 0.08); border-color: rgba(225, 29, 72, 0.2); }
        @keyframes pulse-glow {
          0% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
          70% { transform: scale(1.15); opacity: 0.8; box-shadow: 0 0 0 10px rgba(244, 63, 94, 0); }
          100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
      `}</style>
    </div>
  );
}
