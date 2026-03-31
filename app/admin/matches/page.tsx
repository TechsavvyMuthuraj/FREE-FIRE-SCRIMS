"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminMatches, createMatch as saveMatch, deleteMatch as removeMatch, getAdminTeams } from "../actions";
import Toast from "../../../components/Toast";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });
  
  // Create Match form state
  const [room_id, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [map_name, setMapName] = useState("Bermuda");
  const [mode, setMode] = useState("CS");
  const [scheduled_time, setScheduledTime] = useState("");
  const [bcPass, setBcPass] = useState("");
  const [bcMap, setBcMap] = useState("Bermuda");
  const [activeTab, setActiveTab] = useState<"create" | "list" | "whatsapp">("create");

  // Broadcast state (WhatsApp Header/Message)
  const [bcMessage, setBcMessage] = useState("");
  const [bcTarget, setBcTarget] = useState("ALL");
  const [bcTime, setBcTime] = useState("");
  const [bcRoomId, setBcRoomId] = useState("");

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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    try {
      await removeMatch(id);
      setMatches(matches.filter(m => m.id !== id));
      notify("MATCH TERMINATED", "success");
    } catch (err) {
      notify("DELETE FAILED", "error");
    }
  };

  const handleMatchAlert = (m: any) => {
    setBcRoomId(m.room_id || "");
    setBcPass(m.room_password || "");
    setBcMap(m.map_name || "Bermuda");
    setBcTarget(m.mode || "ALL");
    
    if (m.match_date) {
      const date = new Date(m.match_date);
      setBcTime(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase());
    }
    
    if (m.mode === "CS") {
      setBcMessage("🔥 Prepare for clash! Character skills enabled. Be on time.");
    } else {
      setBcMessage("🛰️ Full map carnage! Stay in the zone. Best of luck survivor!");
    }

    setActiveTab("whatsapp");
    setWaTeams([]); 
    notify("PRE-FLIGHT TEMPLATE LOADED", "success");
  };

  return (
    <div className="admin-panel active">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        MATCH CONTROL
      </div>

      <div className="table-tabs" style={{ display: 'flex', borderBottom: '1px solid var(--ff-border)', marginBottom: '1.5rem' }}>
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          CREATE MATCH
        </button>
        <button 
          className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          SCHEDULED
        </button>
        <button 
          className={`tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
          onClick={() => setActiveTab('whatsapp')}
        >
          WHATSAPP BROADCAST
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="dash-card">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Match Mode</label>
              <select className="form-select" value={mode} onChange={e => setMode(e.target.value)}>
                <option value="CS">CLASH SQUAD</option>
                <option value="BR">BATTLE ROYALE</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Map</label>
              <select className="form-select" value={map_name} onChange={e => setMapName(e.target.value)}>
                <option value="Bermuda">Bermuda</option>
                <option value="Purgatory">Purgatory</option>
                <option value="Kalahari">Kalahari</option>
                <option value="Nexterra">Nexterra</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Schedule Time</label>
              <input 
                className="form-input" 
                type="datetime-local" 
                value={scheduled_time} 
                onChange={e => setScheduledTime(e.target.value)} 
                style={{ background: 'var(--rose-50)', color: '#000', fontWeight: 700, padding: '1rem', border: '1px solid var(--rose-100)' }}
              />
            </div>
            <div className="form-group">
               <label className="form-label">ROOM ID</label>
               <input className="form-input" value={room_id} onChange={e => setRoomId(e.target.value)} placeholder="TBD" />
            </div>
            <div className="form-group">
               <label className="form-label">PASSWORD</label>
               <input className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="TBD" />
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%', height: '52px' }} onClick={handleCreate}>COMMIT SCHEDULE</button>
        </div>
      )}

      {activeTab === 'whatsapp' && (
        <div className="dash-card">
          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <select className="form-select" value={bcTarget} onChange={e => setBcTarget(e.target.value)}>
              <option value="ALL">ALL REGISTERED SQUADS</option>
              <option value="CS">CS COMPETITORS</option>
              <option value="BR">BR COMPETITORS</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Broadcast Header Message</label>
            <textarea className="form-input" rows={3} value={bcMessage} onChange={e => setBcMessage(e.target.value)} />
          </div>

          <div style={{ background: 'rgba(255,140,0,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--ff-primary)', marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Match Time</label><input className="form-input" value={bcTime} onChange={e => setBcTime(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Room ID</label><input className="form-input" value={bcRoomId} onChange={e => setBcRoomId(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Pass</label><input className="form-input" value={bcPass} onChange={e => setBcPass(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Map</label><input className="form-input" value={bcMap} onChange={e => setBcMap(e.target.value)} /></div>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ marginTop: '2rem', width: '100%', height: '52px' }} 
            onClick={async () => {
              setWaLoading(true);
              try {
                const teams = await getAdminTeams();
                const filtered = bcTarget === "ALL" ? teams : teams.filter((t: any) => t.mode === bcTarget);
                setWaTeams(filtered);
                notify(`LIST SYNCED: ${filtered.length} RECIPIENTS`, "success");
              } catch (err) { notify("SYNC FAILED", "error"); }
              setWaLoading(false);
            }}
          >
            {waLoading ? "SYNCHRONIZING..." : "GENERATE RECIPIENT LOGS"}
          </button>

          {waTeams.length > 0 && (
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--ff-border)', paddingTop: '2rem' }}>
              <div className="section-label" style={{ marginBottom: '1.5rem' }}>ENVOY DISPATCH LIST</div>
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
                    <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--rose-50)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--rose-100)' }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{team.team_name}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{team.phone}</div>
                      </div>
                      <a 
                        href={`https://wa.me/${team.phone.replace(/\D/g, '')}?text=${encodeURIComponent(waMsg)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="small-btn"
                        style={{ background: '#25D366', border: 'none', color: '#000', height: '36px' }}
                      >
                        DISPATCH →
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>SYNCHRONIZING MATCHES...</div>
          ) : matches.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.5 }}>NO MATCHES RECORDED</div>
          ) : (
            matches.map(m => (
              <div key={m.id} className="dash-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--ff-primary)', background: 'rgba(255,140,0,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid currentColor' }}>{m.mode} MODE</span>
                    <h3 style={{ margin: '0.5rem 0 0', fontFamily: 'var(--font-head)' }}>MAP: {m.map_name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {m.status !== 'Completed' && (
                      <button 
                         className="small-btn" 
                         style={{ background: m.status === 'Ongoing' ? '#059669' : '#F43F5E', border: 'none', color: '#FFF' }}
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
                    <button className="small-btn" onClick={() => handleMatchAlert(m)}>DISPATCH</button>
                    <button className="small-btn btn-delete" onClick={() => handleDelete(m.id)}>DEL</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                  <div><div className="dash-card-label">SCHEDULE</div><div style={{ fontWeight: 700 }}>{m.match_date ? new Date(m.match_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'TBD'}</div></div>
                  <div><div className="dash-card-label">ROOM ID</div><div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{m.room_id || "TBD"}</div></div>
                  <div><div className="dash-card-label">PASSWORD</div><div style={{ fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{m.room_password || "TBD"}</div></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .tab-btn {
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          color: var(--ff-muted);
          font-family: var(--font-mono);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: all 0.3s;
          border-bottom: 2px solid transparent;
        }
        .tab-btn:hover { color: var(--ff-primary); }
        .tab-btn.active { color: var(--ff-primary); border-bottom-color: var(--ff-primary); }
      `}</style>
    </div>
  );
}
