"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { getLandingPayments } from "@/app/admin/actions";
import Toast from "./Toast";
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
  const [paymentOptions, setPaymentOptions] = useState<any[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'warning' | null}>({ msg: "", type: null });

  // Form State
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [uid, setUid] = useState("");
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

  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [waGroupLink, setWaGroupLink] = useState("https://chat.whatsapp.com/LQDRfrdRLDP0b3KUSUYD3r");

  const notify = (msg: string, type: 'success' | 'error' | 'warning') => {
    setToast({ msg, type });
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [data, settings] = await Promise.all([
          getLandingPayments(),
          import("@/app/admin/actions").then(m => m.getGlobalSettings())
        ]);
        const active = data.filter((p: any) => p.is_active);
        setPaymentOptions(active);
        if (active.length > 0) setSelectedPayment(active[0]);
        if (settings?.whatsapp_group_link) setWaGroupLink(settings.whatsapp_group_link);
      } catch (err) {
        notify("PAYMENT OPTIONS OFFLINE", "warning");
      }
    }
    loadData();
  }, []);

  const validateStep1 = () => {
    let newErrors: Record<string, string> = {};
    if (teamName.length < 2) newErrors.teamName = "Team designation required";
    if (leaderName.length < 2) newErrors.leaderName = "Leader IGN required";
    if (!/^\d{8,12}$/.test(uid.replace(/\s/g, ''))) newErrors.uid = "12-digit UID required";
    if (phone.replace(/\D/g, '').length < 8) newErrors.phone = "WhatsApp contact required";
    if (!mode) newErrors.mode = "Select competition mode";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) notify("FIX HIGHLIGHTED FIELDS", "error");
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let isValid = players.every(p => p.name.trim() !== "" && p.uid.trim() !== "");
    if (!isValid) {
      setErrors({ players: "ROSTER INCOMPLETE" });
      notify("ALL SQUAD MEMBERS MUST BE ENLISTED", "error");
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
    if (n === 4) {
      if (!termsagreed) {
        setErrors({ terms: "TERMS ACCEPTANCE REQUIRED" });
        notify("YOU MUST AGREE TO THE CODE OF CONDUCT", "warning");
        return;
      }
    }
    setStep(n);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
      setErrors({ ...errors, payment: "" });
      notify("PAYMENT PROOF ATTACHED", "success");
    }
  };

  const handleSubmit = async () => {
    if (!paymentScreenshot) {
      setErrors({ payment: "PAYMENT PROOF REQUIRED" });
      notify("UPLOAD TRANSACTION SCREENSHOT", "error");
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    setUploading(true);
    
    try {
      const fileExt = paymentScreenshot.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, paymentScreenshot);

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      const payload = {
        teamName,
        leaderName,
        phone,
        mode,
        players: players.map((p, i) => ({ ...p, name: i === 0 ? leaderName : p.name })),
        paymentScreenshotUrl: publicUrl
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
      notify("ENLISTMENT SUCCESSFUL", "success");
    } catch (err: any) {
      notify(`ENLISTMENT FAILED: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
      setUploading(false);
    }
  };
  
  if (success) {
    const whatsappMessage = `\u{1F525} *FF SCRIMS - REGISTRATION CONFIRMED* \u{1F525}\n` +
      `----------------------------------------\n` +
      `\u{2705} *TEAM ENLISTED:* ${teamName}\n` +
      `\u{1F194} *TEAM ID:* ${teamId}\n` +
      `\u{1F552} *REGISTERED:* ${new Date().toLocaleDateString('en-GB')}\n\n` +
      `\u{1F464} *LEADER:* ${leaderName}\n` +
      `\u{1F3AE} *MODE:* ${mode} MODE\n\n` +
      `\u{1F465} *SQUAD MEMBERS:*\n${players.map((p, i) => `${i + 1}. ${i === 0 ? leaderName : p.name} (UID: ${i === 0 ? uid : p.uid})`).join('\n')}\n\n` +
      `\u{1F4CC} *JOIN OFFICIAL WHATSAPP GROUP:*\n` +
      `${waGroupLink}\n` +
      `----------------------------------------\n` +
      `_Match details (Room ID/Pass) will be shared via WhatsApp 15 mins before start._`;

    return (
      <div className="success-page animate-up">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1 className="success-title">SQUAD ENLISTED</h1>
          <p className="success-desc">
            Welcome to the elite. Your registration is confirmed. We are now verifying your payment details.
          </p>

          <div className="team-id-box-luxe">
            <div className="team-id-label">OFFICIAL TEAM ID</div>
            <div className="team-id">{teamId}</div>
          </div>

          <div className="registration-details-luxe" style={{ textAlign: 'left', marginTop: '2rem', borderTop: '1px solid var(--rose-100)', paddingTop: '2rem' }}>
            <div className="section-label" style={{ marginBottom: '1rem' }}>ENROLLMENT SUMMARY</div>
            <table className="detail-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody style={{ color: 'var(--ff-muted)', fontSize: '0.95rem' }}>
                <tr style={{ height: '40px', borderBottom: '1px solid var(--rose-50)' }}>
                  <td style={{ fontWeight: 600, color: 'var(--rose-900)' }}>Team Name</td>
                  <td style={{ textAlign: 'right' }}>{teamName}</td>
                </tr>
                <tr style={{ height: '40px', borderBottom: '1px solid var(--rose-50)' }}>
                  <td style={{ fontWeight: 600, color: 'var(--rose-900)' }}>Mode</td>
                  <td style={{ textAlign: 'right', color: 'var(--ff-primary)', fontWeight: 800 }}>{mode}</td>
                </tr>
                <tr style={{ height: '40px' }}>
                  <td style={{ fontWeight: 600, color: 'var(--rose-900)' }}>Leader</td>
                  <td style={{ textAlign: 'right' }}>{leaderName}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="success-actions">
            <a 
              href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary" 
              style={{ background: '#25D366', color: '#000', borderColor: '#25D366' }}
            >
              WHATSAPP RECEIPT
            </a>
            <Link href="/" className="btn-secondary" style={{ background: 'rgba(255,140,0,0.1)', borderColor: 'var(--ff-primary)', color: 'var(--ff-primary)' }}>
              BATTLE LOGS PORTAL
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page animate-up">
      <Toast message={toast.msg} type={toast.type} onClear={() => setToast({ msg: "", type: null })} />

      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.2em', color: 'var(--rose-400)', fontWeight: 700, textDecoration: 'none' }}>← BACK TO ARENA</Link>
      </div>
      
      <div className="form-card">
        <div className="form-header">
          <div className="step-indicator">STEP 0{step} OF 04</div>
          <h1 className="form-title">
            {step === 1 && "SQUAD IDENTITY"}
            {step === 2 && "THE LINEUP"}
            {step === 3 && "FINAL REVIEW"}
            {step === 4 && "VERIFICATION"}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
             {[1,2,3,4].map(s => (
                <div key={s} style={{ width: '40px', height: '4px', borderRadius: '2px', background: s <= step ? 'var(--ff-primary)' : 'var(--rose-100)', transition: 'all 0.4s' }}></div>
             ))}
          </div>
        </div>

        {step === 1 && (
          <div className="animate-up">
            <div className="form-group">
              <label className="form-label">TEAM DESIGNATION *</label>
              <input className="form-input" type="text" value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="ENTER TEAM NAME" />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">LEADER IGN *</label>
                <input className="form-input" type="text" value={leaderName} onChange={e => setLeaderName(e.target.value)} placeholder="GAME NAME" />
              </div>
              <div className="form-group">
                <label className="form-label">GAME UID *</label>
                <input className="form-input" type="text" value={uid} onChange={e => setUid(e.target.value)} placeholder="12-DIGIT ID" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">WHATSAPP CONTACT *</label>
              <input className="form-input" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91..." />
            </div>

            <div className="form-group">
              <label className="form-label">COMPETITION MODE *</label>
              <div className="mode-selector">
                <div className={`mode-opt ${mode === 'CS' ? 'selected' : ''}`} onClick={() => setMode('CS')}>CLASH SQUAD</div>
                <div className={`mode-opt ${mode === 'BR' ? 'selected' : ''}`} onClick={() => setMode('BR')}>BATTLE ROYALE</div>
              </div>
            </div>
            
            <button className="form-submit" onClick={() => nextStep(2)}>CONTINUE LINEUP</button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-up">
            <div className="players-section">
              <div className="players-header">
                <span className="players-title">ROSTER ENROLLMENT</span>
                <div className="player-controls">
                  <button className="ctrl-btn" onClick={removePlayer} disabled={players.length <= 4}>−</button>
                  <button className="ctrl-btn" onClick={addPlayer} disabled={players.length >= 6}>+</button>
                </div>
              </div>
              
              <div id="players-list">
                {players.map((p, i) => (
                  <div className="player-slot" key={i}>
                    <span className="player-num">0{i + 1}</span>
                    <input className="form-input" placeholder="NAME" value={p.name} onChange={e => updatePlayer(i, 'name', e.target.value)} />
                    <input className="form-input" placeholder="GAME UID" value={p.uid} onChange={e => updatePlayer(i, 'uid', e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-secondary" onClick={() => nextStep(1)} style={{ flex: 1 }}>BACK</button>
              <button className="form-submit" style={{ flex: 2, marginTop: 0 }} onClick={() => nextStep(3)}>REVIEW LINEUP</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-up">
            <div style={{ background: 'rgba(255,140,0,0.03)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', border: '1px solid var(--ff-primary)' }}>
              <h3 style={{ fontFamily: 'var(--font-head)', color: 'var(--ff-primary)', marginBottom: '1rem' }}>{teamName}</h3>
              <p style={{ color: 'var(--ff-muted)', fontSize: '0.8rem' }}>MODE: {mode}</p>
              <p style={{ color: 'var(--ff-muted)', fontSize: '0.8rem' }}>LEADER: {leaderName} ({uid})</p>
            </div>

            <div style={{ background: '#FFF', border: '1px solid var(--rose-100)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
              <div className="section-label">CONFIRMED ROSTER</div>
              {players.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--rose-50)' }}>
                  <span style={{ fontWeight: 800 }}>0{i+1}</span>
                  <span>{p.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6 }}>{p.uid}</span>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <input type="checkbox" checked={termsagreed} onChange={e => setTermsagreed(e.target.checked)} />
              <label style={{ fontSize: '0.8rem', opacity: 0.7 }}>I confirm that all details are correct.</label>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>BACK</button>
              <button className="form-submit" style={{ flex: 2, marginTop: 0 }} onClick={() => nextStep(4)}>PAYMENT</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-up">
            <div className="payment-options-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {paymentOptions.map((pay) => (
                <div 
                  key={pay.id} 
                  onClick={() => setSelectedPayment(pay)}
                  style={{ 
                    cursor: 'pointer', 
                    border: selectedPayment?.id === pay.id ? '2px solid var(--ff-primary)' : '1px solid var(--rose-100)',
                    padding: '1rem',
                    borderRadius: '16px',
                    background: selectedPayment?.id === pay.id ? 'rgba(255,140,0,0.05)' : '#FFF',
                    opacity: selectedPayment?.id === pay.id ? 1 : 0.5
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.7rem', color: 'var(--ff-primary)', marginBottom: '0.5rem' }}>{pay.label}</div>
                  <img src={pay.qr_url} style={{ width: '100%', borderRadius: '4px' }} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, marginTop: '0.5rem', textAlign: 'center' }}>{pay.fee || '₹ FREE'}</div>
                </div>
              ))}
            </div>

            <div className="form-group" style={{ background: 'var(--rose-50)', padding: '2rem', borderRadius: '20px', border: '1px dashed var(--ff-primary)', textAlign: 'center' }}>
               <input type="file" onChange={handleFileChange} style={{ cursor: 'pointer' }} />
               <p style={{ fontSize: '0.7rem', color: 'var(--ff-muted)', marginTop: '0.5rem' }}>IMAGE FILES ONLY</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-secondary" onClick={() => setStep(3)} style={{ flex: 1 }} disabled={isSubmitting}>BACK</button>
              <button className="form-submit" style={{ flex: 2, marginTop: 0 }} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "PROCESSING..." : "FINALIZE REGISTRATION"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
