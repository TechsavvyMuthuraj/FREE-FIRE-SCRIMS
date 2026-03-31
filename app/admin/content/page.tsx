"use client";

import { useEffect, useState } from "react";
import { 
  getLandingTournaments, updateLandingTournament, 
  getLandingPrizes, updateLandingPrize, 
  getLandingRules, updateLandingRule,
  getLandingStats, updateLandingStats,
  getLandingContent, updateLandingContent 
} from "../actions";

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
  
  // Edit states
  const [editData, setEditData] = useState<any>({});

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
      console.error("Error fetching content data:", err);
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
    } catch (err) {
      alert("Error saving tournament");
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
    } catch (err) {
      alert("Error saving prize");
    }
    setSaving(false);
  };

  const handleSaveRule = async () => {
    setSaving(true);
    try {
      await updateLandingRule(editingId as string, {
        description: editData.description
      });
      await fetchData();
      handleCancel();
    } catch (err) {
      alert("Error saving rule");
    }
    setSaving(false);
  };

  return (
    <div className="admin-panel active">
      <div className="admin-section-title">LANDING PAGE CONTENT</div>
      
      <div className="table-tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--ff-border)' }}>
        <button 
          className={`tab-btn ${activeTab === 'tournaments' ? 'active' : ''}`}
          onClick={() => setActiveTab('tournaments')}
          style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'tournaments' ? '2px solid var(--ff-orange)' : '2px solid transparent', color: activeTab === 'tournaments' ? 'var(--ff-text)' : 'var(--ff-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}
        >
          TOURNAMENTS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'prizes' ? 'active' : ''}`}
          onClick={() => setActiveTab('prizes')}
          style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'prizes' ? '2px solid var(--ff-orange)' : '2px solid transparent', color: activeTab === 'prizes' ? 'var(--ff-text)' : 'var(--ff-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}
        >
          PRIZES
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
          style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'rules' ? '2px solid var(--ff-orange)' : '2px solid transparent', color: activeTab === 'rules' ? 'var(--ff-text)' : 'var(--ff-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}
        >
          RULES
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
          style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'stats' ? '2px solid var(--ff-orange)' : '2px solid transparent', color: activeTab === 'stats' ? 'var(--ff-text)' : 'var(--ff-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}
        >
          STATS
        </button>
        <button 
          className={`tab-btn ${activeTab === 'site_text' ? 'active' : ''}`}
          onClick={() => setActiveTab('site_text')}
          style={{ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'site_text' ? '2px solid var(--ff-orange)' : '2px solid transparent', color: activeTab === 'site_text' ? 'var(--ff-text)' : 'var(--ff-muted)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', letterSpacing: '0.1em' }}
        >
          SITE TEXT
        </button>
      </div>

      <div className="table-wrap" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)' }}>LOADING DATA...</div>
        ) : (
          <>
            {/* TOURNAMENTS TAB */}
            {activeTab === 'tournaments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tournaments.map(t => (
                  <div key={t.id} style={{ border: '1px solid var(--ff-border)', borderRadius: '8px', padding: '1.25rem', background: editingId === t.id ? 'var(--ff-card2)' : 'transparent' }}>
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
                          <button className="action-btn" style={{ background: 'transparent', border: '1px solid var(--ff-muted)' }} onClick={handleCancel}>CANCEL</button>
                          <button className="action-btn" style={{ background: 'var(--ff-success)', color: '#000' }} onClick={handleSaveTournament} disabled={saving}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
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
                          <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            <span><span style={{ color: 'var(--ff-muted)' }}>Teams:</span> {t.teams}</span>
                            <span><span style={{ color: 'var(--ff-muted)' }}>Format:</span> {t.format}</span>
                            <span><span style={{ color: 'var(--ff-muted)' }}>Prize:</span> <span style={{ color: 'var(--ff-yellow)' }}>{t.prize}</span></span>
                            <span><span style={{ color: 'var(--ff-muted)' }}>Time:</span> <span style={{ color: 'var(--ff-orange)' }}>{t.match_time || 'TBD'}</span></span>
                          </div>
                        </div>
                        <button className="small-btn" style={{ height: 'fit-content' }} onClick={() => handleEdit(t)}>EDIT CONFIG</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PRIZES TAB */}
            {activeTab === 'prizes' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Section Header Editor */}
                <div className="dash-card" style={{ marginBottom: '1rem', border: '1px solid var(--ff-orange)', background: 'rgba(255, 107, 0, 0.05)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ff-orange)', marginBottom: '1rem', letterSpacing: '0.1em' }}>PRIZE SECTION HEADERS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { key: 'prize_section_label', label: 'Label', placeholder: '// PRIZE POOL' },
                      { key: 'prize_section_title', label: 'Main Title', placeholder: 'TOTAL ₹50,000' },
                      { key: 'prize_section_desc', label: 'Description', placeholder: 'Split across CS and BR modes...' }
                    ].map(field => {
                      const currentVal = siteText.find(st => st.key === field.key)?.value || '';
                      return (
                        <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '10px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)' }}>{field.label}:</label>
                          <input 
                            className="form-input"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} 
                            defaultValue={currentVal}
                            placeholder={field.placeholder}
                            onBlur={async (e) => {
                              if (e.target.value !== currentVal) {
                                try {
                                  await updateLandingContent(field.key, e.target.value);
                                  await fetchData();
                                } catch (err) { alert("Error saving text"); }
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {prizes.map(p => (
                  <div key={p.id} style={{ border: '1px solid var(--ff-border)', borderRadius: '8px', padding: '1.25rem', background: editingId === p.id ? 'var(--ff-card2)' : 'transparent', borderLeft: `4px solid ${p.tier === 'gold' ? '#FFD700' : p.tier === 'silver' ? '#C0C0C0' : '#CD7F32'}` }}>
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
                          <button className="action-btn" style={{ background: 'transparent', border: '1px solid var(--ff-muted)' }} onClick={handleCancel}>CANCEL</button>
                          <button className="action-btn" style={{ background: 'var(--ff-success)', color: '#000' }} onClick={handleSavePrize} disabled={saving}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                          <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ff-muted)' }}>{p.rank_label}</div>
                          <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-head)', fontWeight: 700, margin: '0.2rem 0' }}>{p.place}</div>
                          <div style={{ color: p.tier === 'gold' ? '#FFD700' : p.tier === 'silver' ? '#C0C0C0' : '#CD7F32', fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}>{p.amount}</div>
                        </div>
                        <button className="small-btn" style={{ height: 'fit-content' }} onClick={() => handleEdit(p)}>EDIT PRIZE</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* RULES TAB */}
            {activeTab === 'rules' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Rules Section Header Editor */}
                <div className="dash-card" style={{ marginBottom: '1rem', border: '1px solid var(--ff-orange)', background: 'rgba(255, 107, 0, 0.05)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ff-orange)', marginBottom: '1rem', letterSpacing: '0.1em' }}>RULES SECTION HEADERS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[
                      { key: 'rules_section_label', label: 'Label', placeholder: '// RULES & REGULATIONS' },
                      { key: 'rules_section_title', label: 'Main Title', placeholder: 'PLAY BY THE CODE' },
                      { key: 'rules_section_desc', label: 'Description', placeholder: 'Read carefully...' }
                    ].map(field => {
                      const currentVal = siteText.find(st => st.key === field.key)?.value || '';
                      return (
                        <div key={field.key} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: '10px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)' }}>{field.label}:</label>
                          <input 
                            className="form-input"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} 
                            defaultValue={currentVal}
                            placeholder={field.placeholder}
                            onBlur={async (e) => {
                              if (e.target.value !== currentVal) {
                                try {
                                  await updateLandingContent(field.key, e.target.value);
                                  await fetchData();
                                } catch (err) { alert("Error saving rules text"); }
                              }
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {rules.map(r => (
                  <div key={r.id} style={{ border: '1px solid var(--ff-border)', borderRadius: '8px', padding: '1.25rem', background: editingId === r.id ? 'var(--ff-card2)' : 'transparent' }}>
                    {editingId === r.id ? (
                      <div className="form-row" style={{ flexDirection: 'column', gap: '1rem', width: '100%' }}>
                        <div className="form-group">
                          <label className="form-label">{r.rule_number} Description</label>
                          <textarea className="form-input" value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} rows={2} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                          <button className="action-btn" style={{ background: 'transparent', border: '1px solid var(--ff-muted)' }} onClick={handleCancel}>CANCEL</button>
                          <button className="action-btn" style={{ background: 'var(--ff-success)', color: '#000' }} onClick={handleSaveRule} disabled={saving}>{saving ? 'SAVING...' : 'SAVE CHANGES'}</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--ff-orange)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.rule_number}</span>
                          <span style={{ color: 'var(--ff-text)', fontSize: '0.9rem', lineHeight: 1.5 }}>{r.description}</span>
                        </div>
                        <button className="small-btn" style={{ height: 'fit-content' }} onClick={() => handleEdit(r)}>EDIT RULE</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* STATS TAB */}
            {activeTab === 'stats' && stats && (
              <div className="dash-card">
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ff-orange)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>LANDING PAGE STATS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div className="form-group">
                     <label className="form-label">Teams Registered</label>
                     <input className="form-input" value={editData.teams_registered ?? stats.teams_registered} onChange={e => setEditData({...editData, teams_registered: e.target.value})} />
                   </div>
                   <div className="form-group">
                     <label className="form-label">Game Modes</label>
                     <input className="form-input" value={editData.game_modes ?? stats.game_modes} onChange={e => setEditData({...editData, game_modes: e.target.value})} />
                   </div>
                   <div className="form-group">
                     <label className="form-label">Prize Pool (Stats)</label>
                     <input className="form-input" value={editData.prize_pool ?? stats.prize_pool} onChange={e => setEditData({...editData, prize_pool: e.target.value})} />
                   </div>
                   <div className="form-group">
                     <label className="form-label">Max Teams</label>
                     <input className="form-input" value={editData.max_teams ?? stats.max_teams} onChange={e => setEditData({...editData, max_teams: e.target.value})} />
                   </div>
                </div>
                <button 
                  className="small-btn" 
                  style={{ marginTop: '1.5rem' }} 
                  onClick={async () => {
                    setSaving(true);
                    try {
                      await updateLandingStats(stats.id, editData);
                      await fetchData();
                      setEditData({});
                      alert("Stats updated successfully!");
                    } catch (e) { alert("Error updating stats"); }
                    setSaving(false);
                  }}
                  disabled={saving}
                >
                  {saving ? 'SAVING...' : 'SAVE STATS'}
                </button>
              </div>
            )}

            {/* SITE TEXT TAB */}
            {activeTab === 'site_text' && (
              <div className="dash-card">
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--ff-orange)', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>PRIZE POOL SECTION HEADERS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   {[
                     { key: 'prize_section_label', label: 'Section Label', placeholder: '// PRIZE POOL' },
                     { key: 'prize_section_title', label: 'Section Title', placeholder: 'TOTAL ₹50,000' },
                     { key: 'prize_section_desc', label: 'Section Description', placeholder: 'Split across CS and BR modes...' }
                   ].map(field => {
                     const currentVal = siteText.find(st => st.key === field.key)?.value || '';
                     return (
                       <div className="form-group" key={field.key}>
                         <label className="form-label">{field.label}</label>
                         <div style={{ display: 'flex', gap: '10px' }}>
                           <input 
                             className="form-input" 
                             defaultValue={currentVal}
                             onBlur={async (e) => {
                               if (e.target.value !== currentVal) {
                                 try {
                                   await updateLandingContent(field.key, e.target.value);
                                   await fetchData();
                                 } catch (err) { alert("Error updating text"); }
                               }
                             }}
                             placeholder={field.placeholder}
                           />
                         </div>
                       </div>
                     );
                   })}
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--ff-muted)' }}>* Changes are saved automatically when you click away from the input.</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
