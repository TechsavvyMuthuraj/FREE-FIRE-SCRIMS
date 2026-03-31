"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminMatches } from "../actions";
import Toast from "../../../components/Toast";

export default function MatchListPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<"CS" | "BR">("CS");
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });

  const loadData = async () => {
    setLoading(true);
    try {
      const ms = await getAdminMatches();
      setMatches(ms);
    } catch (err) { }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredMatches = matches.filter(m => m.mode === activeMode);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--rose-400)' }}>ANALYZING MATCHUP DATA...</div>;

  return (
    <div className="admin-panel active animate-up">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        TEAM LIST MATCH
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
         <button 
           onClick={() => setActiveMode("CS")}
           className={`small-btn ${activeMode === 'CS' ? 'active-btn' : ''}`}
           style={{ padding: '1rem 3rem', background: activeMode === 'CS' ? 'var(--ff-primary)' : 'var(--rose-50)', color: activeMode === 'CS' ? '#000' : 'inherit' }}
         >
           ⚔️ CLASH SQUAD 1v1
         </button>
         <button 
           onClick={() => setActiveMode("BR")}
           className={`small-btn ${activeMode === 'BR' ? 'active-btn' : ''}`}
           style={{ padding: '1rem 3rem', background: activeMode === 'BR' ? 'var(--ff-primary)' : 'var(--rose-50)', color: activeMode === 'BR' ? '#000' : 'inherit' }}
         >
           🛸 BATTLE ROYALE 12-SQUAD
         </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
         {filteredMatches.length === 0 ? (
           <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', opacity: 0.4 }}>NO {activeMode} SESSIONS SCHEDULED</div>
         ) : (
           filteredMatches.map((m, idx) => (
             <div key={idx} className="dash-card modern-card animate-scale-in" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--rose-50)', paddingBottom: '1.5rem' }}>
                   <div>
                      <div className="section-label" style={{ marginBottom: '0.2rem', color: 'var(--ff-primary)' }}>MATCH #{idx + 1} ({m.mode})</div>
                      <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>{m.map_name.toUpperCase()} · {new Date(m.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.65rem', fontWeight: 800 }}>ROOM: <span style={{ color: '#F43F5E' }}>{m.room_id}</span></div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>PWD: {m.room_password}</div>
                   </div>
                </div>

                {/* SQUAD LIST */}
                {activeMode === 'CS' ? (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', padding: '1rem 0' }}>
                      {m.match_squads?.length >= 2 ? (
                        <>
                          <div style={{ flex: 1, textAlign: 'center' }}>
                             <div style={{ fontSize: '0.5rem', color: 'var(--ff-muted)', fontWeight: 900 }}>TEAM RED</div>
                             <div style={{ fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase', marginTop: '0.5rem' }}>{m.match_squads[0].teams.team_name}</div>
                             <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>{m.match_squads[0].teams.leader_name}</div>
                          </div>
                          
                          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--rose-100)', fontStyle: 'italic' }}>VS</div>

                          <div style={{ flex: 1, textAlign: 'center' }}>
                             <div style={{ fontSize: '0.5rem', color: 'var(--ff-muted)', fontWeight: 900 }}>TEAM BLUE</div>
                             <div style={{ fontWeight: 900, fontSize: '1.2rem', textTransform: 'uppercase', marginTop: '0.5rem' }}>{m.match_squads[1].teams.team_name}</div>
                             <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>{m.match_squads[1].teams.leader_name}</div>
                          </div>
                        </>
                      ) : (
                        <div style={{ opacity: 0.4 }}>INCOMPLETE MATCHUP DATA</div>
                      )}
                   </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     {m.match_squads?.map((entry: any, sIdx: number) => (
                        <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.2rem', background: 'var(--rose-50)', borderRadius: '12px' }}>
                           <span style={{ fontWeight: 900, fontSize: '0.7rem', color: 'var(--rose-200)', width: '25px' }}>{sIdx + 1}</span>
                           <div>
                              <div style={{ fontWeight: 900, fontSize: '0.75rem', textTransform: 'uppercase' }}>{entry.teams.team_name}</div>
                              <div style={{ fontSize: '0.55rem', opacity: 0.5 }}>{entry.teams.leader_name}</div>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
             </div>
           ))
         )}
      </div>
    </div>
  );
}
