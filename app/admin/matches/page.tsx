"use client";

import { useEffect, useState } from "react";
import { getAdminMatches, createMatch as saveMatch, deleteMatch as removeMatch } from "../actions";

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Match form state
  const [room_id, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [map_name, setMapName] = useState("Bermuda");
  const [mode, setMode] = useState("CS");
  const [scheduled_time, setScheduledTime] = useState("");
  const [activeTab, setActiveTab] = useState<"create" | "list" | "broadcast">("create");

  // Broadcast state
  const [bcSubject, setBcSubject] = useState("");
  const [bcMessage, setBcMessage] = useState("");
  const [bcTarget, setBcTarget] = useState("ALL");
  const [bcTime, setBcTime] = useState("");
  const [bcRoomId, setBcRoomId] = useState("");
  const [bcPass, setBcPass] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const data = await getAdminMatches();
      setMatches(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleCreate = async () => {
    if (!scheduled_time) return alert("Scheduled time is required");
    
    // Ensure scheduled_time is a full ISO timestamp
    const fullISOString = new Date(scheduled_time).toISOString();

    try {
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
    } catch (err: any) {
      alert(`Error creating match: ${err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this match?")) return;
    try {
      await removeMatch(id);
      setMatches(matches.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcast = async () => {
    if (!bcSubject || !bcMessage) return alert("Subject and Message are required");
    setIsBroadcasting(true);
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: bcSubject,
          message: bcMessage,
          targetGroup: bcTarget,
          matchTime: bcTime,
          roomId: bcRoomId,
          roomPassword: bcPass
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      alert(`Broadcast sent to ${data.sentCount} players!`);
      setBcSubject("");
      setBcMessage("");
    } catch (err: any) {
      alert(`Broadcast Error: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="admin-panel active">
      <div className="admin-section-title">MATCH CONTROL</div>

      <div style={{ display: 'flex', borderBottom: '1px solid var(--ff-border)', marginBottom: '1.5rem' }}>
        <button 
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: activeTab === 'create' ? 'var(--ff-orange)' : 'var(--ff-muted)', background: 'none', border: 'none', borderBottom: '2px solid', borderBottomColor: activeTab === 'create' ? 'var(--ff-orange)' : 'transparent', padding: '0.75rem 1.25rem', cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-1px' }}
          onClick={() => setActiveTab('create')}
        >
          CREATE MATCH
        </button>
        <button 
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: activeTab === 'list' ? 'var(--ff-orange)' : 'var(--ff-muted)', background: 'none', border: 'none', borderBottom: '2px solid', borderBottomColor: activeTab === 'list' ? 'var(--ff-orange)' : 'transparent', padding: '0.75rem 1.25rem', cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-1px' }}
          onClick={() => setActiveTab('list')}
        >
          SCHEDULED
        </button>
        <button 
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: activeTab === 'broadcast' ? 'var(--ff-orange)' : 'var(--ff-muted)', background: 'none', border: 'none', borderBottom: '2px solid', borderBottomColor: activeTab === 'broadcast' ? 'var(--ff-orange)' : 'transparent', padding: '0.75rem 1.25rem', cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-1px' }}
          onClick={() => setActiveTab('broadcast')}
        >
          EMAIL BROADCAST
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="dash-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--ff-orange)', marginBottom: '1.25rem', textTransform: 'uppercase' }}>New Match</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              <label className="form-label">Date & Time</label>
              <input className="form-input" type="datetime-local" value={scheduled_time} onChange={e => setScheduledTime(e.target.value)} />
            </div>
            <div className="form-group">
              <div style={{ opacity: 0 }}><label className="form-label">Spacing</label></div>
            </div>
                <div className="form-group">
                  <label className="form-label">ROOM ID</label>
                  <input 
                    className="form-input" 
                    placeholder="E.G. 847291" 
                    value={room_id} 
                    onChange={e => setRoomId(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">PASSWORD</label>
                  <input 
                    className="form-input" 
                    placeholder="E.G. 123456" 
                    value={password} 
                    onChange={e => setPassword(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  />
                </div>
          </div>
          <button className="small-btn" style={{ marginTop: '0.5rem' }} onClick={handleCreate}>CREATE MATCH</button>
        </div>
      )}

      {activeTab === 'broadcast' && (
        <div className="dash-card">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.15em', color: 'var(--ff-orange)', marginBottom: '1.25rem', textTransform: 'uppercase' }}>SEND NOTIFICATION</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <select className="form-select" value={bcTarget} onChange={e => setBcTarget(e.target.value)}>
                <option value="ALL">ALL REGISTERED TEAMS</option>
                <option value="CS">CLASH SQUAD ONLY</option>
                <option value="BR">BATTLE ROYALE ONLY</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Email Subject</label>
              <input className="form-input" placeholder="Match Details Released..." value={bcSubject} onChange={e => setBcSubject(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Announcement Message</label>
            <textarea className="form-input" rows={4} placeholder="Type your message here..." value={bcMessage} onChange={e => setBcMessage(e.target.value)} />
          </div>

          <div style={{ background: 'rgba(255,107,0,0.05)', border: '1px solid var(--ff-border)', borderRadius: '6px', padding: '1rem', marginTop: '1rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ff-muted)', marginBottom: '0.75rem' }}>OPTIONAL MATCH DETAILS (HIGHLIGHTED BOX)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Match Time</label>
                <input className="form-input" placeholder="e.g. 09:30 PM" value={bcTime} onChange={e => setBcTime(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Room ID</label>
                <input className="form-input" placeholder="123456" value={bcRoomId} onChange={e => setBcRoomId(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" placeholder="pass123" value={bcPass} onChange={e => setBcPass(e.target.value)} />
              </div>
            </div>
          </div>

          <button 
            className="small-btn" 
            style={{ marginTop: '1.5rem', background: 'var(--grad-fire)', color: '#000' }} 
            onClick={handleBroadcast}
            disabled={isBroadcasting}
          >
            {isBroadcasting ? "SENDING..." : "SEND BROADCAST EMAIL →"}
          </button>
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          {loading ? (
            <div style={{ color: 'var(--ff-muted)', fontSize: '0.85rem', padding: '1rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>Loading matches...</div>
          ) : matches.length === 0 ? (
            <div style={{ color: 'var(--ff-muted)', fontSize: '0.85rem', padding: '1rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>No matches created yet.</div>
          ) : (
            matches.map(m => (
              <div key={m.id} className="dash-card" style={{ marginBottom: '1rem', display: 'block' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ff-orange)', border: '1px solid', padding: '0.2rem 0.5rem', borderRadius: '3px' }}>{m.id.split("-")[0]}</span>
                  <button className="action-btn btn-delete" onClick={() => handleDelete(m.id)}>DELETE</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                  <div><div className="dash-card-label">Mode</div><div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.mode}</div></div>
                  <div><div className="dash-card-label">Map</div><div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.map_name}</div></div>
                  <div><div className="dash-card-label">Schedule</div><div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.match_date ? new Date(m.match_date).toLocaleString() : 'TBD'}</div></div>
                  <div><div className="dash-card-label">Room / Pass</div><div style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{m.room_id || "TBD"} / {m.room_password || "TBD"}</div></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
