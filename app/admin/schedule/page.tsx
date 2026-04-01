"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminTeams, getAdminMatches, linkSquadsToMatch } from "../actions";
import Toast from "../../../components/Toast";

export default function SchedulePage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [selectedSquads, setSelectedSquads] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

   const loadData = async () => {
     setLoading(true);
     
     // 1. Load Matches (Critical for the dropdown)
     try {
       const ms = await getAdminMatches();
       // Display all matches (Scheduled, Ongoing, and Completed)
       setMatches(Array.isArray(ms) ? ms : []);
     } catch (err) { 
       console.error("Match Sync Error:", err);
       notify("MATCH SYNC FAILED", "error"); 
     }

     // 2. Load Teams (For enlisting)
     try {
       const t = await getAdminTeams();
       const approved = Array.isArray(t) ? t.filter(team => team.payment_status === 'approved') : [];
       setTeams(approved);
     } catch (err) {
       console.error("Team Sync Error:", err);
       // We don't notify here to avoid double toasts, or we can use a separate warning
     }

     setLoading(false);
   };

  useEffect(() => { loadData(); }, []);

  const activeMatch = matches.find(m => m.id === selectedMatchId);
  const mode = activeMatch?.mode || "BR";
  const capacity = mode === "BR" ? 12 : 2;
  const filteredTeams = teams.filter(t => t.mode === mode);

  const toggleSquad = (id: string) => {
    if (selectedSquads.includes(id)) {
        setSelectedSquads(selectedSquads.filter(x => x !== id));
    } else {
        if (selectedSquads.length >= capacity) return notify(`ROOM FULL (${capacity}/${capacity})`, "warning");
        setSelectedSquads([...selectedSquads, id]);
    }
  };

  const handleFinalize = async () => {
    if (!selectedMatchId) return notify("SELECT A SCHEDULED SESSION", "warning");
    if (selectedSquads.length < capacity) return notify(`NEED ${capacity} TEAMS (SELECTED ${selectedSquads.length})`, "warning");

    setSaving(true);
    try {
        await linkSquadsToMatch(selectedMatchId, selectedSquads);

        notify("ROSTER FINALIZED FOR ROOM", "success");
        setSelectedSquads([]);
        setSelectedMatchId("");
        loadData();
    } catch (err: any) { notify(`FAILED: ${err.message}`, "error"); }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--rose-400)' }}>PREPARING WAR ROOM...</div>;

  return (
    <div className="admin-panel active animate-up">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        WAR ROOM SCHEDULER
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '2rem' }}>
        
        <section>
          <div className="dash-card modern-card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="section-label" style={{ marginBottom: 0 }}>ROOM SESSION SELECTION</div>
              <button 
                onClick={loadData} 
                className="small-btn" 
                style={{ background: 'var(--rose-100)', color: 'var(--ff-primary)', border: 'none', fontSize: '0.65rem' }}
              >
                🔄 REFRESH ({matches.length} MATCHES)
              </button>
            </div>
            
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
               <label className="form-label">CHOOSE SCHEDULED MATCH</label>
               <select 
                 className="form-input" 
                 value={selectedMatchId} 
                 onChange={e => { 
                    const mId = e.target.value;
                    setSelectedMatchId(mId); 
                    const match = matches.find(m => m.id === mId);
                    if (match?.match_squads) {
                        setSelectedSquads(match.match_squads.map((s: any) => s.team_id));
                    } else {
                        setSelectedSquads([]); 
                    }
                 }} 
                 style={{ background: 'var(--rose-50)', color: '#000', fontWeight: 700, height: '62px' }}
               >
                  <option value="">-- SELECT AN UPCOMING SESSION --</option>
                   {matches.map(m => {
                     const statusLabel = m.status === 'Completed' ? '[COMPLETED] ' : m.status === 'Ongoing' ? '[ONGOING] ' : '';
                     return (
                      <option key={m.id} value={m.id}>
                         {statusLabel}[{m.mode}] {(m.map_name || 'TBD').toUpperCase()} - {m.match_date ? new Date(m.match_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'DATE TBD'}
                      </option>
                     );
                   })}
               </select>
            </div>

            {selectedMatchId && (
               <div className="animate-scale-in" style={{ marginTop: '2.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                       <div className="section-label" style={{ marginBottom: 0, color: selectedSquads.length >= capacity ? '#059669' : 'var(--ff-primary)' }}>
                          ENLIST {mode} SQUADRONS ({selectedSquads.length}/{capacity}) {selectedSquads.length >= capacity && '— FULL'}
                       </div>
                   </div>

                   {activeMatch?.match_squads?.length > 0 && (
                      <div className="animate-up" style={{ padding: '0.75rem 1rem', background: 'var(--ff-primary)', color: '#000', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 900, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <span>⚠ THIS ROOM IS ALREADY IN USE ({activeMatch.match_squads.length}/{capacity} FULL)</span>
                      </div>
                   )}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.8rem', maxHeight: '400px', overflowY: 'auto', padding: '1.25rem', background: 'var(--rose-50)', borderRadius: '20px' }}>
                     {filteredTeams.length === 0 ? (
                       <div style={{ padding: '3rem', fontSize: '0.7rem', opacity: 0.5, textAlign: 'center' }}>NO APPROVED {mode} SQUADS AVAILABLE.</div>
                     ) : (
                       filteredTeams.map(t => (
                        <div 
                          key={t.id} 
                          onClick={() => toggleSquad(t.id)}
                          style={{ 
                            padding: '1.2rem', 
                            background: selectedSquads.includes(t.id) ? 'var(--ff-primary)' : '#FFF',
                            color: selectedSquads.includes(t.id) ? '#000' : 'inherit',
                            borderRadius: '16px', cursor: 'pointer', textAlign: 'center', border: '1px solid var(--rose-100)', transition: 'all 0.2s'
                          }}
                        >
                           <div style={{ fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>{t.team_name}</div>
                           <div style={{ fontSize: '0.55rem', color: '#059669', marginTop: '0.3rem', fontWeight: 800 }}>✓ PAID</div>
                        </div>
                       ))
                     )}
                  </div>

                   <button 
                     className="btn-primary" 
                     style={{ marginTop: '3rem', height: '62px', opacity: selectedSquads.length === capacity ? 1 : 0.6 }} 
                     onClick={handleFinalize} 
                     disabled={saving || selectedSquads.length < capacity}
                   >
                       {saving ? 'UNITING SQUADRONS...' : 
                        selectedSquads.length < capacity ? `WAITING FOR ${capacity - selectedSquads.length} MORE` : 
                        activeMatch?.match_squads?.length > 0 ? `RE-FINALIZE ${mode} ROSTER 📡` : `FINALIZE ${mode} ROSTER 📡`}
                   </button>
               </div>
            )}
          </div>
        </section>

        <section>
          <div className="dash-card modern-card" style={{ padding: '2.5rem' }}>
             <div className="section-label" style={{ marginBottom: '2.5rem' }}>LIVE SESSION DETAILS</div>
             {activeMatch ? (
               <div className="animate-up">
                  <div style={{ padding: '2rem', background: 'var(--rose-50)', borderRadius: '24px', marginBottom: '2rem' }}>
                     <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#F43F5E' }}>LOCATION & TIME</div>
                     <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.5rem' }}>{activeMatch.map_name.toUpperCase()}</div>
                     <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{new Date(activeMatch.match_date).toLocaleString()}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                     <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px' }}>
                        <div style={{ fontSize: '0.55rem', opacity: 0.5 }}>ROOM ID</div>
                        <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{activeMatch.room_id}</div>
                     </div>
                     <div style={{ padding: '1.5rem', background: '#F8FAFC', borderRadius: '16px' }}>
                        <div style={{ fontSize: '0.55rem', opacity: 0.5 }}>PASSWORD</div>
                        <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{activeMatch.room_password}</div>
                     </div>
                  </div>
               </div>
             ) : (
               <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.3, fontSize: '0.8rem' }}>SELECT A SCHEDULED SLOT TO VIEW ROOM SPECS</div>
             )}
          </div>
        </section>

      </div>
    </div>
  );
}
