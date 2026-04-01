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
  const [toast, setToast] = useState<{id: number, msg: string, type: 'success' | 'error' | 'warning' | null}>({ id: 0, msg: "", type: null });

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
    setToast(prev => ({ id: prev.id + 1, msg, type }));
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

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
        setErrors({ terms: "CONFIRMATION REQUIRED" });
        notify("PLEASE CONFIRM ALL DETAILS ARE CORRECT", "warning");
        return;
      }
    }
    setErrors({});
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
    const whatsappMessage = `*🎮 FF SCRIMS - REGISTRATION CONFIRMED 🎮*\n\n` +
      `🏆 *TEAM:* ${teamName}\n` +
      `🆔 *TEAM ID:* ${teamId}\n` +
      `📅 *DATE:* ${new Date().toLocaleDateString('en-GB')}\n\n` +
      `👑 *LEADER:* ${leaderName}\n` +
      `🎯 *MODE:* ${mode} MODE\n\n` +
      `👥 *SQUAD MEMBERS:*\n${players.map((p, i) => `${i + 1}. ${i === 0 ? leaderName : p.name} (UID: ${i === 0 ? uid : p.uid})`).join('\n')}\n\n` +
      `📲 *JOIN OFFICIAL WHATSAPP GROUP:*\n` +
      `${waGroupLink}\n\n` +
      `----------------------------------------\n` +
      `⏰ _Match details (Room ID/Pass) will be shared via WhatsApp 15 mins before start._`;

    return (
      <div className="success-page animate-up">
        <div className="success-card" style={{ padding: '0', overflow: 'hidden' }}>
          
          <div style={{ background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, rgba(17,17,17,0) 100%)', padding: '4rem 2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="success-icon" style={{ background: 'linear-gradient(135deg, #10B981, #059669)', border: 'none', color: '#000', boxShadow: '0 15px 40px rgba(16,185,129,0.4)', fontSize: '4rem', width: '100px', height: '100px' }}>🛡️</div>
            <h1 className="success-title" style={{ fontSize: 'max(2rem, 5vw)', letterSpacing: '0.05em' }}>SQUAD ENLISTED</h1>
            <p className="success-desc" style={{ fontSize: '1rem', opacity: 0.7, maxWidth: '400px', margin: '0 auto' }}>
              Welcome to the elite tournament. Your roster has been securely registered and is pending payment verification.
            </p>
          </div>

          <div style={{ padding: '3rem 2rem' }}>
            <div className="team-id-box-luxe" style={{ background: '#000', border: '1px solid rgba(255,140,0,0.3)', padding: '2rem 1rem', width: '100%', maxWidth: '100%', borderRadius: '16px', margin: '0 0 2rem 0', wordBreak: 'break-word' }}>
              <div className="team-id-label" style={{ color: 'var(--ff-primary)', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>OFFICIAL SECURE ID</div>
              <div className="team-id" style={{ fontSize: 'clamp(1.1rem, 6vw, 2.5rem)', letterSpacing: '0.05em', background: 'linear-gradient(90deg, #FFF, #AAA)', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent', fontFamily: 'var(--font-mono)' }}>{teamId}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', textAlign: 'left', marginBottom: '3rem' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ff-primary)', letterSpacing: '0.2em', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,140,0,0.2)', paddingBottom: '0.8rem' }}>MISSION MANIFEST</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="manifest-row">
                   <span style={{ color: 'var(--ff-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Squad Name</span>
                   <span style={{ color: '#FFF', fontWeight: 900, fontSize: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{teamName}</span>
                </div>
                <div className="manifest-row">
                   <span style={{ color: 'var(--ff-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Competition Mode</span>
                   <span style={{ color: 'var(--ff-primary)', fontWeight: 900, fontSize: '1rem' }}>{mode === 'CS' ? 'CLASH SQUAD' : 'BATTLE ROYALE'}</span>
                </div>
                <div className="manifest-row">
                   <span style={{ color: 'var(--ff-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Squad Leader</span>
                   <span style={{ color: '#FFF', fontWeight: 900, fontSize: '1rem' }}>{leaderName}</span>
                </div>
                <div className="manifest-row">
                   <span style={{ color: 'var(--ff-muted)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Payment Status</span>
                   <span className="animate-pulse" style={{ color: '#FBBF24', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                     <span style={{ fontSize: '0.9rem' }}>⏳</span> PENDING REVIEW
                   </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <a 
                href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#FFF', padding: '1.2rem', borderRadius: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'var(--font-head)', letterSpacing: '0.1em', fontSize: '1rem', boxShadow: '0 10px 30px rgba(37, 211, 102, 0.4)', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                REQUEST VERIFICATION <span>📲</span>
              </a>
              <Link href="/" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#FFF', padding: '1.2rem', borderRadius: '12px', fontWeight: 900, textDecoration: 'none', fontFamily: 'var(--font-head)', letterSpacing: '0.1em', fontSize: '1rem', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                BATTLE LOGS PORTAL <span>⚔️</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="form-page animate-up">
      <Toast key={toast.id} message={toast.msg} type={toast.type} onClear={() => setToast(prev => ({ ...prev, msg: "", type: null }))} />

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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                   <span style={{ color: 'var(--ff-muted)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>TEAM NAME</span>
                   <span style={{ color: 'var(--ff-primary)', fontWeight: 900, fontSize: '1.2rem', fontFamily: 'var(--font-head)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{teamName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                   <span style={{ color: 'var(--ff-muted)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>COMPETITION MODE</span>
                   <span style={{ color: '#FFF', fontWeight: 800, fontSize: '0.9rem' }}>{mode === 'CS' ? 'CLASH SQUAD' : 'BATTLE ROYALE'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.8rem' }}>
                   <span style={{ color: 'var(--ff-muted)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>SQUAD LEADER</span>
                   <span style={{ color: '#FFF', fontWeight: 800, fontSize: '0.9rem', textAlign: 'right' }}>{leaderName} <br/><span style={{ opacity: 0.5, fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>UID: {uid}</span></span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ color: 'var(--ff-muted)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>WHATSAPP CONTACT</span>
                   <span style={{ color: '#FFF', fontWeight: 800, fontSize: '0.9rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{phone}</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,140,0,0.2)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem' }}>
              <div className="section-label">CONFIRMED ROSTER</div>
              {players.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontWeight: 800, color: 'var(--ff-primary)' }}>0{i+1}</span>
                  <span style={{ color: '#FFF' }}>{i === 0 && p.name === "" ? leaderName : p.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6, color: '#FFF' }}>{i === 0 && p.uid === "" ? uid : p.uid}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: errors.terms ? 'rgba(244, 63, 94, 0.1)' : 'transparent', border: errors.terms ? '1px solid #F43F5E' : '1px transparent', borderRadius: '12px', transition: 'all 0.3s' }}>
                <input id="terms-check" type="checkbox" checked={termsagreed} onChange={e => { 
                  setTermsagreed(e.target.checked); 
                  setErrors({...errors, terms: ""});
                  if (e.target.checked && toast.msg.includes("CONFIRM")) {
                    setToast(prev => ({ ...prev, msg: "", type: null }));
                  }
                }} style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                <label htmlFor="terms-check" style={{ fontSize: '0.8rem', opacity: 0.9, color: errors.terms ? '#F43F5E' : '#FFF', cursor: 'pointer', userSelect: 'none' }}>I confirm that all details are correct.</label>
              </div>
              {errors.terms && <div className="animate-scale-in" style={{ color: '#F43F5E', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.1em', paddingLeft: '1rem', marginTop: '-0.3rem' }}>⚠ PLEASE CHECK THE CONFIRMATION BOX TO PROCEED</div>}
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
                    background: selectedPayment?.id === pay.id ? 'rgba(255,140,0,0.05)' : 'rgba(255,255,255,0.02)',
                    opacity: selectedPayment?.id === pay.id ? 1 : 0.6
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--ff-primary)', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>{pay.label}</div>
                  <img src={pay.qr_url} style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} alt="QR" />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.8rem' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFF' }}>{pay.fee || '₹ FREE'}</div>
                    {pay.upi_id && (
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.05em', marginTop: '0.3rem', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        ID: {pay.upi_id}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-group" style={{ position: 'relative', overflow: 'hidden', background: paymentScreenshot ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 140, 0, 0.03)', padding: '3.5rem 2rem', borderRadius: '24px', border: `2px dashed ${paymentScreenshot ? '#10B981' : 'var(--ff-primary)'}`, textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)' }}>
               {/* INVISIBLE HITBOX FOR DRAG & DROP AND CLICKING */}
               <input 
                 type="file" 
                 onChange={handleFileChange} 
                 accept="image/*"
                 style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} 
               />
               
               {/* VISUAL PRESENTATION */}
               <div style={{ pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem', transition: 'transform 0.3s', transform: paymentScreenshot ? 'scale(1.05)' : 'scale(1)' }}>
                 {paymentScreenshot ? (
                   <>
                     <div style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 10px 20px rgba(16,185,129,0.3))' }}>✅</div>
                     <span style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#10B981', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>RECEIPT ATTACHED</span>
                     <p style={{ fontSize: '0.85rem', color: '#FFF', fontFamily: 'var(--font-mono)' }}>{paymentScreenshot.name}</p>
                     <p style={{ fontSize: '0.65rem', color: 'var(--ff-muted)', marginTop: '0.5rem', fontWeight: 800, letterSpacing: '0.1em' }}>DRAG NEW FILE TO REPLACE</p>
                   </>
                 ) : (
                   <>
                     <div className="animate-scale-in" style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 10px 20px rgba(255,140,0,0.3))', marginBottom: '0.5rem' }}>🧾</div>
                     <span className="animate-scale-in" style={{ fontFamily: 'var(--font-head)', fontSize: '1.4rem', color: '#FFF', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>DROP RECEIPT HERE</span>
                     <p className="animate-scale-in" style={{ fontSize: '0.65rem', color: 'var(--ff-muted)', fontWeight: 800, letterSpacing: '0.1em' }}>ONLY JPG OR PNG FORMAT ACCEPTED</p>
                     
                     <div className="animate-up" style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, var(--ff-primary), #D97706)', padding: '0.8rem 2.8rem', borderRadius: '30px', color: '#000', fontFamily: 'var(--font-head)', fontWeight: 900, fontSize: '0.9rem', letterSpacing: '0.15em', boxShadow: '0 10px 30px rgba(255,140,0,0.3)' }}>
                        BROWSE DEVICE 📸
                     </div>
                   </>
                 )}
               </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn-secondary" onClick={() => { setPaymentScreenshot(null); setStep(3); }} style={{ flex: 1 }} disabled={isSubmitting}>BACK</button>
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
