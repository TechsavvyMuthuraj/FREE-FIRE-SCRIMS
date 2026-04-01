"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getAdminTeams, deleteTeam, updateTeam, updateTeamPaymentStatus, getApprovedSquadsForMatch } from "../actions";
import Toast from "../../../components/Toast";
import ConfirmModal from "../../../components/ConfirmModal";
import ImagePreviewModal from "../../../components/ImagePreviewModal";
import { ZoomIn } from "lucide-react";

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
  const [selectedDeployIds, setSelectedDeployIds] = useState<string[]>([]);

  // Modal States
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  useEffect(() => {
    setSelectedDeployIds([]);
  }, [deployMode]);

  const toggleSquad = (id: string) => {
    const capacity = deployMode === 'CS' ? 2 : 12;
    if (selectedDeployIds.includes(id)) {
      setSelectedDeployIds(selectedDeployIds.filter(sid => sid !== id));
    } else {
      if (selectedDeployIds.length < capacity) {
        setSelectedDeployIds([...selectedDeployIds, id]);
      } else {
        notify(`ONLY ${capacity} SQUADS ALLOWED FOR ${deployMode}`, "warning");
      }
    }
  };

  const autoSelect = () => {
    const capacity = deployMode === 'CS' ? 2 : 12;
    setSelectedDeployIds(pendingSquads.slice(0, capacity).map(s => s.id));
    notify(`TOP ${capacity} SQUADS SELECTED`, "success");
  };

  const handleDeleteTeam = async (id: string) => {
    setTeamToDelete(id);
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;
    try {
      await deleteTeam(teamToDelete);
      setTeams(teams.filter((team) => team.id !== teamToDelete));
      if (selectedTeam?.id === teamToDelete) handleCloseModal();
      notify("SQUAD TERMINATED", "success");
    } catch (err) {
      notify("TERMINATION REJECTED", "error");
    } finally {
      setTeamToDelete(null);
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
      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--rose-100)', marginBottom: '1.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', flexShrink: 0 }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
               <div style={{ minWidth: '240px' }}>
                 <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', margin: 0 }}>MATCH DEPLOYMENT QUEUE</h3>
                 <p style={{ color: 'var(--ff-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Select exactly {deployMode === 'CS' ? '2' : '12'} squads to deploy to a new room.</p>
               </div>
               <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  {selectedDeployIds.length === 0 && pendingSquads.length > 0 && (
                    <button onClick={autoSelect} className="action-btn" style={{ background: 'var(--ff-primary)', color: '#000', border: 'none', padding: '0.5rem 1rem', fontSize: '0.6rem', fontWeight: 900 }}>
                      ⚡ SELECT TOP {deployMode === 'CS' ? '2' : '12'}
                    </button>
                  )}
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: selectedDeployIds.length === (deployMode === 'CS' ? 2 : 12) ? '#059669' : 'var(--ff-primary)' }}>
                    SELECTED: {selectedDeployIds.length} / {deployMode === 'CS' ? 2 : 12}
                  </span>
                  <select className="filter-select" value={deployMode} onChange={e => setDeployMode(e.target.value as any)} style={{ height: '48px', minWidth: '180px', width: 'auto' }}>
                    <option value="CS">CS COMPETITORS</option>
                    <option value="BR">BR COMPETITORS</option>
                  </select>
               </div>
            </div>

            <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
               {pendingSquads.length === 0 ? (
                <div style={{ gridColumn: '1/-1', padding: '5rem', textAlign: 'center', color: 'var(--ff-muted)' }}>NO SQUADS VERIFIED FOR DEPLOYMENT</div>
              ) : (
                pendingSquads.map((s, i) => {
                  const isSelected = selectedDeployIds.includes(s.id);
                  return (
                    <div 
                      key={s.id} 
                      onClick={() => toggleSquad(s.id)}
                      className="dash-card modern-card" 
                      style={{ 
                        padding: '1.5rem', 
                        borderLeft: isSelected ? '5px solid var(--ff-primary)' : '3px solid #e5e7eb',
                        background: isSelected ? 'rgba(255,140,0,0.05)' : '#FFF',
                        cursor: 'pointer',
                        transform: isSelected ? 'scale(1.02)' : 'none',
                        boxShadow: isSelected ? '0 10px 25px rgba(255,140,0,0.1)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, background: isSelected ? 'var(--ff-primary)' : 'var(--rose-50)', color: isSelected ? '#000' : 'inherit', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            {isSelected ? '✓ SELECTED' : `RANKING: ${i+1}`}
                        </span>
                        <span style={{ fontSize: '0.55rem', opacity: 0.5 }}>{new Date(s.created_at).toLocaleDateString()}</span>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: isSelected ? 'var(--ff-primary)' : 'var(--rose-950)', marginBottom: '0.5rem' }}>{s.team_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--ff-muted)' }}>Leader: {s.leader_name}</div>
                    </div>
                  );
                })
              )}
           </div>

           <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--ff-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                     {selectedDeployIds.length === (deployMode === 'CS' ? 2 : 12) 
                        ? '🔥 READY FOR DEPLOYMENT → CLICK BELOW' 
                        : `PLEASE SELECT EXACTLY ${deployMode === 'CS' ? '2' : '12'} SQUADS TO PROCEED`}
                </p>
                <Link 
                  href={`/admin/matches?activeTab=create&mode=${deployMode}&squads=${selectedDeployIds.join(',')}`} 
                  className="btn-primary" 
                  style={{ 
                    padding: '1.25rem 4rem',
                    opacity: selectedDeployIds.length === (deployMode === 'CS' ? 2 : 12) ? 1 : 0.3,
                    pointerEvents: selectedDeployIds.length === (deployMode === 'CS' ? 2 : 12) ? 'auto' : 'none',
                    display: 'inline-block'
                   }}
                >
                  DEPLOY {selectedDeployIds.length} SQUADS TO NEW ROOM →
                </Link>
           </div>
        </div>
      )}

      {/* TEAM DETAIL MODAL — rendered via portal at body level */}
      {selectedTeam && typeof window !== 'undefined' && createPortal(
        <div 
          onClick={handleCloseModal}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: '1rem', overflowY: 'auto'
          }}
        >
          <div 
            className="animate-scale-in"
            onClick={e => e.stopPropagation()} 
            style={{ 
              background: '#FFFFFF', width: '100%', maxWidth: '680px', borderRadius: '28px', 
              boxShadow: '0 40px 80px rgba(0,0,0,0.4)', overflow: 'hidden', margin: 'auto'
            }}
          >
            {/* HEADER */}
            <div style={{ padding: 'clamp(1.25rem, 5vw, 2rem) clamp(1.25rem, 5vw, 2.5rem) 1.25rem', borderBottom: '2px solid #FFF5F5', background: 'linear-gradient(135deg, #fff 0%, #FFF5F5 100%)' }}>
              <div style={{ fontSize: '0.5rem', color: 'var(--ff-primary)', fontWeight: 900, letterSpacing: '0.25em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Squad Dossier</div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', margin: 0, color: '#1a1a1a', lineHeight: 1.1, wordBreak: 'break-word', textTransform: 'uppercase' }}>
                {isEditing ? '✏️ Editing Record' : selectedTeam.team_name}
              </h2>
            </div>

            {/* SCROLLABLE BODY */}
            <div style={{ padding: 'clamp(1.25rem, 5vw, 2rem) clamp(1.25rem, 5vw, 2.5rem)', maxHeight: '70vh', overflowY: 'auto' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* INFO GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '1rem' }}>
                    <div style={{ background: '#FFF5F5', padding: '1rem', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.55rem', color: '#9ca3af', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '0.4rem' }}>LEADER</div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a1a1a' }}>{selectedTeam.leader_name}</div>
                    </div>
                    <div style={{ background: '#FFF5F5', padding: '1rem', borderRadius: '12px' }}>
                      <div style={{ fontSize: '0.55rem', color: '#9ca3af', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '0.4rem' }}>WHATSAPP</div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1a1a1a' }}>{selectedTeam.phone}</div>
                    </div>
                    <div style={{ background: 'rgba(255,140,0,0.06)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,140,0,0.15)' }}>
                      <div style={{ fontSize: '0.55rem', color: '#9ca3af', fontWeight: 800, letterSpacing: '0.15em', marginBottom: '0.4rem' }}>MODE</div>
                      <div style={{ fontWeight: 900, fontSize: '1rem', color: 'var(--ff-primary)' }}>{selectedTeam.mode}</div>
                    </div>
                  </div>

                  {/* RECEIPT */}
                  <div style={{ borderTop: '1px solid #FFF0F0', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em', color: '#9ca3af' }}>PAYMENT RECEIPT</div>
                      <span 
                        onClick={(e) => { e.stopPropagation(); if(selectedTeam.payment_screenshot_url) setPreviewImage(selectedTeam.payment_screenshot_url); }}
                        style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--ff-primary)', cursor: 'pointer', textDecoration: 'underline', padding: '0.5rem' }}
                      >🔍 CLICK TO ENLARGE</span>
                    </div>
                    
                    {/* ENHANCED THUMBNAIL TRIGGER */}
                    <div 
                      className="group relative overflow-hidden"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (selectedTeam.payment_screenshot_url) setPreviewImage(selectedTeam.payment_screenshot_url); 
                      }}
                      style={{ 
                        width: '100%', height: '220px', background: '#FFF5F5', borderRadius: '16px', overflow: 'hidden', 
                        border: '2px dashed #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)', position: 'relative',
                        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.03)'
                      }}
                    >
                      {selectedTeam.payment_screenshot_url ? (
                        <>
                          <img 
                            src={selectedTeam.payment_screenshot_url} 
                            alt="Receipt" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }} 
                            className="thumbnail-img"
                          />
                          {/* PREMIUM HOVER OVERLAY */}
                          <div 
                            className="overlay-mask"
                            style={{ 
                              position: 'absolute', inset: 0, background: 'rgba(255, 140, 0, 0.08)', transition: 'all 0.3s', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0,
                              backdropFilter: 'blur(2px)'
                            }}
                          >
                             <div style={{ 
                               background: 'var(--ff-primary)', color: '#000', padding: '0.75rem 1.5rem', 
                               borderRadius: '30px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.5rem',
                               boxShadow: '0 10px 25px rgba(255,140,0,0.4)', transform: 'translateY(10px)', transition: 'all 0.3s'
                             }} className="overlay-btn">
                               <ZoomIn size={18} strokeWidth={3} />
                               <span style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>PREVIEW</span>
                             </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', opacity: 0.3 }}>
                          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800 }}>NO RECEIPT UPLOADED</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <style jsx>{`
                    div:hover > .overlay-mask { opacity: 1 !important; }
                    div:hover > .overlay-mask .overlay-btn { transform: translateY(0) !important; }
                    div:hover > .thumbnail-img { transform: scale(1.05) !important; }
                    div:hover { border-color: var(--ff-primary) !important; background: #FFF !important; }
                  `}</style>

                  {/* PAYMENT STATUS + ACTIONS */}
                  <div style={{ borderTop: '1px solid #FFF0F0', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em', color: '#9ca3af' }}>PAYMENT STATUS</span>
                      <span style={{ 
                        fontSize: '0.7rem', fontWeight: 900, padding: '0.3rem 0.8rem', borderRadius: '20px',
                        background: selectedTeam.payment_status === 'approved' ? '#ECFDF5' : selectedTeam.payment_status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
                        color: selectedTeam.payment_status === 'approved' ? '#059669' : selectedTeam.payment_status === 'rejected' ? '#DC2626' : '#D97706',
                        border: `1px solid currentColor`
                      }}>{(selectedTeam.payment_status || 'PENDING').toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                      <button 
                        onClick={() => updateTeamPaymentStatus(selectedTeam.id, 'approved').then(() => { notify('SQUAD VERIFIED', 'success'); fetchTeams(); handleCloseModal(); })} 
                        style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: '#FFF', border: 'none', padding: '0.9rem', fontWeight: 900, borderRadius: '12px', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.05em' }}
                      >✓ APPROVE</button>
                      <button 
                        onClick={() => updateTeamPaymentStatus(selectedTeam.id, 'rejected').then(() => { notify('SQUAD REJECTED', 'error'); fetchTeams(); handleCloseModal(); })} 
                        style={{ background: 'none', color: '#DC2626', border: '1.5px solid #FECACA', padding: '0.9rem', fontWeight: 900, borderRadius: '12px', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.05em' }}
                      >✗ REJECT</button>
                    </div>
                  </div>

                  {/* SQUAD ROSTER */}
                  <div style={{ borderTop: '1px solid #FFF0F0', paddingTop: '1.5rem' }}>
                    <div style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.15em', color: '#9ca3af', marginBottom: '1rem' }}>SQUAD ROSTER ({selectedTeam.players?.length || 0})</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 140px), 1fr))', gap: '0.75rem' }}>
                      {selectedTeam.players?.map((p: any, i: number) => (
                        <div key={i} style={{ padding: '0.75rem 1rem', background: '#FFF5F5', borderRadius: '10px', borderLeft: '3px solid var(--ff-primary)' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1a1a1a' }}>{p.in_game_name}</div>
                          <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '0.2rem' }}>UID: {p.game_uid}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div style={{ padding: '1.25rem 2.5rem', background: '#FFF5F5', display: 'flex', gap: '0.75rem', borderTop: '1px solid #FEE2E2' }}>
              {!isEditing && (
                <button 
                  className="btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => { setIsEditing(true); setEditForm({ team_name: selectedTeam.team_name, leader_name: selectedTeam.leader_name, phone: selectedTeam.phone }); }}
                >
                  EDIT RECORD
                </button>
              )}
              <button className="btn-secondary" style={{ flex: 1 }} onClick={handleCloseModal}>CLOSE</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <ConfirmModal 
        isOpen={!!teamToDelete}
        title="TERMINATE SQUAD?"
        message="This will permanently delete the squad and all its registered players from the tournament roster. This action is irreversible."
        onConfirm={confirmDeleteTeam}
        onCancel={() => setTeamToDelete(null)}
        confirmText="TERMINATE"
        type="danger"
      />

      {/* REUSABLE IMAGE PREVIEW COMPONENT */}
      <ImagePreviewModal 
        isOpen={!!previewImage}
        src={previewImage}
        onClose={() => setPreviewImage(null)}
        alt="Payment Receipt Preview"
      />
    </div>
  );
}
