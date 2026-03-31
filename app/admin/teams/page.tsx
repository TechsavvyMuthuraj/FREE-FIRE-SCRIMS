"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminTeams, deleteTeam, updateTeam, updateTeamPaymentStatus, getApprovedSquadsForMatch } from "../actions";
import Toast from "../../../components/Toast";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("ALL MODES");
  const [activeTab, setActiveTab] = useState<"directory" | "deployment">("directory");
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });

  // Deployment State
  const [deployMode, setDeployMode] = useState<"CS" | "BR">("CS");
  const [pendingSquads, setPendingSquads] = useState<any[]>([]);

  // Modal States
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await getAdminTeams();
      setTeams(data);
    } catch (err) {
      notify("DATABASE OFFLINE", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (activeTab === "deployment") {
      getApprovedSquadsForMatch(deployMode).then(setPendingSquads);
    }
  }, [activeTab, deployMode]);

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Permanently remove this squad?")) return;
    try {
      await deleteTeam(id);
      setTeams(teams.filter((team) => team.id !== id));
      if (selectedTeam?.id === id) handleCloseModal();
      notify("SQUAD TERMINATED", "success");
    } catch (err) {
      notify("TERMINATION REJECTED", "error");
    }
  };

  const handleView = (team: any) => {
    setSelectedTeam(team);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setSelectedTeam(null);
    setIsEditing(false);
  };

  const handleSaveTeam = async () => {
    setSaving(true);
    try {
      await updateTeam(selectedTeam.id, editForm);
      await fetchTeams();
      setIsEditing(false);
      setSelectedTeam({ ...selectedTeam, ...editForm });
      notify("TEAM RECORD UPDATED", "success");
    } catch (error) {
      notify("UPDATE FAILED", "error");
    }
    setSaving(false);
  };

  const filteredTeams = teams.filter(t => {
    const qMatches = !search || t.team_name.toLowerCase().includes(search.toLowerCase()) || (t.custom_id && t.custom_id.toLowerCase().includes(search.toLowerCase()));
    const modeMatches = modeFilter === "ALL MODES" || t.mode === modeFilter;
    return qMatches && modeMatches;
  });

  return (
    <div className="admin-panel active animate-up">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link href="/admin/dashboard" className="admin-back-btn" style={{ margin: 0 }}>← BACK</Link>
        <span>TEAM MANAGEMENT</span>
      </div>

      {/* SUB-TABS */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--rose-100)', marginBottom: '2rem' }}>
         <button onClick={() => setActiveTab("directory")} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'directory' ? '3px solid var(--ff-primary)' : '3px solid transparent', color: activeTab === 'directory' ? 'var(--ff-primary)' : 'var(--rose-400)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s' }}>SQUAD DIRECTORY</button>
         <button onClick={() => setActiveTab("deployment")} style={{ padding: '1rem 0', background: 'none', border: 'none', borderBottom: activeTab === 'deployment' ? '3px solid var(--ff-primary)' : '3px solid transparent', color: activeTab === 'deployment' ? 'var(--ff-primary)' : 'var(--rose-400)', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.3s' }}>DEPLOYMENT PREVIEW</button>
      </div>

      {activeTab === 'directory' ? (
        <div className="table-wrap">
          <div className="table-toolbar">
            <input 
              className="search-input" 
              placeholder="Search Squads..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select 
              className="filter-select" 
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
            >
              <option value="ALL MODES">ALL MODES</option>
              <option value="CS">CS MODE</option>
              <option value="BR">BR MODE</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>SQUAD IDENTITY</th>
                  <th>LEADER</th>
                  <th>MODE</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'center' }}>PAYMENT</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>SYNCHRONIZING...</td></tr>
                ) : filteredTeams.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>NO RECORDS FOUND</td></tr>
                ) : (
                  filteredTeams.map((team) => (
                    <tr key={team.id}>
                      <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ff-primary)', fontWeight: 800 }}>#{team.id.split("-")[0]}</span></td>
                      <td><strong>{team.team_name}</strong></td>
                      <td>{team.leader_name}</td>
                      <td><span className={`mode-tag-luxe ${team.mode === 'CS' ? 'cs' : 'br'}`} style={{ 
                        fontSize: '0.6rem', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(255,140,0,0.05)', color: 'var(--ff-primary)', fontWeight: 800, border: '1px solid currentColor'
                      }}>{team.mode}</span></td>
                      <td><span className="status-badge" style={{ background: '#ECFDF5', color: '#059669', fontSize: '0.65rem' }}>REGISTERED</span></td>
                      <td style={{ textAlign: 'center' }}>
                          <span style={{ 
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            background: team.payment_status === 'approved' ? '#ECFDF5' : team.payment_status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
                            color: team.payment_status === 'approved' ? '#059669' : team.payment_status === 'rejected' ? '#DC2626' : '#D97706',
                            border: `1px solid ${team.payment_status === 'approved' ? '#D1FAE5' : team.payment_status === 'rejected' ? '#FEE2E2' : '#FEF3C7'}`
                          }}>
                            {(team.payment_status || 'pending').toUpperCase()}
                          </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button className="action-btn" onClick={() => handleView(team)}>DETAILS</button>
                          <button className="action-btn btn-delete" onClick={() => handleDeleteTeam(team.id)}>DEL</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="animate-up">
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: '1.5rem', margin: 0 }}>MATCH DEPLOYMENT QUEUE</h3>
                <p style={{ color: 'var(--ff-muted)', fontSize: '0.8rem' }}>Next 12 squads ready for official room assignment.</p>
              </div>
              <select className="filter-select" value={deployMode} onChange={e => setDeployMode(e.target.value as any)} style={{ height: '48px', minWidth: '200px' }}>
                <option value="CS">CS COMPETITORS</option>
                <option value="BR">BR COMPETITORS</option>
              </select>
           </div>

           <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
              {pendingSquads.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', color: 'var(--ff-muted)' }}>NO SQUADS VERIFIED FOR DEPLOYMENT</div>
              ) : (
                pendingSquads.map((s, i) => (
                  <div key={s.id} className="dash-card modern-card" style={{ padding: '1.5rem', borderLeft: '3px solid var(--ff-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, background: 'var(--rose-50)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>RANK: {i+1}</span>
                      <span style={{ fontSize: '0.55rem', opacity: 0.5 }}>{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--rose-950)', marginBottom: '0.5rem' }}>{s.team_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ff-muted)' }}>Leader: {s.leader_name}</div>
                  </div>
                ))
              )}
           </div>

           {pendingSquads.length >= 12 && (
             <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <Link href="/admin/matches" className="btn-primary" style={{ padding: '1rem 3rem' }}>DEPLOY THESE SQUADS TO NEW ROOM →</Link>
             </div>
           )}
        </div>
      )}
      
      {/* TEAM MODAL REMAINING THE SAME */}
      {selectedTeam && (
        <div className="modal-overlay active" onClick={handleCloseModal} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
          <div className="animate-scale-in modal-card" onClick={e => e.stopPropagation()} style={{ background: '#FFFFFF', width: '100%', maxWidth: '650px', borderRadius: '24px', boxShadow: '0 50px 100px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ padding: '2.5rem', borderBottom: '1px solid var(--rose-50)' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--ff-primary)', fontWeight: 900, letterSpacing: '0.2em', marginBottom: '0.5rem' }}>SQUAD DOSSIER</div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: '2rem', margin: 0 }}>{isEditing ? 'EDITING RECORD' : selectedTeam.team_name}</h2>
            </div>
            
            <div style={{ padding: '2.5rem', maxHeight: '60vh', overflowY: 'auto' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group"><label className="form-label">TEAM NAME</label><input className="form-input" value={editForm.team_name} onChange={e => setEditForm({...editForm, team_name: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">LEADER IGN</label><input className="form-input" value={editForm.leader_name} onChange={e => setEditForm({...editForm, leader_name: e.target.value})} /></div>
                  <div className="form-group"><label className="form-label">WHATSAPP</label><input className="form-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>CANCEL</button>
                    <button className="btn-primary" onClick={handleSaveTeam} disabled={saving} style={{ flex: 1 }}>SAVE CHANGES</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    <div><div className="form-label">LEADER</div><div style={{ fontWeight: 700 }}>{selectedTeam.leader_name}</div></div>
                    <div><div className="form-label">WHATSAPP</div><div style={{ fontWeight: 700 }}>{selectedTeam.phone}</div></div>
                    <div><div className="form-label">MODE</div><div style={{ fontWeight: 800, color: 'var(--ff-primary)' }}>{selectedTeam.mode}</div></div>
                  </div>

                  {/* PAYMENT RECEIPT PORTAL */}
                  <div style={{ borderTop: '1px solid var(--rose-50)', paddingTop: '2rem', marginBottom: '2.5rem' }}>
                    <div className="form-label" style={{ marginBottom: '1.2rem' }}>VERIFIED TRANSACTION PROOF</div>
                    <div style={{ width: '100%', height: '350px', background: 'var(--rose-50)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--rose-100)', position: 'relative' }}>
                       {selectedTeam.payment_screenshot ? (
                         <img src={selectedTeam.payment_screenshot} alt="RECEIPT" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                       ) : (
                         <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3, flexDirection: 'column', gap: '0.8rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>📄</span>
                            <span style={{ fontWeight: 800, fontSize: '0.6rem' }}>NO RECEIPT UPLOADED</span>
                         </div>
                       )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--rose-50)', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <span className="form-label">PAYMENT STATUS</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: selectedTeam.payment_status === 'approved' ? '#059669' : '#D97706' }}>{(selectedTeam.payment_status || 'PENDING').toUpperCase()}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                       <button onClick={() => updateTeamPaymentStatus(selectedTeam.id, 'approved').then(() => { notify("SQUAD VERIFIED", "success"); fetchTeams(); handleCloseModal(); })} className="btn-primary" style={{ flex: 1, background: '#059669', border: 'none' }}>APPROVE ✓</button>
                       <button onClick={() => updateTeamPaymentStatus(selectedTeam.id, 'rejected').then(() => { notify("SQUAD REJECTED", "error"); fetchTeams(); handleCloseModal(); })} className="btn-delete" style={{ flex: 1, border: '1px solid #FECACA', background: 'none' }}>REJECT ×</button>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--rose-50)', paddingTop: '2.5rem', marginTop: '2.5rem' }}>
                    <div className="form-label" style={{ marginBottom: '1.5rem' }}>SQUAD ROSTER ({selectedTeam.players?.length || 0})</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                      {selectedTeam.players?.map((p: any, i: number) => (
                        <div key={i} style={{ padding: '1rem', background: 'var(--rose-50)', borderRadius: '12px' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{p.in_game_name}</div>
                          <div style={{ opacity: 0.5, fontSize: '0.7rem' }}>UID: {p.game_uid}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ padding: '1.5rem 2.5rem', background: 'var(--rose-50)', display: 'flex', gap: '1rem' }}>
               {!isEditing && <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(true)}>EDIT RECORD</button>}
               <button className="btn-secondary" style={{ flex: 1 }} onClick={handleCloseModal}>CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
