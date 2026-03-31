"use client";

import { useEffect, useState } from "react";
import { getOverviewStats } from "../actions";

export default function DashboardOverview() {
  const [stats, setStats] = useState({
    total: 0,
    cs: 0,
    br: 0,
    slots: 24,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getOverviewStats();
        setStats(result);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="admin-panel active">
      <div className="admin-section-title">DASHBOARD OVERVIEW</div>
      
      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-label">Total Teams</div>
          <div className="dash-card-value">{stats.total}</div>
          <div className="dash-card-sub">Registered for S2025</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-label">CS Mode Teams</div>
          <div className="dash-card-value">{stats.cs}</div>
          <div className="dash-card-sub">Clash Squad</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-label">BR Mode Teams</div>
          <div className="dash-card-value">{stats.br}</div>
          <div className="dash-card-sub">Battle Royale</div>
        </div>
        <div className="dash-card">
          <div className="dash-card-label">Open Slots</div>
          <div className="dash-card-value">{stats.slots}</div>
          <div className="dash-card-sub">of 24 total</div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="dash-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div className="match-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-head)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em' }}>REGISTRATION PROGRESS</span>
        </div>
        
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--ff-muted)', marginBottom: '0.4rem' }}>
            <span>CS MODE</span><span>{stats.cs}/12</span>
          </div>
          <div style={{ height: '6px', background: 'var(--ff-card2)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (stats.cs / 12) * 100)}%`, background: 'var(--ff-info)', borderRadius: '3px', transition: 'width 0.5s' }}></div>
          </div>
        </div>
        
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--ff-muted)', marginBottom: '0.4rem' }}>
            <span>BR MODE</span><span>{stats.br}/12</span>
          </div>
          <div style={{ height: '6px', background: 'var(--ff-card2)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, (stats.br / 12) * 100)}%`, background: 'var(--ff-red)', borderRadius: '3px', transition: 'width 0.5s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
