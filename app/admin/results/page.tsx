"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminTeams, getSeasonLeaderboard, saveSquadResults, getAdminMatches, deleteMatchPointsByTeam } from "../actions";
import Toast from "../../../components/Toast";
import ConfirmModal from "../../../components/ConfirmModal";

export default function ResultsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Selection States
  const [selectedMatch, setSelectedMatch] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });
  const [purgeTeamName, setPurgeTeamName] = useState<string | null>(null);

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [t, lb, ms] = await Promise.all([
        getAdminTeams(), 
        getSeasonLeaderboard(),
        getAdminMatches()
      ]);
      setTeams(t.filter(team => team.payment_status === 'approved'));
      setLeaderboard(lb as any[]);
      setMatches(ms);
    } catch (err) { notify("SYNC ERROR", "error"); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const addEntryRow = () => {
    setEntries([...entries, { team_id: "", placement_rank: 0, kill_points: 0, placement_points: 0, round_wins: 0 }]);
  };

  const updateEntry = (index: number, field: string, value: any) => {
    const next = [...entries];
    next[index][field] = value;
    
    if (field === 'placement_rank') {
      const match = matches.find(m => m.id === selectedMatch);
      const isCS = match?.mode === 'CS';
      const rank = parseInt(value) || 0;
      
      if (isCS) {
        if (rank === 1) next[index]['placement_points'] = 10;
        else if (rank === 2) next[index]['placement_points'] = 5;
        else next[index]['placement_points'] = 0;
      } else {
        if (rank >= 1 && rank <= 12) next[index]['placement_points'] = 13 - rank;
        else next[index]['placement_points'] = 0;
      }
    }
    setEntries(next);
  };

  const handleCommit = async () => {
    if (!selectedMatch) return notify("SELECT AN ACTIVE MATCH SESSION", "warning");
    if (entries.some(e => !e.team_id)) return notify("IDENTIFY ALL SQUADS", "warning");
    
    setSaving(true);
    try {
      await saveSquadResults(selectedMatch, entries);
      notify("MATCH DATA COMMITTED TO ANALYTICS", "success");
      setEntries([]);
      loadData();
    } catch (err) { notify("COMMIT FAILED", "error"); }
    setSaving(false);
  };

  const handleDeletePoints = async (teamName: string) => {
    setPurgeTeamName(teamName);
  };

  const confirmPurgePoints = async () => {
    if (!purgeTeamName) return;
    try {
        const success = await deleteMatchPointsByTeam(purgeTeamName);
        if (success) {
            notify("PERFORMANCE DATA PURGED", "success");
            loadData();
        }
    } catch (err) { notify("PURGE FAILED", "error"); }
    finally { setPurgeTeamName(null); }
  };

  const filteredLeaderboard = leaderboard.filter(lb => lb.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', fontFamily: 'var(--font-head)', color: 'var(--rose-400)' }}>ANALYZING PERFORMANCE...</div>;

  return (
    <div className="admin-panel active animate-up">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        SQUAD PERFORMANCE PORTAL
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '2rem' }}>
        
        {/* LOG SECTION */}
        <section>
          <div className="dash-card modern-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
               <div>
                  <div className="section-label">MATCH SESSION ENTRY</div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--ff-muted)', marginTop: '0.5rem' }}>Log performance metrics for a specific match room.</p>
               </div>
               <button onClick={addEntryRow} className="small-btn">+ ENLIST SQUAD</button>
            </div>

            <div className="form-group" style={{ marginBottom: '2.5rem', background: 'var(--rose-50)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--ff-primary)' }}>
               <label className="form-label" style={{ color: 'var(--ff-primary)' }}>SELECT ACTIVE MATCH ROOM</label>
               <select className="form-input" value={selectedMatch} onChange={e => setSelectedMatch(e.target.value)} style={{ background: '#FFF' }}>
                  <option value="">-- IDENTIFY MATCH SESSION --</option>
                  {matches.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.mode}] {m.map_name} - {new Date(m.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({m.room_id || 'NO_ID'})
                    </option>
                  ))}
               </select>
            </div>

            {entries.length === 0 ? (
              <div style={{ padding: '5rem', textAlign: 'center', border: '2px dashed var(--rose-100)', borderRadius: '24px', opacity: 0.5 }}>
                 NO PERFORMANCE DATA ROWS ACTIVE.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                 <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: `3.5fr 1fr 0.8fr ${matches.find(m => m.id === selectedMatch)?.mode === 'CS' ? '0.8fr' : ''} 0.8fr 1fr 0.3fr`, gap: '1rem', padding: '0 1.5rem', fontSize: '0.65rem', fontWeight: 900, color: 'var(--ff-primary)', letterSpacing: '0.15em', minWidth: '650px' }}>
                     <span>SQUAD IDENTITY</span>
                     <span>RANK</span>
                     <span>KILLS</span>
                     {matches.find(m => m.id === selectedMatch)?.mode === 'CS' && <span>ROUNDS</span>}
                     <span>PTS</span>
                     <span style={{ textAlign: 'center' }}>TOTAL</span>
                     <span></span>
                  </div>
                 </div>
                 {entries.map((ent, idx) => {
                    const activeMatch = matches.find(m => m.id === selectedMatch);
                    const isCS = activeMatch?.mode === 'CS';
                    
                    return (
                      <div key={idx} style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: `3.5fr 1fr 0.8fr ${isCS ? '0.8fr' : ''} 0.8fr 1fr 0.3fr`, gap: '1rem', alignItems: 'center', background: '#FFFFFF', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid var(--rose-50)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', minWidth: '650px' }}>
                         <select 
                          className="form-input" 
                          value={ent.team_id} 
                          onChange={e => updateEntry(idx, 'team_id', e.target.value)}
                          style={{ border: '1px solid var(--rose-100)', background: '#FFF', color: '#000', fontWeight: 800, fontSize: '0.8rem', height: '48px', padding: '0 0.5rem', width: '100%', cursor: 'pointer' }}
                         >
                            <option value="">SELECT</option>
                             {(() => {
                               const match = matches.find(m => m.id === selectedMatch);
                               const allowedIds = match?.match_squads?.map((s: any) => s.team_id) || [];
                               return teams
                                 .filter(t => allowedIds.includes(t.id))
                                 .map(t => (
                                   <option key={t.id} value={t.id}>{t.team_name.toUpperCase()}</option>
                                 ));
                             })()}
                         </select>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', position: 'relative', width: '100px' }}>
                           <input className="form-input" type="number" value={ent.placement_rank} onChange={e => updateEntry(idx, 'placement_rank', parseInt(e.target.value))} style={{ border: '1px solid var(--rose-100)', background: '#FFF', textAlign: 'center', padding: '0 1.8rem 0 0.5rem', width: '100%', fontWeight: 800, color: '#000', fontSize: '1rem', height: '48px' }} />
                           <span style={{ fontSize: '0.7rem', opacity: 0.6, position: 'absolute', right: '8px', pointerEvents: 'none', color: '#000', fontWeight: 800 }}>/{isCS ? '2' : '12'}</span>
                         </div>
                         <input className="form-input" type="number" value={ent.kill_points} onChange={e => updateEntry(idx, 'kill_points', parseInt(e.target.value))} style={{ border: '1px solid var(--rose-100)', background: '#FFF', textAlign: 'center', width: '70px', fontWeight: 800, color: '#000', fontSize: '0.9rem', height: '48px' }} />
                         {isCS && (
                           <input className="form-input" type="number" value={ent.round_wins || 0} onChange={e => updateEntry(idx, 'round_wins', parseInt(e.target.value))} style={{ border: '1px solid var(--rose-100)', background: '#FFF', textAlign: 'center', width: '70px', fontWeight: 800, color: '#000', fontSize: '0.9rem', height: '48px' }} />
                         )}
                         <input className="form-input" type="number" value={ent.placement_points} onChange={e => updateEntry(idx, 'placement_points', parseInt(e.target.value))} style={{ border: '1px solid var(--rose-100)', background: '#FFF', textAlign: 'center', width: '70px', fontWeight: 800, color: '#000', fontSize: '0.9rem', height: '48px' }} />
                         <div style={{ textAlign: 'center', fontWeight: 900, color: 'var(--ff-primary)', fontSize: '1.6rem', minWidth: '70px' }}>
                            {(ent.kill_points || 0) + (ent.placement_points || 0) + (ent.round_wins || 0)}
                         </div>
                         <button onClick={() => setEntries(entries.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', color: '#F43F5E', fontWeight: 900, cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                      </div>
                      </div>
                    );
                  })}
                 <button className="btn-primary" style={{ marginTop: '1.5rem', height: '62px', background: 'var(--ff-primary)', color: '#000', border: 'none' }} onClick={handleCommit} disabled={saving}>
                    {saving ? "SYNCING RESULTS DATA..." : "COMMIT OFFICIAL MATCH DATA 📡"}
                 </button>
              </div>
            )}
          </div>
        </section>

        {/* SEASON ANALYTICS PREVIEW */}
        <section>
          <div className="dash-card modern-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
               <div className="section-label" style={{ marginBottom: 0 }}>SEASON STANDING SUMMARY</div>
               <input 
                 className="search-input" 
                 placeholder="Search Leaderboard..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 style={{ maxWidth: '200px', height: '35px', fontSize: '0.7rem' }}
               />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
               {filteredLeaderboard.length === 0 ? (
                 <div style={{ opacity: 0.4, textAlign: 'center', padding: '4rem' }}>NO PERFORMANCE DATA LOGGED</div>
               ) : (
                 filteredLeaderboard.map((lb, i) => (
                    <div key={i} className="animate-scale-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: i < 1 ? 'linear-gradient(90deg, rgba(255,140,0,0.1), #FFF)' : '#FFF', border: '1px solid var(--rose-100)', borderRadius: '20px', position: 'relative', flexWrap: 'wrap', gap: '0.5rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <span style={{ fontWeight: 900, fontSize: '1.2rem', color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#B45309' : 'var(--rose-100)' }}>
                            {i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                          </span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem', color: 'var(--rose-950)' }}>{lb.name}</div>
                                {i === 0 && <span style={{ fontSize: '0.55rem', background: 'linear-gradient(90deg, #F59E0B, #B45309)', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 900 }}>CHAMPION</span>}
                                {i === 1 && <span style={{ fontSize: '0.55rem', background: '#94A3B8', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 900 }}>RUNNER-UP</span>}
                                {i === 2 && <span style={{ fontSize: '0.55rem', background: '#B45309', color: '#FFF', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 900 }}>THIRD PLACE</span>}
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--ff-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>{lb.mode} · {lb.matches} GAMES · {lb.kills} KILLS</div>
                          </div>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ fontWeight: 900, color: 'var(--ff-primary)', fontSize: '1.8rem' }}>{lb.total}</div>
                          <button 
                            onClick={() => handleDeletePoints(lb.name)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#F43F5E', opacity: 0.3, transition: 'opacity 0.3s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
                            title="Purge Team Points"
                          >
                            🗑️
                          </button>
                       </div>
                    </div>
                 ))
               )}
            </div>
          </div>
        </section>
      </div>

      <ConfirmModal 
        isOpen={!!purgeTeamName}
        title="PURGE SQUAD POINTS?"
        message={`This will permanently erase all leaderboard points and match history for ${purgeTeamName}. This action cannot be reversed.`}
        onConfirm={confirmPurgePoints}
        onCancel={() => setPurgeTeamName(null)}
        confirmText="PURGE NOW"
        type="danger"
      />
    </div>
  );
}
