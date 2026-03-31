"use client";

import { useState } from "react";
import Link from "next/link";
import "./RegistrationForm.css";

interface Player {
  id: string;
  name: string;
  uid: string;
}

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [uid, setUid] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mode, setMode] = useState<"CS" | "BR" | "">("");
  const [termsagreed, setTermsagreed] = useState(false);
  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "", uid: "" },
    { id: "2", name: "", uid: "" },
    { id: "3", name: "", uid: "" },
    { id: "4", name: "", uid: "" }
  ]);

  const [teamId, setTeamId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    let newErrors: Record<string, string> = {};
    if (teamName.length < 2) newErrors.teamName = "Team name is required";
    if (leaderName.length < 2) newErrors.leaderName = "Leader name required";
    if (!/^\d{8,12}$/.test(uid.replace(/\s/g, ''))) newErrors.uid = "Valid UID required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Valid email required";
    if (phone.replace(/\D/g, '').length < 8) newErrors.phone = "Phone number required";
    if (!mode) newErrors.mode = "Please select a mode";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let isValid = players.every(p => p.name.trim() !== "" && p.uid.trim() !== "");
    if (!isValid) {
      setErrors({ players: "Please fill all player fields" });
    } else {
      setErrors({});
    }
    return isValid;
  };

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, { id: Date.now().toString(), name: "", uid: "" }]);
    }
  };

  const removePlayer = () => {
    if (players.length > 4) {
      setPlayers(players.slice(0, -1));
    }
  };

  const updatePlayer = (index: number, field: "name" | "uid", value: string) => {
    const newPlayers = [...players];
    newPlayers[index][field] = value;
    setPlayers(newPlayers);
  };

  const nextStep = (n: number) => {
    if (n === 2 && !validateStep1()) return;
    if (n === 3 && !validateStep2()) return;
    setStep(n);
  };

  const handleSubmit = async () => {
    if (!termsagreed) {
      setErrors({ terms: "You must agree to the terms" });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    
    try {
      const payload = {
        teamName,
        leaderName,
        email,
        phone,
        mode,
        players: players.map((p, i) => ({ ...p, name: i === 0 ? leaderName : p.name })) // ensure leader is part of players if needed, or just send array
      };
      
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to register");
      
      setTeamId(data.teamId || `FF-2025-${Math.floor(1000 + Math.random() * 9000)}`);
      setSuccess(true);
    } catch (err: any) {
      alert(`Registration Failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="success-page">
        <div className="success-icon">✓</div>
        <div className="success-title">SQUAD ENLISTED!</div>
        <p className="success-desc">Your registration is confirmed. Check your email for match details and room credentials.</p>

        <div className="team-id-box">
          <div className="team-id-label">YOUR TEAM ID</div>
          <div className="team-id">{teamId}</div>
        </div>

        <div style={{ background: 'var(--ff-card)', border: '1px solid var(--ff-border)', borderRadius: '8px', padding: '1.5rem', textAlign: 'left' }}>
          <div className="section-label" style={{ marginBottom: '0.75rem' }}>REGISTRATION DETAILS</div>
          <table className="detail-table">
            <tbody>
              <tr><td>Team Name</td><td><strong>{teamName}</strong></td></tr>
              <tr><td>Leader</td><td>{leaderName}</td></tr>
              <tr><td>Mode</td><td><span className={`mode-tag ${mode.toLowerCase()}`}>{mode} MODE</span></td></tr>
              <tr><td>Players</td><td>{players.length} registered</td></tr>
              <tr><td>Email</td><td>{email}</td></tr>
              <tr><td>Status</td><td><span className="status-badge status-registered">REGISTERED</span></td></tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="https://chat.whatsapp.com/LQDRfrdRLDP0b3KUSUYD3r?mode=gi_t" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ background: '#25D366', color: '#000', borderColor: '#25D366' }}>
            JOIN WHATSAPP GROUP
          </a>
          <Link href="/" className="btn-secondary">← BACK TO HOME</Link>
          <button className="btn-secondary" onClick={() => window.location.reload()}>REGISTER ANOTHER TEAM</button>
        </div>

        <div style={{ marginTop: '2rem', background: 'rgba(0,191,255,0.08)', border: '1px solid rgba(0,191,255,0.2)', borderRadius: '6px', padding: '1rem 1.25rem', textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.15em', color: 'var(--ff-info)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>NEXT STEPS</div>
          <p style={{ fontSize: '0.85rem', color: 'var(--ff-muted)', lineHeight: '1.7' }}>
            • Confirmation email sent to your registered address<br />
            • Room ID + password shared 15 min before match<br />
            • Join our WhatsApp group via link in email<br />
            • Be in the room 5 minutes before start time
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.12em', color: 'var(--ff-muted)', cursor: 'pointer', transition: 'color 0.2s' }}>← BACK TO HOME</Link>
      </div>
      
      <div className="form-card">
        <div className="form-header">
          <div className="section-label">// TEAM REGISTRATION</div>
          <div className="form-title">ENLIST YOUR SQUAD</div>
          <p style={{ color: 'var(--ff-muted)', fontSize: '0.9rem' }}>Fill in all details accurately. You'll receive a confirmation email after submission.</p>
        </div>

        {/* STEP INDICATOR */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div className="step-ind" style={{ height: '3px', flex: 1, background: 'var(--grad-fire)', borderRadius: '2px' }}></div>
          <div className="step-ind" style={{ height: '3px', flex: 1, background: step >= 2 ? 'var(--grad-fire)' : 'var(--ff-border)', borderRadius: '2px', transition: 'background 0.3s' }}></div>
          <div className="step-ind" style={{ height: '3px', flex: 1, background: step >= 3 ? 'var(--grad-fire)' : 'var(--ff-border)', borderRadius: '2px', transition: 'background 0.3s' }}></div>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <div className="section-label" style={{ marginBottom: '1rem' }}>STEP 1 · TEAM INFO</div>
            
            <div className="form-group">
              <label className="form-label">Team Name *</label>
              <input className="form-input" type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. PHANTOM SQUAD" />
              {errors.teamName && <span className="error-msg show">{errors.teamName}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Leader Name *</label>
                <input className="form-input" type="text" value={leaderName} onChange={e => setLeaderName(e.target.value)} placeholder="Your in-game name" />
                {errors.leaderName && <span className="error-msg show">{errors.leaderName}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Game UID *</label>
                <input className="form-input" type="text" value={uid} onChange={e => setUid(e.target.value)} placeholder="12-digit UID" />
                {errors.uid && <span className="error-msg show">{errors.uid}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Email *</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="team@email.com" />
                {errors.email && <span className="error-msg show">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                {errors.phone && <span className="error-msg show">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Match Mode *</label>
              <div className="mode-selector">
                <div className={`mode-opt ${mode === 'CS' ? 'selected' : ''}`} onClick={() => setMode('CS')}>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: '0.2rem', opacity: 0.7 }}>MODE</div>
                  CLASH SQUAD
                </div>
                <div className={`mode-opt ${mode === 'BR' ? 'selected' : ''}`} onClick={() => setMode('BR')}>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: '0.2rem', opacity: 0.7 }}>MODE</div>
                  BATTLE ROYALE
                </div>
              </div>
              {errors.mode && <span className="error-msg show">{errors.mode}</span>}
            </div>
            
            <button className="form-submit" onClick={() => nextStep(2)}>NEXT: PLAYER DETAILS →</button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <div className="section-label" style={{ marginBottom: '1rem' }}>STEP 2 · PLAYER DETAILS</div>
            <div className="players-section">
              <div className="players-header">
                <span className="players-title">PLAYERS (MIN 4, MAX 6)</span>
                <div className="player-controls">
                  <button className="ctrl-btn" onClick={removePlayer} title="Remove player" disabled={players.length <= 4}>−</button>
                  <button className="ctrl-btn" onClick={addPlayer} title="Add player" disabled={players.length >= 6}>+</button>
                </div>
              </div>
              
              <div id="players-list">
                {players.map((p, i) => (
                  <div className="player-slot" key={i}>
                    <span className="player-num">P{i + 1}</span>
                    <input className="form-input" placeholder="Player name" value={p.name} onChange={e => updatePlayer(i, 'name', e.target.value)} style={{ fontSize: '0.85rem', padding: '0.6rem 0.8rem' }} />
                    <input className="form-input" placeholder="Game UID" value={p.uid} onChange={e => updatePlayer(i, 'uid', e.target.value)} style={{ fontSize: '0.85rem', padding: '0.6rem 0.8rem' }} />
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--ff-muted)', letterSpacing: '0.08em', marginTop: '0.5rem' }}>{players.length} / 6 players</div>
            </div>
            {errors.players && <span className="error-msg show">{errors.players}</span>}
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={() => nextStep(1)} style={{ flex: 1, padding: '0.9rem' }}>← BACK</button>
              <button className="form-submit" style={{ flex: 2, marginTop: 0 }} onClick={() => nextStep(3)}>REVIEW REGISTRATION →</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <div className="section-label" style={{ marginBottom: '1rem' }}>STEP 3 · REVIEW & CONFIRM</div>
            
            <div style={{ background: 'var(--ff-card2)', borderRadius: '8px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div className="section-label" style={{ marginBottom: '0.75rem' }}>TEAM INFO</div>
              <table className="detail-table" style={{ marginTop: 0 }}>
                <tbody>
                  <tr><td>Team Name</td><td><strong>{teamName}</strong></td></tr>
                  <tr><td>Leader</td><td>{leaderName}</td></tr>
                  <tr><td>Leader UID</td><td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ff-orange)' }}>{uid}</span></td></tr>
                  <tr><td>Email</td><td>{email}</td></tr>
                  <tr><td>Phone</td><td>{phone}</td></tr>
                  <tr><td>Mode</td><td><span className={`mode-tag ${mode.toLowerCase()}`}>{mode} MODE</span></td></tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: 'var(--ff-card2)', borderRadius: '8px', padding: '1.25rem' }}>
              <div className="section-label" style={{ marginBottom: '0.75rem' }}>PLAYERS ({players.length})</div>
              {players.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--ff-border)', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--ff-orange)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>P{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--ff-muted)' }}>{p.uid}</span>
                </div>
              ))}
            </div>

            <div className="divider"></div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input type="checkbox" id="terms-check" checked={termsagreed} onChange={e => setTermsagreed(e.target.checked)} style={{ accentColor: 'var(--ff-orange)', marginTop: '3px', width: '15px', height: '15px' }} />
              <label htmlFor="terms-check" style={{ fontSize: '0.85rem', color: 'var(--ff-muted)', cursor: 'pointer', lineHeight: 1.5 }}>I confirm all information is accurate and I agree to the tournament rules and code of conduct.</label>
            </div>
            {errors.terms && <span className="error-msg show">{errors.terms}</span>}
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => nextStep(2)} style={{ flex: 1, padding: '0.9rem' }} disabled={isSubmitting}>← BACK</button>
              <button className="form-submit" style={{ flex: 2, marginTop: 0 }} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "REGISTERING..." : "CONFIRM REGISTRATION ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
