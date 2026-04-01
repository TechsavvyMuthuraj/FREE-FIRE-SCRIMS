"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAdminMatches, createMatch as saveMatch, deleteMatch as removeMatch, getAdminTeams, updateMatchStatus, getLandingRulesByMode, createLandingRule, updateLandingRule, deleteLandingRule } from "../actions";
import Toast from "../../../components/Toast";
import ConfirmModal from "../../../components/ConfirmModal";

export default function MatchesPage() {
  return (
    <Suspense fallback={<div>Loading Match Control...</div>}>
      <MatchesContent />
    </Suspense>
  );
}

function MatchesContent() {
  const searchParams = useSearchParams();
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
  const [activeTab, setActiveTab] = useState<"create" | "list" | "whatsapp" | "rules">("create");

  // Rules state
  const [activeRulesMode, setActiveRulesMode] = useState<"CS" | "BR">("CS");
  const [rules, setRules] = useState<any[]>([]);
  const [rulesLoading, setRulesLoading] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleData, setRuleData] = useState({ rule_number: "", description: "" });
  const [bcRules, setBcRules] = useState("");
  const [bcMatchId, setBcMatchId] = useState<string | null>(null);

  // Broadcast state (WhatsApp Header/Message)
  const [bcMessage, setBcMessage] = useState("");
  const [bcTarget, setBcTarget] = useState("ALL");
  const [bcTime, setBcTime] = useState("");
  const [bcRoomId, setBcRoomId] = useState("");

  // WhatsApp Alert state
  const [waTeams, setWaTeams] = useState<any[]>([]);
  const [waLoading, setWaLoading] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  // One-click deployment state
  const [prefilledSquads, setPrefilledSquads] = useState<string[]>([]);

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

  const fetchRules = async (modeName: string) => {
    setRulesLoading(true);
    try {
      const data = await getLandingRulesByMode(modeName);
      setRules(data);
    } catch (err) { notify("RULES FETCH FAILED", "error"); }
    setRulesLoading(false);
  };

  useEffect(() => {
    fetchMatches();
    fetchRules(activeRulesMode);

    // Handle One-Click Deployment from URL
    const modeParam = searchParams.get('mode');
    const squadsParam = searchParams.get('squads');
    const tabParam = searchParams.get('activeTab');
    
    if (tabParam) setActiveTab(tabParam as any);
    if (modeParam) setMode(modeParam);
    if (squadsParam) {
      setPrefilledSquads(squadsParam.split(','));
    }
  }, []);

  useEffect(() => {
    fetchRules(activeRulesMode);
  }, [activeRulesMode]);

  const handleCreate = async () => {
    if (!scheduled_time) return notify("SCHEDULE TIME REQUIRED", "warning");
    
    try {
      const fullISOString = new Date(scheduled_time).toISOString();
      await saveMatch({
        room_id,
        password,
        map: map_name,
        mode,
        date_time: fullISOString,
        team_ids: prefilledSquads // Pass prefilled squads from deployment queue
      });
      setRoomId("");
      setPassword("");
      setScheduledTime("");
      setPrefilledSquads([]); // Clear after use
      fetchMatches();
      setActiveTab("list");
      notify("MATCH SCHEDULED WITH ROSTER", "success");
    } catch (err: any) {
      notify(`CREATE FAILED: ${err.message}`, "error");
    }
  };

  const handleDelete = async (id: string) => {
    setMatchToDelete(id);
  };

  const confirmDeleteMatch = async () => {
    if (!matchToDelete) return;
    try {
      await removeMatch(matchToDelete);
      setMatches(matches.filter(m => m.id !== matchToDelete));
      notify("MATCH TERMINATED", "success");
    } catch (err) {
      notify("DELETE FAILED", "error");
    } finally {
      setMatchToDelete(null);
    }
  };

  const handleMatchAlert = async (m: any) => {
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

    // Load mode rules for dispatch
    try {
      const rData = await getLandingRulesByMode(m.mode);
      const rText = rData.map((r: any) => `• ${r.description}`).join('\n');
      setBcRules(rText);
    } catch (e) { setBcRules(""); }

    notify(`SYNCED FROM MATCH: ${m.mode} · ${m.map_name}`, "success");

    // Fetch assigned squads specifically
    setWaTeams([]);
    setWaLoading(true);
    try {
      const { getMatchSquads } = await import("../actions");
      const assigned = await getMatchSquads(m.id);
      
      const uniqueTeamsMap = new Map();
      assigned.forEach((a: any) => {
        if (a.teams && !uniqueTeamsMap.has(a.teams.id)) {
          uniqueTeamsMap.set(a.teams.id, a.teams);
        }
      });
      
      const allUnique = Array.from(uniqueTeamsMap.values());
      const limit = (m.mode === "CS") ? 2 : 12;
      setWaTeams(allUnique.slice(0, limit));
    } catch (err) { notify("SQUAD SYNC FAILED", "error"); }
    setWaLoading(false);

    setWaLoading(false);
    setBcMatchId(m.id);
    setActiveTab("whatsapp");
  };

  const handleSaveRule = async () => {
    try {
      if (editingRuleId === 'new') {
        await createLandingRule({ ...ruleData, mode: activeRulesMode });
        notify("NEW RULE SAVED", "success");
      } else {
        await updateLandingRule(editingRuleId as string, { ...ruleData });
        notify("RULE UPDATED", "success");
      }
      fetchRules(activeRulesMode);
      setEditingRuleId(null);
    } catch (e) { notify("SAVE FAILED", "error"); }
  };

  const handleDeleteRule = async (id: string) => {
    try {
      await deleteLandingRule(id);
      fetchRules(activeRulesMode);
      notify("RULE DELETED", "success");
    } catch (e) { notify("DELETE FAILED", "error"); }
  };

  return (
    <div className="admin-panel active">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        MATCH CONTROL
      </div>

      <div className="table-tabs" style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid var(--ff-border)', marginBottom: '1.5rem', gap: '0' }}>
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
        <button 
          className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          RULES CONFIG
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="dash-card">
          {prefilledSquads.length > 0 && (
            <div style={{ background: 'var(--rose-100)', color: 'var(--ff-primary)', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '0.75rem', border: '1px solid var(--ff-primary)' }}>
              <span>🚀 SYNCED ROSTER: {prefilledSquads.length} SQUADS PRE-LOADED AND READY FOR COMMIT</span>
              <button onClick={() => setPrefilledSquads([])} style={{ background: 'var(--ff-primary)', color: '#000', border: 'none', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.65rem' }}>CLEAR ROSTER</button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
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
            <label className="form-label">SYNC FROM SCHEDULED MATCH</label>
            <select 
              className="form-select" 
              style={{ background: 'var(--rose-100)', color: 'var(--ff-primary)', border: 'none', fontWeight: 800 }}
              onChange={e => {
                const m = matches.find(m => m.id === e.target.value);
                if (m) handleMatchAlert(m);
              }}
            >
              <option value="">-- SELECT MATCH TO AUTO-FILL --</option>
              {matches.map(m => (
                <option key={m.id} value={m.id}>
                  [{m.mode}] {m.map_name.toUpperCase()} · {new Date(m.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </option>
              ))}
            </select>
          </div>

          {bcMatchId && (
            <div style={{ padding: '0.75rem 1rem', background: '#ECFDF5', border: '1px solid #10B981', color: '#065F46', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
               <span>🔒 LOCKED TO MATCH ROSTER ({waTeams.length}/{matches.find(m => m.id === bcMatchId)?.mode === 'CS' ? '2' : '12'} SQUADS)</span>
               <button 
                 onClick={() => {
                   setBcMatchId(null);
                   setBcRoomId("");
                   setBcPass("");
                   setWaTeams([]);
                   notify("LOCKED SELECTION CLEARED", "warning");
                 }}
                 style={{ background: '#065F46', color: '#FFF', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.6rem', cursor: 'pointer' }}
               >
                 CLEAR & BROADCAST ALL
               </button>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem', marginTop: '1.5rem', background: 'rgba(255,140,0,0.03)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--ff-primary)' }}>
              <div className="form-group"><label className="form-label">Match Time</label><input className="form-input" value={bcTime} onChange={e => setBcTime(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Room ID</label><input className="form-input" value={bcRoomId} onChange={e => setBcRoomId(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Pass</label><input className="form-input" value={bcPass} onChange={e => setBcPass(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Map</label><input className="form-input" value={bcMap} onChange={e => setBcMap(e.target.value)} /></div>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Target Audience {bcMatchId ? '(LOCKED TO ASSIGNED)' : '(Manual override if match not selected)'}</label>
            <select className="form-select" value={bcTarget} onChange={e => setBcTarget(e.target.value)} disabled={!!bcMatchId}>
              <option value="ALL">ALL REGISTERED SQUADS</option>
              <option value="CS">CS COMPETITORS</option>
              <option value="BR">BR COMPETITORS</option>
            </select>
          </div>

          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Message Content</label>
            <textarea className="form-input" rows={2} value={bcMessage} onChange={e => setBcMessage(e.target.value)} />
          </div>

          <button 
            className="btn-primary" 
            style={{ marginTop: '2rem', width: '100%', height: '52px', opacity: bcMatchId ? 0.6 : 1 }} 
            onClick={async () => {
              if (bcMatchId) return notify("LIST IS LOCKED TO MATCH SQUADS", "warning");
              setWaLoading(true);
              try {
                const results = await getAdminTeams();
                const filtered = bcTarget === "ALL" ? results : results.filter((t: any) => t.mode === bcTarget);
                
                // Ensure absolute uniqueness in the dispatch list
                const uniqueTeamsMap = new Map();
                filtered.forEach((t: any) => {
                   if (!uniqueTeamsMap.has(t.id)) uniqueTeamsMap.set(t.id, t);
                });
                
                setWaTeams(Array.from(uniqueTeamsMap.values()));
                notify(`LIST SYNCED: ${uniqueTeamsMap.size} UNIQUE RECIPIENTS`, "success");
              } catch (err) { notify("SYNC FAILED", "error"); }
              setWaLoading(false);
            }}
          >
            {waLoading ? "SYNCHRONIZING..." : bcMatchId ? "MATCH ROSTER PRE-LOADED ✓" : "GENERATE RECIPIENT LOGS"}
          </button>

          {waTeams.length > 0 && (
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--ff-border)', paddingTop: '2rem' }}>
              <div className="section-label" style={{ marginBottom: '1.5rem' }}>ENVOY DISPATCH LIST</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {waTeams.map((team: any) => {
                  const isCS = team.mode === "CS";
                  const teamIdShort = `TEAM-${team.id.substring(0,8).toUpperCase()}-${team.mode}`;
                  
                  const waMsg = `██████████████████████████\n` +
                    `      *FF SCRIMS VERIFIED*\n` +
                    `██████████████████████████\n\n` +
                    `> TEAM       :: *${team.team_name.toUpperCase()}*\n` +
                    `> TEAM ID    :: ${teamIdShort}\n` +
                    `> MODE       :: ${team.mode === 'CS' ? 'CLASH SQUAD (4v4)' : 'BATTLE ROYALE (12-SQUAD)'}\n` +
                    `> LEADER     :: ${team.leader_name.toUpperCase()}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `[ SQUAD ROSTER ]\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `${team.players?.map((p: any) => `> ${p.in_game_name.padEnd(10)} :: UID ${p.game_uid}`).join('\n') || '> NO ROSTER DATA FOUND'}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `[ MATCH ACCESS DETAILS ]\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `🗺️ *MAP:* ${bcMap.toUpperCase()}\n` +
                    `🕒 *START TIME:* ${bcTime}\n` +
                    `🆔 *ROOM ID:* ${bcRoomId}\n` +
                    `🔑 *PASSWORD:* ${bcPass}\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `[ ACCESS LINK ]\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `https://chat.whatsapp.com/LQDRfrdRLDP0b3KUSUYD3r\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `[ TOURNAMENT NOTICE ]\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                    `${bcRules || 'Character skills enabled. Be on time.'}\n` +
                    `━━━━━━━━━━━━━━━━━━━━━━━━━━`;

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

      {activeTab === 'rules' && (
        <div className="dash-card">
           <div className="table-tabs" style={{ background: 'rgba(255,140,0,0.03)', padding: '0.5rem', borderRadius: '12px', display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
              <button 
                className="small-btn" 
                style={{ flex: 1, background: activeRulesMode === 'CS' ? 'var(--ff-primary)' : 'transparent', color: activeRulesMode === 'CS' ? '#000' : 'var(--ff-muted)', border: 'none' }}
                onClick={() => setActiveRulesMode('CS')}
              >
                CLASH SQUAD RULES
              </button>
              <button 
                className="small-btn" 
                style={{ flex: 1, background: activeRulesMode === 'BR' ? 'var(--ff-primary)' : 'transparent', color: activeRulesMode === 'BR' ? '#000' : 'var(--ff-muted)', border: 'none' }}
                onClick={() => setActiveRulesMode('BR')}
              >
                BATTLE ROYALE RULES
              </button>
           </div>

           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div className="section-label" style={{ marginBottom: 0 }}>{activeRulesMode} DIRECTIVES</div>
                 <button className="small-btn" style={{ background: 'var(--ff-primary)', color: '#000' }} onClick={() => { setEditingRuleId('new'); setRuleData({ rule_number: `RULE_0${rules.length+1}`, description: "" }); }}>+ NEW RULE</button>
              </div>

              {editingRuleId === 'new' && (
                <div style={{ border: '2px dashed var(--ff-primary)', borderRadius: '12px', padding: '1.5rem', background: 'rgba(255,140,0,0.02)' }}>
                   <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <input className="form-input" style={{ maxWidth: '120px' }} value={ruleData.rule_number} onChange={e => setRuleData({...ruleData, rule_number: e.target.value})} placeholder="RULE ID" />
                      <input className="form-input" value={ruleData.description} onChange={e => setRuleData({...ruleData, description: e.target.value})} placeholder="ENTER RULE DESCRIPTION..." />
                   </div>
                   <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="small-btn" onClick={() => setEditingRuleId(null)}>CANCEL</button>
                      <button className="small-btn" style={{ background: 'var(--ff-primary)', color: '#000' }} onClick={handleSaveRule}>CREATE</button>
                   </div>
                </div>
              )}

              {rulesLoading ? <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>FETCHING DIRECTIVES...</div> : rules.length === 0 ? <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>NO RULES CONFIGURED FOR {activeRulesMode}</div> : (
                rules.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--rose-50)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid var(--rose-100)' }}>
                   <div style={{ flex: 1 }}>
                      <div style={{ color: 'var(--ff-primary)', fontSize: '0.65rem', fontWeight: 900, marginBottom: '0.25rem' }}>{r.rule_number}</div>
                      <div style={{ fontSize: '0.9rem' }}>{r.description}</div>
                   </div>
                   <button className="small-btn btn-delete" onClick={() => handleDeleteRule(r.id)}>DEL</button>
                </div>
              )))}
           </div>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--ff-primary)', background: 'rgba(255,140,0,0.05)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid currentColor' }}>
                      {m.mode} MODE {m.match_squads ? `(${m.match_squads.length}/${m.mode === 'CS' ? 2 : 12})` : ''}
                    </span>
                    <h3 style={{ margin: '0.5rem 0 0', fontFamily: 'var(--font-head)' }}>MAP: {m.map_name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '0.8rem' }}>
                    {m.status !== 'Completed' && (
                      <button 
                         className="small-btn" 
                         style={{ background: m.status === 'Ongoing' ? '#059669' : '#F43F5E', border: 'none', color: '#FFF' }}
                         onClick={async () => {
                           if (m.status === 'Ongoing') return handleMatchAlert(m);
                           try {
                             await updateMatchStatus(m.id, 'Ongoing');
                             notify("SESSION DEPLOYED!", "success");
                             fetchMatches();
                             handleMatchAlert(m);
                             setActiveTab('whatsapp');
                           } catch (err) { 
                             console.error(err);
                             notify("DEPLOYMENT FAILED", "error"); 
                           }
                         }}
                      >
                         {m.status === 'Ongoing' ? 'ONGOING ✓' : 'DEPLOY ROOM 🚀'}
                      </button>
                    )}
                    <button className="small-btn" onClick={() => handleMatchAlert(m)}>DISPATCH</button>
                    <button className="small-btn btn-delete" onClick={() => handleDelete(m.id)}>DEL</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '1rem' }}>
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
      <ConfirmModal 
        isOpen={!!matchToDelete}
        title="DELETE MATCH SESSION?"
        message="This will permanently delete the match record, including all room credentials and squad assignments. This action cannot be undone."
        onConfirm={confirmDeleteMatch}
        onCancel={() => setMatchToDelete(null)}
        confirmText="DELETE SESSION"
        type="danger"
      />
    </div>
  );
}
