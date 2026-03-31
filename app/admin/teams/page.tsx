"use client";

import { useEffect, useState } from "react";
import { getAdminTeams, deleteTeam, updateTeam } from "../actions";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("ALL MODES");

  // Modal States
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await getAdminTeams();
      setTeams(data);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team?")) return;

    try {
      await deleteTeam(id);
      setTeams(teams.filter((team) => team.id !== id));
      if (selectedTeam?.id === id) handleCloseModal();
    } catch (err) {
      alert("Error deleting team");
    }
  };

  const handleView = (team: any) => {
    setSelectedTeam(team);
    setIsEditing(false);
  };

  const handleEdit = (team: any) => {
    setSelectedTeam(team);
    setEditForm({
      team_name: team.team_name,
      leader_name: team.leader_name,
      email: team.email,
      phone: team.phone,
      mode: team.mode
    });
    setIsEditing(true);
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
      // Update selected team with new data temporarily for the view mode
      setSelectedTeam({ ...selectedTeam, ...editForm });
    } catch (error) {
      alert("Error saving team changes.");
    }
    setSaving(false);
  };

  const filteredTeams = teams.filter(t => {
    const qMatches = !search || t.team_name.toLowerCase().includes(search.toLowerCase()) || (t.custom_id && t.custom_id.toLowerCase().includes(search.toLowerCase()));
    const modeMatches = modeFilter === "ALL MODES" || t.mode === modeFilter;
    return qMatches && modeMatches;
  });

  return (
    <div className="admin-panel active">
      <div className="admin-section-title">TEAM MANAGEMENT</div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <input 
            className="search-input" 
            placeholder="Search teams..." 
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
                <th>TEAM ID</th>
                <th>TEAM NAME</th>
                <th>LEADER</th>
                <th>MODE</th>
                <th>PLAYERS</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ff-muted)', padding: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>LOADING TEAMS...</td></tr>
              ) : filteredTeams.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--ff-muted)', padding: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.1em' }}>NO TEAMS FOUND</td></tr>
              ) : (
                filteredTeams.map((team) => (
                  <tr key={team.id}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ff-orange)' }}>{team.custom_id || team.id.split("-")[0]}</span></td>
                    <td><strong>{team.team_name}</strong></td>
                    <td>{team.leader_name}</td>
                    <td><span className={`mode-tag ${team.mode.toLowerCase()}`}>{team.mode}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{team.players?.length || "—"}</td>
                    <td><span className="status-badge status-registered">REGISTERED</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="action-btn" onClick={() => handleView(team)}>VIEW</button>
                        <button className="action-btn" onClick={() => handleEdit(team)}>EDIT</button>
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

      {/* TEAM MODAL OVERLAY */}
      {selectedTeam && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="dash-card" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button 
              onClick={handleCloseModal}
              style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--ff-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
            >
              ×
            </button>
            
            <div className="admin-section-title" style={{ marginTop: 0 }}>
              {isEditing ? 'EDIT TEAM' : 'TEAM DETAILS'}
            </div>

            {isEditing ? (
              // EDIT FORM
              <div className="form-row" style={{ flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Team Name</label>
                  <input className="form-input" value={editForm.team_name} onChange={e => setEditForm({...editForm, team_name: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Leader Name</label>
                    <input className="form-input" value={editForm.leader_name} onChange={e => setEditForm({...editForm, leader_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Match Mode</label>
                    <select className="form-input" value={editForm.mode} onChange={e => setEditForm({...editForm, mode: e.target.value})} style={{ background: 'var(--ff-card)', color: 'var(--ff-text)' }}>
                      <option value="CS">CS MODE</option>
                      <option value="BR">BR MODE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Email</label>
                    <input className="form-input" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button className="btn-secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>CANCEL</button>
                  <button className="btn-primary" onClick={handleSaveTeam} disabled={saving} style={{ flex: 2 }}>
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                  </button>
                </div>
              </div>
            ) : (
              // VIEW DETAILS
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>TEAM NAME</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--ff-orange)' }}>{selectedTeam.team_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>REGISTRATION ID</div>
                    <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-mono)' }}>{selectedTeam.custom_id || selectedTeam.id.split("-")[0]}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>LEADER</div>
                    <div>{selectedTeam.leader_name}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>MODE</div>
                    <div><span className={`mode-tag ${selectedTeam.mode.toLowerCase()}`}>{selectedTeam.mode}</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>EMAIL</div>
                    <div>{selectedTeam.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--ff-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '0.2rem' }}>PHONE</div>
                    <div>{selectedTeam.phone}</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--ff-border)', paddingTop: '1.5rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ff-orange)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: '1rem' }}>REGISTERED PLAYERS ({selectedTeam.players?.length || 0})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedTeam.players && selectedTeam.players.map((p: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--ff-card2)', borderRadius: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{p.in_game_name}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ff-muted)' }}>UID: {p.game_uid}</span>
                      </div>
                    ))}
                    {(!selectedTeam.players || selectedTeam.players.length === 0) && (
                      <div style={{ color: 'var(--ff-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>No player details found.</div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button className="btn-secondary" onClick={() => setIsEditing(true)} style={{ flex: 1 }}>EDIT TEAM INFO</button>
                  <button className="action-btn btn-delete" onClick={() => handleDeleteTeam(selectedTeam.id)} style={{ padding: '0.8rem 1.5rem' }}>DELETE TEAM</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
