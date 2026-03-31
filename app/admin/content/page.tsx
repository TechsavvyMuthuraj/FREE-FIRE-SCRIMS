"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  getLandingTournaments, updateLandingTournament, 
  getLandingPrizes, updateLandingPrize, 
  getLandingRules, updateLandingRule, createLandingRule, deleteLandingRule,
  getLandingStats, updateLandingStats,
  getLandingContent, updateLandingContent 
} from "../actions";
import Toast from "../../../components/Toast";

export default function ContentEditorPage() {
  const [activeTab, setActiveTab] = useState<"tournaments" | "prizes" | "rules" | "stats" | "site_text">("tournaments");
  
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [siteText, setSiteText] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });
  
  // Edit states
  const [editData, setEditData] = useState<any>({});

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [t, p, r, s, st] = await Promise.all([
        getLandingTournaments(),
        getLandingPrizes(),
        getLandingRules(),
        getLandingStats(),
        getLandingContent()
      ]);
      setTournaments(t);
      setPrizes(p);
      setRules(r);
      setStats(s);
      setSiteText(st);
    } catch (err) {
      notify("FETCH ERROR - DATA SYNC FAILED", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSaveTournament = async () => {
    setSaving(true);
    try {
      await updateLandingTournament(editingId as string, {
        mode_tag: editData.mode_tag,
        mode_name: editData.mode_name,
        description: editData.description,
        teams: editData.teams,
        format: editData.format,
        prize: editData.prize,
        match_time: editData.match_time
      });
      await fetchData();
      handleCancel();
      notify("TOURNAMENT CONFIG UPDATED", "success");
    } catch (err) {
      notify("TOURNAMENT UPDATE FAILED", "error");
    }
    setSaving(false);
  };

  const handleSavePrize = async () => {
    setSaving(true);
    try {
      await updateLandingPrize(editingId as string, {
        rank_label: editData.rank_label,
        place: editData.place,
        amount: editData.amount
      });
      await fetchData();
      handleCancel();
      notify("PRIZE MATRIX SAVED", "success");
    } catch (err) {
      notify("PRIZE UPDATE FAILED", "error");
    }
    setSaving(false);
  };

  const handleSaveRule = async () => {
    setSaving(true);
    try {
      if (editingId === "new") {
        await createLandingRule({
          rule_number: editData.rule_number,
          description: editData.description
        });
        notify("NEW RULE PUBLISHED", "success");
      } else {
        await updateLandingRule(editingId as string, {
          rule_number: editData.rule_number,
          description: editData.description
        });
        notify("RULE UPDATED", "success");
      }
      await fetchData();
      handleCancel();
    } catch (err) {
      notify("RULE OPERATION FAILED", "error");
    }
    setSaving(false);
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    setSaving(true);
    try {
      await deleteLandingRule(id);
      await fetchData();
      notify("RULE DELETED PERMANENTLY", "success");
    } catch (err) {
      notify("RULE DELETION REJECTED", "error");
    }
    setSaving(false);
  };

  const handleAddNewRule = () => {
    setEditingId("new");
    setEditData({ rule_number: `RULE_0${rules.length + 1}`, description: "" });
  };

  return (
    <div className="admin-panel active">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div className="admin-section-title" style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/admin/dashboard" className="admin-back-btn">← BACK</Link>
        LANDING PAGE CONTENT
      </div>
      
      <div className="table-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--ff-border)' }}>
        <button 
          className={`tab-btn ${activeTab === 'tournaments' ? 'active' : ''}`}
          onClick={() => setActiveTab('tournaments')}
        >
          TOURNAMENTS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'prizes' ? 'active' : ''}`}
          onClick={() => setActiveTab('prizes')}
        >
          PRIZES
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          RULES
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          STATS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'site_text' ? 'active' : ''}`}
          onClick={() => setActiveTab('site_text')}
        >
          SITE TEXT
        </button>
      </div>

      <div className="table-wrap" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)' }}>SYNCHRONIZING CONTENT...</div>
        ) : (
          <>
            {/* TOURNAMENTS TAB */}
            {activeTab === 'tournaments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tournaments.map(t => (
                  <div key={t.id} style={{ border: '1px solid var(--ff-border)', borderRadius: '8px', padding: '1.25rem', background: editingId === t.id ? 'rgba(255,140,0,0.03)' : 'transparent' }}>
                    {editingId === t.id ? (
                      <div className="form-row" style={{ flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Mode Tag</label>
                            <input className="form-input" value={editData.mode_tag} onChange={e => setEditData({...editData, mode_tag: e.target.value})} />
                          </div>
                          <div className="form-group" style={{ flex: 2 }}>
                            <label className="form-label">Mode Name</label>
                            <input className="form-input" value={editData.mode_name} onChange={e => setEditData({...editData, mode_name: e.target.value})} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea className="form-input" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} rows={3} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Teams Limit</label>
                            <input className="form-input" value={editData.teams} onChange={e => setEditData({...editData, teams: e.target.value})} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Format</label>
                            <input className="form-input" value={editData.format} onChange={e => setEditData({...editData, format: e.target.value})} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Prize Config</label>
                            <input className="form-input" value={editData.prize} onChange={e => setEditData({...editData, prize: e.target.value})} />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Match Date/Time</label>
                          <input className="form-input" value={editData.match_time || ''} onChange={e => setEditData({...editData, match_time: e.target.value})} placeholder="e.g. 31 MARCH, 09:30 PM" />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                          <button className="action-btn" onClick={handleCancel}>CANCEL</button>
                          <button className="action-btn" style={{ background: 'var(--ff-primary)', color: '#000' }} onClick={handleSaveTournament} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <span className={`mode-tag ${t.mode_id}`}>{t.mode_tag}</span>
                            <h3 style={{ margin: 0, fontFamily: 'var(--font-head)', letterSpacing: '0.05em' }}>{t.mode_name}</h3>
                          </div>
                          <p style={{ color: 'var(--ff-muted)', fontSize: '0.85rem', marginBottom: '1rem', maxWidth: '600px' }}>{t.description}</p>
                        </div>
                        <button className="small-btn" onClick={() => handleEdit(t)}>EDIT</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PRIZES TAB */}
            {activeTab === 'prizes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {prizes.map(p => (
                  <div key={p.id} style={{ border: '1px solid var(--ff-border)', borderRadius: '8px', padding: '1.25rem', background: editingId === p.id ? 'rgba(255,140,0,0.03)' : 'transparent' }}>
                     {editingId === p.id ? (
                      <div className="form-row" style={{ flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Rank Label</label>
                            <input className="form-input" value={editData.rank_label} onChange={e => setEditData({...editData, rank_label: e.target.value})} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Placement</label>
                            <input className="form-input" value={editData.place} onChange={e => setEditData({...editData, place: e.target.value})} />
                          </div>
                          <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Prize Amount</label>
                            <input className="form-input" value={editData.amount} onChange={e => setEditData({...editData, amount: e.target.value})} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                          <button className="action-btn" onClick={handleCancel}>CANCEL</button>
                          <button className="action-btn" style={{ background: 'var(--ff-primary)', color: '#000' }} onClick={handleSavePrize} disabled={saving}>{saving ? 'SAVING...' : 'SAVE'}</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ff-muted)' }}>{p.rank_label}</div>
                          <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-head)', fontWeight: 700, margin: '0.2rem 0' }}>{p.place}</div>
                          <div style={{ color: 'var(--ff-primary)', fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>{p.amount}</div>
                        </div>
                        <button className="small-btn" onClick={() => handleEdit(p)}>EDIT</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* RULES TAB */}
            {activeTab === 'rules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                   <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--ff-muted)' }}>COMMANDER DIRECTIVES</div>
                   <button className="small-btn" style={{ background: 'var(--ff-primary)', color: '#000' }} onClick={handleAddNewRule}>+ ADD DIRECTIVE</button>
                </div>

                {editingId === 'new' && (
                  <div style={{ border: '2px dashed var(--ff-primary)', borderRadius: '8px', padding: '1.25rem', background: 'rgba(255,140,0,0.03)' }}>
                    <div className="form-row" style={{ flexDirection: 'column', gap: '1rem', width: '100%' }}>
                      <div className="form-group" style={{ maxWidth: '200px' }}>
                        <label className="form-label">Rule Keyword</label>
                        <input className="form-input" value={editData.rule_number} onChange={e => setEditData({...editData, rule_number: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Rule Description</label>
                        <textarea className="form-input" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} rows={3} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button className="action-btn" onClick={handleCancel}>CANCEL</button>
                        <button className="action-btn" style={{ background: 'var(--ff-primary)', color: '#000' }} onClick={handleSaveRule} disabled={saving}>CREATE</button>
                      </div>
                    </div>
                  </div>
                )}

                {rules.map(r => (
                  <div key={r.id} style={{ border: '1px solid var(--ff-border)', borderRadius: '8px', padding: '1.25rem', background: editingId === r.id ? 'rgba(255,140,0,0.03)' : 'transparent' }}>
                    {editingId === r.id ? (
                      <div className="form-row" style={{ flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <div className="form-group" style={{ maxWidth: '200px' }}>
                          <label className="form-label">Rule Keyword</label>
                          <input className="form-input" value={editData.rule_number} onChange={e => setEditData({...editData, rule_number: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Description</label>
                          <textarea className="form-input" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} rows={2} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                          <button className="action-btn" onClick={handleCancel}>CANCEL</button>
                          <button className="action-btn" style={{ background: 'var(--ff-primary)', color: '#000' }} onClick={handleSaveRule} disabled={saving}>SAVE</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ flex: 1 }}>
                           <span style={{ color: 'var(--ff-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{r.rule_number}</span>
                           <p style={{ color: 'var(--ff-text)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{r.description}</p>
                         </div>
                         <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                           <button className="small-btn" onClick={() => handleEdit(r)}>EDIT</button>
                           <button className="small-btn btn-delete" onClick={() => handleDeleteRule(r.id)}>DEL</button>
                         </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* STATS TAB */}
            {activeTab === 'stats' && stats && (
              <div className="dash-card">
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                   <div className="form-group">
                     <label className="form-label">Teams Registered</label>
                     <input className="form-input" value={editData.teams_registered ?? stats.teams_registered} onChange={e => setEditData({...editData, teams_registered: e.target.value})} />
                   </div>
                   <div className="form-group">
                     <label className="form-label">Prize Pool Display</label>
                     <input className="form-input" value={editData.prize_pool ?? stats.prize_pool} onChange={e => setEditData({...editData, prize_pool: e.target.value})} />
                   </div>
                 </div>
                 <button 
                  className="btn-primary" 
                  style={{ width: '100%', height: '52px' }} 
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await updateLandingStats(stats.id, editData);
                      await fetchData();
                      setEditData({});
                      notify("GLOBAL STATS UPDATED", "success");
                    } catch (e) { notify("ERR UPDATING STATS", "error"); }
                    setSaving(false);
                  }}
                  disabled={saving}
                >
                  COMMIT STATS UPDATE
                </button>
              </div>
            )}

            {/* SITE TEXT TAB */}
            {activeTab === 'site_text' && (
              <div className="dash-card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   {[
                     { key: 'prize_section_label', label: 'Section Label' },
                     { key: 'prize_section_title', label: 'Section Title' },
                     { key: 'prize_section_desc', label: 'Section Description' }
                   ].map(field => {
                     const currentVal = siteText.find(st => st.key === field.key)?.value || '';
                     return (
                       <div className="form-group" key={field.key}>
                         <label className="form-label">{field.label}</label>
                         <input 
                           className="form-input" 
                           defaultValue={currentVal}
                           onBlur={async (e) => {
                             if (e.target.value !== currentVal) {
                               try {
                                 await updateLandingContent(field.key, e.target.value);
                                 await fetchData();
                                 notify(`TEXT UPDATED: ${field.label}`, "success");
                               } catch (err) { notify("TEXT SYNC FAILED", "error"); }
                             }
                           }}
                         />
                       </div>
                     );
                   })}
                </div>
                <div style={{ marginTop: '2rem', fontSize: '0.7rem', color: 'var(--ff-muted)', textAlign: 'center' }}>* DATA SYNCED AUTOMATICALLY ON BLUR</div>
              </div>
            )}
          </>
        )}
      </div>

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
