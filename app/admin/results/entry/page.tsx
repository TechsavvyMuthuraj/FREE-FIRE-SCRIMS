"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminMatches, getMatchDetails, saveSquadResults } from "../../actions";
import Toast from "../../../../components/Toast";

export default function ResultsEntryPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  const loadData = async () => {
    try {
      const ms = await getAdminMatches();
      setMatches(ms.filter(m => m.status !== 'Completed'));
    } catch (err) { }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleSelectMatch = async (id: string) => {
    if (!id) return setActiveMatch(null);
    setLoading(true);
    try {
      const details = await getMatchDetails(id);
      setActiveMatch(details);
      // Initialize results
      const initial = details.match_squads.map((s: any) => ({
        team_id: s.team_id,
        team_name: s.teams.team_name,
        placement_rank: 12,
        kill_points: 0,
        placement_points: 1
      }));
      setResults(initial);
    } catch (err) { notify("FETCH FAILED", "error"); }
    setLoading(false);
  };

  const updateEntry = (idx: number, field: string, val: number) => {
    const next = [...results];
    next[idx][field] = val;
    
    // Auto-calculate placement points if rank changed
    if (field === 'placement_rank') {
        const rank = Math.max(1, Math.min(12, val));
        next[idx].placement_rank = rank;
        next[idx].placement_points = (13 - rank); // 1st=12, 12th=1
    }
    setResults(next);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      await saveSquadResults(activeMatch.id, results.map(r => ({
          team_id: r.team_id,
          placement_rank: r.placement_rank,
          kill_points: r.kill_points,
          placement_points: r.placement_points
      })));
      notify("RESULT DISPATCHED SUCCESSFULLY", "success");
      setActiveMatch(null);
      loadData();
    } catch (err: any) { notify(`SAVE FAILED: ${err.message}`, "error"); }
    setSubmitting(false);
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--rose-400)' }}>INITIALIZING SCOREBOARD...</div>;

  return (
    <div className="admin-panel active animate-up">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/results" className="admin-back-btn">← BACK</Link>
        MATCH RESULTS PORTAL
      </div>

      <div style={{ maxWidth: '900px', marginBottom: '3rem' }}>
         <div className="dash-card modern-card" style={{ padding: '2.5rem' }}>
            <div className="section-label">SELECT SESSION FOR SCORING</div>
            <select 
              className="form-input" 
              style={{ background: 'var(--rose-50)', marginTop: '1.5rem', fontWeight: 800, color: '#000' }}
              value={activeMatch?.id || ""}
              onChange={e => handleSelectMatch(e.target.value)}
            >
               <option value="">-- CHOOSE PENDING OR ONGOING ROOM --</option>
               {matches.map(m => (
                 <option key={m.id} value={m.id}>
                    [{m.mode}] {m.map_name.toUpperCase()} - {new Date(m.match_date).toLocaleString()}
                 </option>
               ))}
            </select>
         </div>
      </div>

      {activeMatch && (
         <div className="animate-scale-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              <div className="dash-card modern-card" style={{ padding: '2rem', borderLeft: '4px solid var(--ff-primary)' }}>
                 <div style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.5 }}>ACTIVE ROOM MATCH</div>
                 <div style={{ fontSize: '1.5rem', fontWeight: 900 }}>{activeMatch.map_name.toUpperCase()} ({activeMatch.mode})</div>
              </div>
              <div className="dash-card modern-card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>SQUADS ENLISTED: {results.length}</div>
              </div>
            </div>

            <div className="table-wrap" style={{ background: '#FFF', borderRadius: '32px', padding: '1rem' }}>
               <table className="admin-table">
                  <thead>
                     <tr>
                        <th>SQUADRON NAME</th>
                        <th>RANK (1-12)</th>
                        <th>KILL POINTS</th>
                        <th>PLACEMENT PTS</th>
                        <th>TOTAL</th>
                     </tr>
                  </thead>
                  <tbody>
                     {results.map((r, i) => (
                        <tr key={i}>
                           <td style={{ fontWeight: 800 }}>{r.team_name}</td>
                           <td style={{ width: '120px' }}>
                              <input type="number" className="form-input" value={r.placement_rank} onChange={e => updateEntry(i, 'placement_rank', parseInt(e.target.value))} style={{ padding: '0.5rem', textAlign: 'center', background: 'var(--rose-50)', fontWeight: 800 }} />
                           </td>
                           <td style={{ width: '120px' }}>
                              <input type="number" className="form-input" value={r.kill_points} onChange={e => updateEntry(i, 'kill_points', parseInt(e.target.value))} style={{ padding: '0.5rem', textAlign: 'center', background: 'var(--rose-50)', fontWeight: 800 }} />
                           </td>
                           <td style={{ fontWeight: 900, color: 'var(--ff-primary)' }}>+{r.placement_points}</td>
                           <td style={{ fontWeight: 900 }}>{r.kill_points + r.placement_points}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>

               <button className="btn-primary" style={{ marginTop: '2.5rem', height: '62px' }} onClick={handleSave} disabled={submitting}>
                  {submitting ? 'COORDINATING SCORES...' : 'DISPATCH RESULTS & CLOSE ROOM 🏆'}
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
