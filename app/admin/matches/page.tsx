"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminMatches, createMatch as saveMatch, deleteMatch as removeMatch, getAdminTeams } from "../actions";
import Toast from "../../../components/Toast";
import ConfirmModal from "../../../components/ConfirmModal";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });
  
  // Modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Create Match form state
  const [room_id, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [map_name, setMapName] = useState("Bermuda");
  const [mode, setMode] = useState("CS");
  const [scheduled_time, setScheduledTime] = useState("");
  
  const [activeTab, setActiveTab] = useState<"create" | "list" | "whatsapp">("create");

  // Broadcast state (WhatsApp Header/Message)
  const [bcMessage, setBcMessage] = useState("");
  const [bcTarget, setBcTarget] = useState("ALL");
  const [bcTime, setBcTime] = useState("");
  const [bcRoomId, setBcRoomId] = useState("");
  const [bcPass, setBcPass] = useState("");
  const [bcMap, setBcMap] = useState("Bermuda");

  // WhatsApp Alert state
  const [waTeams, setWaTeams] = useState<any[]>([]);
  const [waLoading, setWaLoading] = useState(false);

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await getAdminMatches();
      setMatches(data);
    } catch (err) {
      notify("DATABASE ERROR", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleCreate = async () => {
    if (!scheduled_time) return notify("SCHEDULE TIME REQUIRED", "warning");
    
    try {
      const fullISOString = new Date(scheduled_time).toISOString();
      await saveMatch({
        room_id,
        password,
        map: map_name,
        mode,
        date_time: fullISOString
      });
      setRoomId("");
      setPassword("");
      setScheduledTime("");
      fetchMatches();
      setActiveTab("list");
      notify("MATCH SCHEDULED SUCCESSFULLY", "success");
    } catch (err: any) {
      notify(`CREATE FAILED: ${err.message}`, "error");
    }
  };

  const handleConfirmedDelete = async () => {
    if (!deleteId) return;
    try {
      await removeMatch(deleteId);
      setMatches(matches.filter(m => m.id !== deleteId));
      notify("MATCH TERMINATED", "success");
    } catch (err) {
      notify("DELETE FAILED", "error");
    }
    setDeleteId(null);
  };

  const handleMatchAlert = (m: any) => {
    setBcRoomId(m.room_id);
    setBcPass(m.room_password);
    setBcMap(m.map_name);
    setBcTarget(m.mode === "CS" ? "CS" : "BR");
    
    // Auto-calculate display time
    if (m.match_date) {
      setBcTime(new Date(m.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    setBcMessage(`${m.mode} MATCH COMMENCING. PREPARE FOR DEPLOYMENT.`);
    
    setActiveTab('whatsapp');
    // Load teams for this match
    setWaLoading(true);
    getAdminTeams().then(teams => {
       const participants = m.match_squads?.map((s: any) => s.team_id) || [];
       setWaTeams(teams.filter(t => participants.includes(t.id)));
       notify("WAR ROOM SQUADRONS LOADED", "success");
    }).catch(() => notify("SQUAD RETRIEVAL FAILED", "error"))
    .finally(() => setWaLoading(false));
  };

  return (
    <div className="admin-panel active animate-up">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />
      
      <ConfirmModal 
        isOpen={!!deleteId} 
        onCancel={() => setDeleteId(null)} 
        onConfirm={handleConfirmedDelete}
        title="Terminate Match?"
        message="This will permanently delete the match session and all associated squad records from the upcoming schedule. This action is irreversible."
        confirmLabel="TERMINATE"
      />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        MATCH CONTROL
      </div>

      <div className="admin-tabs" style={{ marginBottom: '3rem' }}>
        <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>CREATE MATCH</button>
        <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>SCHEDULED</button>
        <button className={`tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`} onClick={() => setActiveTab('whatsapp')}>WHATSAPP BROADCAST</button>
      </div>

      {activeTab === 'create' && (
        <div style={{ maxWidth: '600px' }}>
          <div className="dash-card modern-card" style={{ padding: '2.5rem' }}>
            <div className="section-label">NEW BATTLE SESSION</div>
            <div className="form-group" style={{ marginTop: '2rem' }}>
              <label className="form-label">MATCH MODE</label>
              <select className="form-input" value={mode} onChange={e => setMode(e.target.value)} style={{ background: 'var(--rose-50)', fontWeight: 800 }}>
                <option value="CS">CLASH SQUAD (4v4)</option>
                <option value="BR">BATTLE ROYALE (FULL)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">CHOOSE MAP</label>
              <select className="form-input" value={map_name} onChange={e => setMapName(e.target.value)} style={{ background: 'var(--rose-50)' }}>
                <option>Bermuda</option>
                <option>Purgatory</option>
                <option>Kalahari</option>
                <option>Alpine</option>
                <option>Nexterra</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">SCHEDULE TIME</label>
              <input 
                className="form-input" 
                type="datetime-local" 
                value={scheduled_time} 
                onChange={e => setScheduledTime(e.target.value)} 
                style={{ background: '#FFF', color: '#000', fontWeight: 800, padding: '1rem', border: '1px solid var(--rose-100)' }}
              />
            </div>
            <div className="form-group">
               <label className="form-label">ROOM ID</label>
               <input className="form-input" value={room_id} onChange={e => setRoomId(e.target.value)} placeholder="Enter Room ID" style={{ background: 'var(--rose-50)', fontWeight: 700 }} />
            </div>
            <div className="form-group">
               <label className="form-label">PASSWORD</label>
               <input className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Room Password" style={{ background: 'var(--rose-50)', fontWeight: 700 }} />
            </div>
            <button className="btn-primary" style={{ marginTop: '2rem', height: '62px' }} onClick={handleCreate}>INITIALIZE ROOM MATCH 🛰️</button>
          </div>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div style={{ maxWidth: '800px' }}>
          <div className="dash-card modern-card" style={{ padding: '2.5rem' }}>
            <div className="section-label">COMMUNICATION ENVOY</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
               <div className="form-group"><label className="form-label">TARGET SQUADS</label><select className="form-input" value={bcTarget} onChange={e => setBcTarget(e.target.value)}><option value="ALL">ALL CATEGORIES</option><option value="CS">CLASH SQUAD ONLY</option><option value="BR">BATTLE ROYALE ONLY</option></select></div>
               <div className="form-group"><label className="form-label">SYSTEM MESSAGE</label><input className="form-input" value={bcMessage} onChange={e => setBcMessage(e.target.value)} placeholder="e.g. JOIN THE ROOM FAST" /></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
               <div className="form-group"><label className="form-label">START TIME</label><input className="form-input" value={bcTime} onChange={e => setBcTime(e.target.value)} /></div>
               <div className="form-group"><label className="form-label">ROOM ID</label><input className="form-input" value={bcRoomId} onChange={e => setBcRoomId(e.target.value)} /></div>
               <div className="form-group"><label className="form-label">PASSWORD</label><input className="form-input" value={bcPass} onChange={e => setBcPass(e.target.value)} /></div>
               <div className="form-group"><label className="form-label">MAP</label><input className="form-input" value={bcMap} onChange={e => setBcMap(e.target.value)} /></div>
            </div>
          </div>

          {waLoading ? (
             <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>SYNCHRONIZING RECIPIENTS...</div>
          ) : (
            <div style={{ marginTop: '2.5rem' }}>
              <div className="section-label" style={{ marginBottom: '1.5rem' }}>ENVOY DISPATCH LIST ({waTeams.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {waTeams.map((team: any) => {
                  const isCS = team.mode === "CS";
                  const header = isCS ? "🔥 *CLASH SQUAD ASSIGNMENT* 🔥" : "🛰️ *BATTLE ROYALE ASSIGNMENT* 🔥";
                  const modeInfo = isCS ? "🎮 *MODE:* 4v4 CLASH SQUAD" : `🗺️ *MAP:* ${bcMap.toUpperCase()}\n🎮 *MODE:* BATTLE ROYALE`;
                  
                  const waMsg = `${header}\n` +
                    `----------------------------------------\n` +
                    `✅ *TEAM:* ${team.team_name}\n\n` +
                    `${bcMessage ? `${bcMessage}\n\n` : ''}` +
                    `${modeInfo}\n\n` +
                    `🕒 *START TIME:* ${bcTime}\n` +
                    `🆔 *ROOM ID:* ${bcRoomId}\n` +
                    `🔑 *PASSWORD:* ${bcPass}\n` +
                    `----------------------------------------\n` +
                    `🔗 *JOIN GROUP:*\nhttps://chat.whatsapp.com/LQDRfrdRLDP0b3KUSUYD3r\n` +
                    `----------------------------------------`;

                  return (
                    <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--rose-50)', padding: '1.2rem 1.8rem', borderRadius: '16px', border: '1px solid var(--rose-100)' }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>{team.team_name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800 }}>{team.phone}</div>
                      </div>
                      <a 
                        href={`https://wa.me/${team.phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ background: '#25D366', border: 'none', color: '#FFF', height: '42px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 900 }}
                      >
                        SEND TO WHATSAPP →
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
             <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>SYNCHRONIZING TACTICAL DATA...</div>
          ) : matches.length === 0 ? (
             <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>NO ACTIVE MATCHES RECORDED</div>
          ) : (
            matches.map((m: any) => (
              <div key={m.id} className="dash-card modern-card" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--ff-primary)', background: 'var(--rose-50)', padding: '0.3rem 0.8rem', borderRadius: '8px', border: '1px solid currentColor' }}>{m.mode} MODE</span>
                    <h3 style={{ margin: '0.8rem 0 0', fontFamily: 'var(--font-head)', fontSize: '1.5rem' }}>MAP: {m.map_name.toUpperCase()}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     {m.status !== 'Completed' && (
                       <button 
                         className="small-btn" 
                         style={{ background: m.status === 'Ongoing' ? '#059669' : '#F43F5E', border: 'none', color: '#FFF', height: '42px', padding: '0 1.5rem', fontWeight: 800 }}
                         onClick={() => {
                           if (m.status === 'Ongoing') return handleMatchAlert(m);
                           saveMatch({ ...m, id: m.id, status: 'Ongoing' }).then(() => {
                             notify("SESSION DEPLOYED!", "success");
                             fetchMatches();
                             handleMatchAlert(m);
                             setActiveTab('whatsapp');
                           });
                         }}
                       >
                         {m.status === 'Ongoing' ? 'ONGOING ✓' : 'DEPLOY ROOM 🚀'}
                       </button>
                     )}
                     <button className="small-btn" onClick={() => handleMatchAlert(m)} style={{ height: '42px', padding: '0 1.5rem' }}>DISPATCH</button>
                     <button className="btn-delete" onClick={() => setDeleteId(m.id)} style={{ height: '42px', padding: '0 1.5rem', background: 'none', border: '1px solid #FECACA' }}>DEL</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', borderTop: '1px solid var(--rose-50)', paddingTop: '2rem' }}>
                  <div><div className="dash-card-label">SCHEDULED START</div><div style={{ fontWeight: 900, color: '#0F172A' }}>{m.match_date ? new Date(m.match_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</div></div>
                  <div><div className="dash-card-label">SECURE ROOM ID</div><div style={{ fontWeight: 900, color: '#F43F5E', letterSpacing: '0.05em' }}>{m.room_id || "TBD"}</div></div>
                  <div><div className="dash-card-label">PASSPHRASE</div><div style={{ fontWeight: 900, color: '#0F172A', letterSpacing: '0.1em' }}>{m.room_password || "TBD"}</div></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .tab-btn {
          padding: 1.2rem 2.5rem;
          background: none;
          border: none;
          color: #64748B;
          font-family: var(--font-head);
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s;
          border-bottom: 3px solid transparent;
        }
        .tab-btn:hover { color: var(--ff-primary); }
        .tab-btn.active { color: var(--ff-primary); border-bottom-color: var(--ff-primary); }
      `}</style>
    </div>
  );
}
